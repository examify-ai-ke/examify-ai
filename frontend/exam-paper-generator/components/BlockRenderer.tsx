import React from 'react';
import type { Block } from '../types';

interface BlockRendererProps {
    blocks: Block[];
}

const BlockRenderer: React.FC<BlockRendererProps> = ({ blocks }) => {
    return (
        <div>
            {blocks.map(block => {
                switch (block.type) {
                    case 'paragraph':
                        return <p key={block.id} className="mb-2 leading-relaxed" dangerouslySetInnerHTML={{ __html: block.data.text || '' }}></p>;
                    case 'header':
                        // FIX: Replaced dynamic JSX tag with `React.createElement` to resolve errors related to missing JSX namespace and incorrect component signature.
                        // This is the correct way to dynamically render HTML elements based on a string tag name.
                        const Tag = `h${block.data.level || 2}`;
                        return React.createElement(Tag, {
                            key: block.id,
                            className: "text-lg font-bold my-3",
                            dangerouslySetInnerHTML: { __html: block.data.text || '' }
                        });
                    case 'image':
                        if (!block.data.file) return null;
                        return (
                            <div key={block.id} className="my-4 text-center">
                                <img src={block.data.file.url} alt={block.data.caption || 'Exam Image'} className="max-w-full h-auto mx-auto border border-gray-300 p-1" />
                                {block.data.caption && <p className="text-sm text-gray-600 mt-1 italic">{block.data.caption}</p>}
                            </div>
                        );
                    case 'code':
                        return (
                            <pre key={block.id} className="bg-gray-100 p-3 my-3 rounded font-mono text-sm overflow-x-auto">
                                <code>{block.data.code}</code>
                            </pre>
                        );
                    default:
                        return null;
                }
            })}
        </div>
    );
};

export default BlockRenderer;