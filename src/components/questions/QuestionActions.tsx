/**
 * QuestionActions Component
 * 
 * Shared dropdown menu for question actions (View, Edit, Delete, Add Sub-Question).
 * Handles loading state with spinner on affected action.
 */

'use client';

import { MoreHorizontal, Eye, Pencil, Trash2, Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { QuestionActionsProps } from './types';

export function QuestionActions({
  questionId,
  questionType,
  onView,
  onEdit,
  onDelete,
  onAddSubQuestion,
  isLoading = false,
}: QuestionActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          disabled={isLoading}
          aria-label={`Actions for question ${questionId}`}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <MoreHorizontal className="h-4 w-4" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {onView && (
          <DropdownMenuItem onClick={onView} disabled={isLoading}>
            <Eye className="mr-2 h-4 w-4" />
            View
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={onEdit} disabled={isLoading}>
          <Pencil className="mr-2 h-4 w-4" />
          Edit
        </DropdownMenuItem>
        {questionType === 'main' && onAddSubQuestion && (
          <DropdownMenuItem onClick={onAddSubQuestion} disabled={isLoading}>
            <Plus className="mr-2 h-4 w-4" />
            Add Sub-Question
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={onDelete}
          disabled={isLoading}
          variant="destructive"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
