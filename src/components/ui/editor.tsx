'use client';

import React, { useEffect, useRef, useState } from 'react';
import EditorJS, { OutputData } from '@editorjs/editorjs';
import Header from '@editorjs/header';
import List from '@editorjs/list';
import Paragraph from '@editorjs/paragraph';
import Quote from '@editorjs/quote';
import Code from '@editorjs/code';
import Embed from '@editorjs/embed';
import Delimiter from '@editorjs/delimiter';
import Table from '@editorjs/table';
import ImageTool from '@editorjs/image';

interface EditorProps {
  data: OutputData;
  onChange: (data: OutputData) => void;
  holder?: string; // Make optional since we'll generate it internally
}

const Editor: React.FC<EditorProps> = ({ data, onChange, holder: externalHolder }) => {
  const ref = useRef<EditorJS | null>(null);
  const [isReady, setIsReady] = useState(false);
  const isInitializing = useRef(false);
  const isMounted = useRef(true);
  const isDestroying = useRef(false);
  const cleanupTimeout = useRef<NodeJS.Timeout | null>(null);

  // Generate a stable holder ID once on mount
  const [holder] = useState(() =>
    externalHolder || `editorjs-${Math.random().toString(36).substring(2, 11)}`
  );

  const initialDataRef = useRef(data);

  // Update editor data when prop changes
  useEffect(() => {
    if (ref.current && isReady && data !== initialDataRef.current) {
      try {
        ref.current.render(data);
        initialDataRef.current = data;
      } catch (error) {
        console.warn('Error updating editor data:', error);
      }
    }
  }, [data, isReady]);

  useEffect(() => {
    isMounted.current = true;

    // Prevent multiple initializations
    if (isInitializing.current) {
      console.log('Editor already initializing, skipping...');
      return;
    }

    const initEditor = async () => {
      // Check if holder element exists
      const holderElement = document.getElementById(holder);
      if (!holderElement) {
        console.warn(`Editor holder element #${holder} not found`);
        return;
      }

      // Clean up any existing editor instance
      if (ref.current) {
        console.log('Cleaning up existing editor instance');
        try {
          if (ref.current.destroy) {
            ref.current.destroy();
          }
        } catch (error) {
          console.warn('Error destroying previous editor:', error);
        }
        ref.current = null;
      }

      isInitializing.current = true;
      console.log('Initializing Editor.js with data:', data);

      try {
        const editor = new EditorJS({
          holder: holder,
          placeholder: 'Click here to start writing your question...',
          data: initialDataRef.current,
          tools: {
            header: {
              class: Header as any,
              config: {
                placeholder: 'Enter a heading',
                levels: [1, 2, 3, 4],
                defaultLevel: 1
              }
            },
            list: {
              class: List as any,
              inlineToolbar: true,
              config: {
                defaultStyle: 'unordered'
              }
            },
            paragraph: {
              class: Paragraph as any,
              inlineToolbar: true,
            },
            quote: {
              class: Quote as any,
              inlineToolbar: true,
              config: {
                quotePlaceholder: 'Enter a quote',
                captionPlaceholder: 'Quote\'s author',
              },
            },
            code: {
              class: Code as any,
              config: {
                placeholder: 'Enter code'
              }
            },
            embed: Embed as any,
            delimiter: Delimiter as any,
            table: {
              class: Table as any,
              inlineToolbar: true,
              config: {
                rows: 2,
                cols: 3,
              },
            },
            image: {
              class: ImageTool as any,
              config: {
                uploader: {
                  /**
                   * Upload file to the server and return an uploaded image data
                   * @param {File} file - file selected from the device or pasted by drag-n-drop
                   * @return {Promise.<{success, file: {url}}>}
                   */
                  async uploadByFile(file: File) {
                    try {
                      console.log('Starting image upload:', file.name, file.type, file.size);

                      // Use the admin API client for image upload
                      const { default: adminAPI } = await import('@/lib/api-admin');
                      const response = await adminAPI.questions.uploadImage(file);

                      console.log('Upload response:', response);

                      // Check for errors
                      if (response.error) {
                        console.error('Upload failed with error:', response.error);
                        throw new Error('Upload failed');
                      }

                      // The API returns data wrapped in { message, meta, data: { success, file } }
                      const result = response.data;
                      console.log('Upload successful, result:', result);

                      // Check if result has the expected structure
                      if (result && typeof result === 'object') {
                        // Check if it's wrapped in data property
                        if ('data' in result && result.data && typeof result.data === 'object') {
                          const innerData = result.data as any;
                          if ('success' in innerData && 'file' in innerData) {
                            // Return the inner data which has Editor.js format
                            return {
                              success: innerData.success,
                              file: innerData.file
                            };
                          }
                        }
                        // Check if it's already in Editor.js format (direct success and file)
                        if ('success' in result && 'file' in result) {
                          return result as { success: number; file: { url: string; name?: string; size?: number; width?: number; height?: number } };
                        }
                      }

                      console.error('Unexpected API response format:', result);
                      throw new Error('Invalid response format from server');
                    } catch (error) {
                      console.error('Image upload error:', error);
                      return {
                        success: 0,
                        file: {
                          url: '',
                        },
                      };
                    }
                  },

                  /**
                   * Send URL-string to the server, return uploaded image data
                   * @param {string} url - pasted image URL
                   * @return {Promise.<{success, file: {url}}>}
                   */
                  async uploadByUrl(url: string): Promise<{ success: number; file: { url: string } }> {
                    try {
                      console.log('Starting image upload by URL:', url);

                      // Use the admin API client for image upload by URL
                      const { default: adminAPI } = await import('@/lib/api-admin');
                      const response = await adminAPI.questions.uploadImageByUrl(url);

                      console.log('Upload by URL response:', response);

                      // Check for errors
                      if (response.error) {
                        console.error('Upload by URL failed with error:', response.error);
                        throw new Error('Upload failed');
                      }

                      // The API returns data wrapped in { message, meta, data: { success, file } }
                      const result = response.data;
                      console.log('Upload by URL successful, result:', result);

                      // Check if result has the expected structure
                      if (result && typeof result === 'object') {
                        // Check if it's wrapped in data property
                        if ('data' in result && result.data && typeof result.data === 'object') {
                          const innerData = result.data as any;
                          if ('success' in innerData && 'file' in innerData) {
                            // Return the inner data which has Editor.js format
                            return {
                              success: innerData.success,
                              file: innerData.file
                            };
                          }
                        }
                        // Check if it's already in Editor.js format (direct success and file)
                        if ('success' in result && 'file' in result) {
                          return result as { success: number; file: { url: string; name?: string; size?: number; width?: number; height?: number } };
                        }
                      }

                      console.error('Unexpected API response format:', result);
                      throw new Error('Invalid response format from server');
                    } catch (error) {
                      console.error('Image upload by URL error:', error);
                      return {
                        success: 0,
                        file: {
                          url: '',
                        },
                      };
                    }
                  },
                },
                field: 'image',
                types: 'image/*',
                captionPlaceholder: 'Enter image caption',
                buttonContent: 'Select an Image',
              },
            },
          },
          onChange(api) {
            // Don't process changes if we're destroying or unmounted
            if (isDestroying.current || !isMounted.current) return;

            // Debounce the onChange to prevent excessive calls
            if (cleanupTimeout.current) {
              clearTimeout(cleanupTimeout.current);
            }

            cleanupTimeout.current = setTimeout(async () => {
              // Double check we're still mounted and not destroying
              if (!isMounted.current || isDestroying.current) return;

              try {
                const data = await api.saver.save();
                if (isMounted.current && !isDestroying.current) {
                  onChange(data);
                }
              } catch (error) {
                // Silently ignore errors during cleanup
                if (!isDestroying.current) {
                  console.error('Error saving editor data:', error);
                }
              }
            }, 300); // 300ms debounce
          },
          minHeight: 50,
        });

        await editor.isReady;

        if (isMounted.current) {
          ref.current = editor;
          setIsReady(true);
        } else {
          // Component unmounted during initialization, cleanup immediately
          try {
            editor.destroy();
          } catch (e) {
            console.warn('Cleanup during init:', e);
          }
        }
      } catch (error) {
        console.error('Error initializing editor:', error);
      } finally {
        isInitializing.current = false;
      }
    };

    // Small delay to ensure DOM is ready
    const timeoutId = setTimeout(() => {
      initEditor();
    }, 100);

    return () => {
      // Mark as destroying and unmounted immediately
      isDestroying.current = true;
      isMounted.current = false;
      isInitializing.current = false;
      setIsReady(false);

      // Clear all timeouts immediately
      clearTimeout(timeoutId);
      if (cleanupTimeout.current) {
        clearTimeout(cleanupTimeout.current);
        cleanupTimeout.current = null;
      }

      // Immediate synchronous cleanup
      if (ref.current) {
        const editorInstance = ref.current;
        ref.current = null;

        // Force destroy without any async operations
        try {
          // Clear the holder element first to prevent any rendering
          const holderElement = document.getElementById(holder);
          if (holderElement) {
            holderElement.innerHTML = '';
          }

          // Then destroy the editor instance
          if (typeof editorInstance.destroy === 'function') {
            editorInstance.destroy();
          }
        } catch (error) {
          // Completely ignore cleanup errors
        }
      }
    };
  }, []); // Empty dependency array - initialize only once!

  return (
    <div className="w-full">
      <div id={holder} className="prose prose-sm max-w-70 w-full" />
      {!isReady && (
        <div className="text-sm text-gray-500 mt-2">Loading editor...</div>
      )}
    </div>
  );
};

export default Editor;