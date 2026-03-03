'use client';

import React from 'react';
import type { OutputData } from '@editorjs/editorjs';
import Image from 'next/image';

interface EditorRendererProps {
  data: OutputData;
  className?: string;
}

/**
 * EditorRenderer - Renders Editor.js content in read-only mode
 * 
 * Supports all Editor.js blocks:
 * - Paragraph
 * - Header (h1-h4)
 * - List (ordered/unordered)
 * - Quote
 * - Code
 * - Image
 * - Delimiter
 * - Table
 * - Embed
 */
const EditorRenderer: React.FC<EditorRendererProps> = ({ data, className = '' }) => {
  if (!data || !data.blocks || data.blocks.length === 0) {
    return null;
  }

  const renderBlock = (block: any, index: number) => {
    const key = `${block.type}-${index}`;

    switch (block.type) {
      case 'paragraph':
        return (
          <p
            key={key}
            className="mb-4 text-[1.05rem] md:text-lg leading-relaxed text-foreground/90"
            dangerouslySetInnerHTML={{ __html: block.data.text }}
          />
        );

      case 'header': {
        const level = block.data.level as 1 | 2 | 3 | 4 | 5 | 6;
        const HeaderTag = `h${level}` as keyof React.JSX.IntrinsicElements;
        const headerClasses: Record<number, string> = {
          1: 'text-3xl font-bold mb-4 mt-6',
          2: 'text-2xl font-bold mb-3 mt-5',
          3: 'text-xl font-semibold mb-3 mt-4',
          4: 'text-lg font-semibold mb-2 mt-3',
          5: 'text-base font-semibold mb-2 mt-3',
          6: 'text-base font-semibold mb-2 mt-3',
        };
        return (
          <HeaderTag
            key={key}
            className={headerClasses[level] || headerClasses[2]}
            dangerouslySetInnerHTML={{ __html: block.data.text }}
          />
        );
      }

      case 'list':
        const ListTag = block.data.style === 'ordered' ? 'ol' : 'ul';
        const listClass = block.data.style === 'ordered'
          ? 'list-decimal list-inside mb-4 space-y-1'
          : 'list-disc list-inside mb-4 space-y-1';
        return (
          <ListTag key={key} className={listClass}>
            {block.data.items.map((item: any, i: number) => {
              // Handle different item formats
              let content = '';
              
              if (typeof item === 'string') {
                // Simple string format
                content = item;
              } else if (item && typeof item === 'object') {
                // Object format - try different possible properties
                content = item.content || item.text || item.value || JSON.stringify(item);
              } else {
                // Fallback for unexpected formats
                content = String(item);
              }
              
              return (
                <li key={i} dangerouslySetInnerHTML={{ __html: content }} />
              );
            })}
          </ListTag>
        );

      case 'quote':
        return (
          <blockquote key={key} className="border-l-4 border-gray-300 pl-4 py-2 mb-4 italic">
            <p dangerouslySetInnerHTML={{ __html: block.data.text }} />
            {block.data.caption && (
              <cite className="block mt-2 text-sm text-gray-600 not-italic">
                — {block.data.caption}
              </cite>
            )}
          </blockquote>
        );

      case 'checklist':
        return (
          <div key={key} className="space-y-2 mb-4">
            {block.data.items?.map((item: any, idx: number) => (
              <div key={idx} className="flex items-start gap-2">
                <input
                  type="checkbox"
                  checked={item.checked}
                  readOnly
                  className="mt-1 h-4 w-4 rounded border-gray-300"
                />
                <span 
                  className={item.checked ? 'line-through text-gray-500' : ''}
                  dangerouslySetInnerHTML={{ __html: item.text }}
                />
              </div>
            ))}
          </div>
        );

      case 'code':
        return (
          <pre key={key} className="bg-gray-100 rounded p-4 mb-4 overflow-x-auto">
            <code className="text-sm font-mono">{block.data.code}</code>
          </pre>
        );

      case 'image':
        return (
          <figure key={key} className="mb-4">
            <div className="relative w-full">
              {block.data.file?.url && (
                <img
                  src={block.data.file.url}
                  alt={block.data.caption || 'Image'}
                  className={`
                    max-w-full h-auto rounded
                    ${block.data.stretched ? 'w-full' : 'mx-auto'}
                    ${block.data.withBorder ? 'border border-gray-300' : ''}
                    ${block.data.withBackground ? 'bg-gray-100 p-4' : ''}
                  `}
                  loading="lazy"
                />
              )}
            </div>
            {block.data.caption && (
              <figcaption className="text-sm text-gray-600 text-center mt-2">
                {block.data.caption}
              </figcaption>
            )}
          </figure>
        );

      case 'delimiter':
        return (
          <div key={key} className="flex justify-center my-6">
            <div className="flex space-x-2">
              <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
              <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
              <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
            </div>
          </div>
        );

      case 'table':
        // Validate table data structure
        if (!block.data.content || !Array.isArray(block.data.content)) {
          console.warn('Invalid table data structure:', block.data);
          return null;
        }
        
        return (
          <div key={key} className="mb-4 overflow-x-auto">
            <table className="min-w-full border-collapse border border-gray-300">
              <tbody>
                {block.data.content.map((row: any, rowIndex: number) => {
                  // Ensure row is an array
                  if (!Array.isArray(row)) {
                    console.warn('Invalid table row:', row);
                    return null;
                  }
                  
                  return (
                    <tr key={rowIndex}>
                      {row.map((cell: string, cellIndex: number) => (
                        <td
                          key={cellIndex}
                          className="border border-gray-300 px-4 py-2"
                          dangerouslySetInnerHTML={{ __html: cell }}
                        />
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );

      case 'embed':
        return (
          <div key={key} className="mb-4">
            <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
              <iframe
                src={block.data.embed}
                className="absolute top-0 left-0 w-full h-full rounded"
                style={{ border: 0 }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            {block.data.caption && (
              <p className="text-sm text-gray-600 text-center mt-2">{block.data.caption}</p>
            )}
          </div>
        );

      default:
        console.warn(`Unsupported block type: ${block.type}`);
        return null;
    }
  };

  return (
    <div className={`prose max-w-none text-foreground ${className}`}>
      {data.blocks.map((block, index) => renderBlock(block, index))}
    </div>
  );
};

export default EditorRenderer;
