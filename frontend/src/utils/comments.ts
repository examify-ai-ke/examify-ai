export const buildCommentTree = (comments: any[]) => {
  const commentMap = new Map();
  const roots: any[] = [];

  // First pass: create map nodes
  comments.forEach(comment => {
    commentMap.set(comment.id, { ...comment, children: [] });
  });

  // Second pass: link children to parents
  comments.forEach(comment => {
    const node = commentMap.get(comment.id);
    if (comment.parent_id && commentMap.has(comment.parent_id)) {
      commentMap.get(comment.parent_id).children.push(node);
    } else {
      roots.push(node);
    }
  });

  // Sort by created_at desc (newest first) for roots?
  // Or preserve API order. Let's do chronological (oldest first) which is what we usually want for comments to read top-down.
  // Wait, QuestionCard sorted by created_at.
  // Let's copy the sort logic from QuestionCard.
  return roots.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
};
