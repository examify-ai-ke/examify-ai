import React from 'react';
import type { Block } from './types';

interface BlockRendererProps {
  blocks: Block[];
}

export const BlockRenderer: React.FC<BlockRendererProps> = ({ blocks }) => {
  return (
    <div>
      {blocks.map((block) => {
        switch (block.type) {
          case 'paragraph':
            return (
              <p
                key={block.id}
                className="mb-2 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: block.data.text || '' }}
              />
            );
          
          case 'header':
            const Tag = `h${block.data.level || 2}` as keyof JSX.IntrinsicElements;
            return React.createElement(Tag, {
              key: block.id,
              className: 'text-lg font-bold my-3',
              dangerouslySetInnerHTML: { __html: block.data.text || '' },
            });
          
          case 'image':
            if (!block.data.file) return null;
            return (
              <div key={block.id} className="my-4 text-center">
                <img
                  src={block.data.file.url}
                  alt={block.data.caption || 'Exam Image'}
                  className="max-w-full h-auto mx-auto border border-gray-300 p-1"
                />
                {block.data.caption && (
                  <p className="text-sm text-gray-600 mt-1 italic">{block.data.caption}</p>
                )}
              </div>
            );
          
          case 'code':
            return (
              <pre
                key={block.id}
                className="bg-gray-100 p-3 my-3 rounded font-mono text-sm overflow-x-auto border border-gray-300"
              >
                <code>{block.data.code}</code>
              </pre>
            );
          
          case 'list':
            const ListTag = block.data.style === 'ordered' ? 'ol' : 'ul';
            const listClass = block.data.style === 'ordered' 
              ? 'list-decimal list-inside space-y-1 my-3' 
              : 'list-disc list-inside space-y-1 my-3';
            return (
              <ListTag key={block.id} className={listClass}>
                {block.data.items?.map((item, index) => (
                  <li key={index} dangerouslySetInnerHTML={{ __html: item }} />
                ))}
              </ListTag>
            );
          
          case 'table':
            if (!block.data.content || !Array.isArray(block.data.content)) return null;
            return (
              <div key={block.id} className="my-4 overflow-x-auto">
                <table className="min-w-full border-collapse border border-gray-300">
                  <tbody>
                    {block.data.content.map((row, rowIndex) => (
                      <tr key={rowIndex} className={rowIndex === 0 && block.data.withHeadings ? 'bg-gray-100 font-semibold' : ''}>
                        {row.map((cell, cellIndex) => {
                          const CellTag = rowIndex === 0 && block.data.withHeadings ? 'th' : 'td';
                          return (
                            <CellTag
                              key={cellIndex}
                              className="border border-gray-300 px-3 py-2 text-left"
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
          
          case 'quote':
            return (
              <blockquote
                key={block.id}
                className="border-l-4 border-gray-400 pl-4 py-2 my-4 italic text-gray-700"
                dangerouslySetInnerHTML={{ __html: block.data.text || '' }}
              />
            );
          
          case 'delimiter':
            return (
              <div key={block.id} className="text-center my-6">
                <span className="text-2xl text-gray-400">* * *</span>
              </div>
            );
          
          case 'warning':
            return (
              <div key={block.id} className="bg-yellow-50 border-l-4 border-yellow-400 p-4 my-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700" dangerouslySetInnerHTML={{ __html: block.data.text || '' }} />
                  </div>
                </div>
              </div>
            );
          
          case 'raw':
            return (
              <div
                key={block.id}
                className="my-3"
                dangerouslySetInnerHTML={{ __html: block.data.text || '' }}
              />
            );
          
          default:
            return null;
        }
      })}
    </div>
  );
};
