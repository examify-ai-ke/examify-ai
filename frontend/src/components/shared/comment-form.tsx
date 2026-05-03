'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';

const Editor = dynamic(() => import('@/components/ui/editor'), {
  ssr: false,
  loading: () => <div className="text-sm text-gray-500 p-4">Loading editor...</div>
});

interface CommentFormProps {
  editorData: any;
  onEditorChange: (data: any) => void;
  onCancel: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  title?: string;
  submitLabel?: string;
  componentKey?: string | number;
}

export function CommentForm({ 
  editorData, 
  onEditorChange, 
  onCancel, 
  onSubmit, 
  isSubmitting,
  title = "Add a comment",
  submitLabel = "Post Comment",
  componentKey
}: CommentFormProps) {
  // Check if editor has content
  const hasContent = editorData?.blocks && editorData.blocks.length > 0;

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 animate-in fade-in slide-in-from-top-2 duration-200">
      <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
        <MessageSquare className="h-4 w-4 text-blue-500" />
        {title}
      </h4>
      
      <div className="min-h-[150px] border rounded-md bg-white">
        <Editor
          key={componentKey}
          data={editorData}
          onChange={onEditorChange}
          holder={`editor-comment-${componentKey || 'default'}`}
          placeholder="Write your comment here..."
        />
      </div>
      
      <div className="flex justify-end gap-3 mt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          size="sm"
          onClick={onSubmit}
          disabled={isSubmitting || !hasContent}
          className={`
            transition-all duration-200
            ${!hasContent 
              ? 'opacity-50 cursor-not-allowed bg-gray-400' 
              : 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
            }
          `}
          title={!hasContent ? 'Please enter some text' : 'Click to post'}
        >
          {isSubmitting ? 'Posting...' : submitLabel}
        </Button>
      </div>
    </div>
  );
}
