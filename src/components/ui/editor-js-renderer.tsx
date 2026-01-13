import React from 'react';
import type { OutputBlockData, OutputData } from "@editorjs/editorjs";
import Image from 'next/image';
// Define types for the block data structure
interface BlockData {
  text?: string;
  level?: number;
  style?: 'ordered' | 'unordered';
  items?: any[];
  file?: { url: string };
  url?: string;
  caption?: string;
  code?: string;
  embed?: string;
  height?: number;
  content?: string[][];
  withBorder?: boolean;
  withHeadings?: boolean;
  stretched?: boolean;
  [key: string]: unknown;
}

interface ChecklistItem {
  text: string;
  checked: boolean;
}

const EditorJsRenderer = ({ data }: { data: OutputData }) => {
  // Function to render each block based on its type
  const renderBlock = (block: OutputBlockData<string, BlockData>, index: number) => {
    const { id, type, data: blockData } = block;

    switch (type) {
      case 'header':
        // Use React.createElement for dynamic heading levels
        return React.createElement(
          `h${blockData.level ?? 2}`,
          { key: id ?? index, id: id ?? `header-${index}` },
          blockData.text
        );

      case 'paragraph':
        return (
          <p 
            key={id ?? `p-${index}`} 
            id={id ?? `p-${index}`} 
            dangerouslySetInnerHTML={blockData.text ? { __html: blockData.text } : undefined}
          />
        );

      case 'list':
        // Choose appropriate list style based on list type
        const listStyle = blockData.style === 'ordered' ? 'list-decimal' : 'list-disc';
        const ListTag = blockData.style === 'ordered' ? 'ol' : 'ul';
        
        // Debug: log the items structure
        if (blockData.items && blockData.items.length > 0) {
          console.log('List items structure:', {
            firstItem: blockData.items[0],
            itemType: typeof blockData.items[0],
            allItems: blockData.items
          });
        }
        
        return (
          <ListTag 
            key={id ?? `list-${index}`} 
            id={id ?? `list-${index}`} 
            className={`${listStyle} list-outside ml-5 mb-4 space-y-1`}
          >
            {blockData.items?.map((item, idx) => {
              // Handle different item formats
              let content = '';
              
              if (typeof item === 'string') {
                // Simple string format
                content = item;
              } else if (item && typeof item === 'object') {
                // Object format - try different possible properties
                const itemObj = item as any;
                content = itemObj.content || itemObj.text || itemObj.value || JSON.stringify(item);
              } else {
                // Fallback for unexpected formats
                content = String(item);
              }
              
              return (
                <li 
                  key={`${id ?? 'list'}-item-${idx}`}
                  dangerouslySetInnerHTML={{ __html: content }} 
                />
              );
            })}
          </ListTag>
        );

        // Then replace the image case in the switch statement
        case 'image':
            return (
                <figure key={id ?? `img-${index}`} id={id ?? `img-${index}`} className="my-4">
                    <Image
                        src={blockData.file?.url ?? blockData.url ?? ''}
                        alt={blockData.caption ?? ''}
                        width={600}
                        height={400}
                        className="rounded-lg"
                        style={{ maxWidth: '100%', height: 'auto' }}
                        priority={index === 0}
                    />
                    {blockData.caption && (
                      <figcaption className="text-sm text-gray-600 mt-2 text-center italic">
                        {blockData.caption}
                      </figcaption>
                    )}
                </figure>
            );

      case 'quote':
        return (
          <blockquote 
            key={id ?? `quote-${index}`} 
            id={id ?? `quote-${index}`}
            className="border-l-4 border-gray-300 pl-4 py-2 my-4 italic text-gray-700"
          >
            {blockData.text && (
              <p dangerouslySetInnerHTML={{ __html: blockData.text }} />
            )}
            {blockData.caption && (
              <cite className="block mt-2 text-sm text-gray-600 not-italic">
                — {blockData.caption}
              </cite>
            )}
          </blockquote>
        );

      case 'code':
        return (
          <pre key={id ?? `code-${index}`} id={id ?? `code-${index}`} className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto my-4">
            <code className="text-sm font-mono">{blockData.code}</code>
          </pre>
        );

      case 'embed':
        return (
          <div key={id ?? `embed-${index}`} id={id ?? `embed-${index}`} className="embed-block my-4">
            <iframe
              src={blockData.embed ?? ''}
              height={blockData.height ?? 320}
              style={{ border: 0 }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full rounded-lg"
            />
            {blockData.caption && <p className="text-sm text-gray-600 mt-2 text-center">{blockData.caption}</p>}
          </div>
        );

      case 'delimiter':
        return <hr key={id ?? `delimiter-${index}`} id={id ?? `delimiter-${index}`} className="my-6 border-t-2 border-gray-300" />;

      case 'checklist':
        return (
          <div key={id ?? `checklist-${index}`} id={id ?? `checklist-${index}`} className="space-y-2 my-4">
            {blockData.items?.map((item: any, idx: number) => {
              const checklistItem = item as ChecklistItem;
              return (
                <div key={`${id ?? 'checklist'}-item-${idx}`} className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    checked={checklistItem.checked}
                    readOnly
                    className="mt-1 h-4 w-4 rounded border-gray-300"
                  />
                  <span 
                    className={checklistItem.checked ? 'line-through text-gray-500' : ''}
                    dangerouslySetInnerHTML={{ __html: checklistItem.text }}
                  />
                </div>
              );
            })}
          </div>
        );

      case 'table':
        return (
          <div key={id ?? `table-${index}`} id={id ?? `table-${index}`} className="overflow-x-auto my-4">
            <table className={`min-w-full border-collapse ${blockData.withBorder ? 'border border-gray-300' : ''}`}>
              <tbody>
                {blockData.content?.map((row, rowIndex) => (
                  <tr key={`${id ?? 'table'}-row-${rowIndex}`} className="border-b border-gray-200">
                    {row.map((cell, cellIndex) => {
                      const isHeader = blockData.withHeadings && rowIndex === 0;
                      const CellTag = isHeader ? 'th' : 'td';
                      return (
                        <CellTag
                          key={`${id ?? 'table'}-cell-${rowIndex}-${cellIndex}`}
                          className={`px-4 py-2 text-left ${isHeader ? 'font-semibold bg-gray-50' : ''} ${blockData.withBorder ? 'border border-gray-300' : ''}`}
                          dangerouslySetInnerHTML={{ __html: cell }}
                        />
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      default:
        console.warn(`Block type "${type}" not supported`);
        return null;
    }
  };

  return (
    <div className="editorjs-content">
      {data?.blocks?.map(renderBlock) || <p>No content to display</p>}
    </div>
  );
};

 
export default EditorJsRenderer;