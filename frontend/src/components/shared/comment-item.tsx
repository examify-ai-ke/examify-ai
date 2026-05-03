'use client';

import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown, Reply, Edit, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';
import { useUIStore } from '@/stores/ui';
import { publicAPI } from '@/lib/api-public';
import EditorRenderer from '@/components/ui/editor-renderer';
import { CommentForm } from './comment-form';

interface CommentItemProps {
  comment: any;
  onReply: (id: string) => void;
  depth?: number;
  activeReplyId: string | null;
  onCancelReply: () => void;
  onDelete?: (comment: any) => void;
  onEdit?: (comment: any, newText: any) => void;
  commentFormProps: {
    editorData: any;
    onEditorChange: (data: any) => void;
    onSubmit: () => void;
    isSubmitting: boolean;
    componentKey: string | number;
  };
}

export function CommentItem({ 
  comment, 
  onReply, 
  depth = 0,
  activeReplyId,
  onCancelReply,
  onDelete,
  onEdit,
  commentFormProps
}: CommentItemProps) {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(comment.text);
  
  // Calculate permissions
  const canEditOrDelete = React.useMemo(() => {
    if (!user) return false;
    
    // 1. Admins and Managers are always exempt
    const isExempt = user.is_superuser || 
                    user.role?.name === 'Admin' || 
                    user.role?.name === 'Manager';
    
    if (isExempt) return true;
    
    // 2. Must be owner
    const isOwner = user.id === comment.created_by?.id;
    if (!isOwner) return false;
    
    // 3. Time limit check (6 hours)
    if (!comment.created_at) return true; // Fallback if no date
    
    const createdTime = new Date(comment.created_at).getTime();
    const sixHoursMs = 6 * 60 * 60 * 1000;
    const timeElapsed = Date.now() - createdTime;
    
    return timeElapsed <= sixHoursMs;
  }, [user, comment]);

  // Get author display name (prefer last name)
  const getAuthorName = (user: any) => {
    if (!user) return 'Anonymous';
    const { last_name, first_name, name } = user;
    return last_name || first_name || name || 'Anonymous';
  };

  const { addNotification } = useUIStore();
  const [likes, setLikes] = useState(comment.likes || 0);
  const [dislikes, setDislikes] = useState(comment.dislikes || 0);

  // Format time like "about 2 hours ago"
  const getTimeAgo = (dateString?: string) => {
    if (!dateString) return '';
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return '';
    }
  };
  
  // Get avatar URL or default
  const getAvatarUrl = (user: any) => {
    return user?.profile_image || user?.image?.media?.link || '/default-avatar-profile-picture-male-icon.svg';
  };

  const isReplying = activeReplyId === comment.id;

  const handleEditSubmit = () => {
      if (onEdit) {
          onEdit(comment, editData);
          setIsEditing(false);
      }
  };

  const handleLike = async () => {
    if (!user) {
        addNotification({
            type: 'error',
            title: 'Authentication Required',
            message: 'Please log in to like comments.'
        });
        return;
    }

    try {
        const response = await publicAPI.comments.toggleLike(comment.id);
        if (!response.error) {
            // Update local state from response
            const data = response.data && typeof response.data === 'object' && 'data' in response.data
            ? (response.data as any).data
            : response.data;
            
            if (data) {
                setLikes(data.likes || 0);
                setDislikes(data.dislikes || 0);
            }
        }
    } catch (error) {
        console.error('Error liking comment:', error);
    }
  };

  const handleDislike = async () => {
    if (!user) {
        addNotification({
            type: 'error',
            title: 'Authentication Required',
            message: 'Please log in to dislike comments.'
        });
        return;
    }

    try {
        const response = await publicAPI.comments.toggleDislike(comment.id);
        if (!response.error) {
             // Update local state from response
            const data = response.data && typeof response.data === 'object' && 'data' in response.data
            ? (response.data as any).data
            : response.data;
            
            if (data) {
                setLikes(data.likes || 0);
                setDislikes(data.dislikes || 0);
            }
        }
    } catch (error) {
        console.error('Error disliking comment:', error);
    }
  };

  return (
    <div className={`
      ${depth > 0 ? 'ml-6 border-l-2 border-blue-100 pl-3 mt-2' : 'py-3 border-b border-blue-100 last:border-b-0'}
    `}>
      <div className="flex items-center gap-2 mb-2">
        <img
            src={getAvatarUrl(comment.created_by)}
            alt={getAuthorName(comment.created_by)}
            className="w-6 h-6 rounded-full object-cover"
            onError={(e) => {
                (e.target as HTMLImageElement).src = '/default-avatar-profile-picture-male-icon.svg';
            }}
        />
        <span className="text-xs font-medium text-gray-600">
           {getAuthorName(comment.created_by)}
        </span>
        {comment.created_at && (
          <span className="text-gray-400 text-xs">• {getTimeAgo(comment.created_at)}</span>
        )}
      </div>
      
      <div className="prose prose-sm max-w-none text-gray-800 mb-2 ml-6">
        {isEditing ? (
             <CommentForm 
              editorData={editData}
              onEditorChange={setEditData}
              onCancel={() => setIsEditing(false)}
              onSubmit={handleEditSubmit}
              isSubmitting={commentFormProps.isSubmitting}
              title="Edit comment"
              submitLabel="Save Changes"
              componentKey={`edit-${comment.id}`}
           />
        ) : (
             comment.text && <EditorRenderer data={comment.text} />
        )}
      </div>
      
      {/* Actions: Like, Dislike, Reply, Edit, Delete */}
      {!isReplying && !isEditing && (
        <div className="flex items-center justify-start text-xs text-gray-500 ml-6 mb-2 gap-4">
           {/* Like Button */}
            <button
              onClick={handleLike}
              className="flex items-center gap-1 hover:text-green-600 transition-colors"
              title="Like"
            >
              <ThumbsUp className="h-3 w-3" />
              <span>{likes}</span>
            </button>
            
            {/* Dislike Button */}
            <button
              onClick={handleDislike}
              className="flex items-center gap-1 hover:text-red-600 transition-colors"
              title="Dislike"
            >
              <ThumbsDown className="h-3 w-3" />
              <span>{dislikes}</span>
            </button>

          <button 
            onClick={() => onReply(comment.id)}
            className="flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors"
            title="Reply"
          >
            <Reply className="h-3 w-3" />
            Reply
          </button>

          {canEditOrDelete && (
              <>
                 <button 
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-1 text-gray-500 hover:text-gray-700 transition-colors"
                    title="Edit"
                  >
                    <Edit className="h-3 w-3" />
                    Edit
                  </button>
                  <button 
                    onClick={() => onDelete && onDelete(comment)}
                    className="flex items-center gap-1 text-red-500 hover:text-red-700 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="h-3 w-3" />
                    Delete
                  </button>
              </>
          )}
        </div>
      )}

      {/* Inline Reply Form */}
      {isReplying && (
        <div className="ml-6 mt-2 mb-4">
           <CommentForm 
              editorData={commentFormProps.editorData}
              onEditorChange={commentFormProps.onEditorChange}
              onCancel={onCancelReply}
              onSubmit={commentFormProps.onSubmit}
              isSubmitting={commentFormProps.isSubmitting}
              title="Reply to comment"
              submitLabel="Post Reply"
              componentKey={commentFormProps.componentKey}
           />
        </div>
      )}

      {/* Recursive Children */}
      {comment.children && comment.children.length > 0 && (
        <div className="mt-2 text-sm text-gray-500">
          {comment.children.map((child: any) => (
             <CommentItem 
               key={child.id} 
               comment={child} 
               onReply={onReply} 
               depth={depth + 1}
               activeReplyId={activeReplyId}
               onCancelReply={onCancelReply}
               onEdit={onEdit}
               onDelete={onDelete}
               commentFormProps={commentFormProps}
             />
          ))}
        </div>
      )}
    </div>
  );
}
