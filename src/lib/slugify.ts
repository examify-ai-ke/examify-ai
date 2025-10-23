/**
 * Convert a string to a URL-friendly slug
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')        // Replace spaces with -
    .replace(/[^\w\-]+/g, '')    // Remove all non-word chars
    .replace(/\-\-+/g, '-')      // Replace multiple - with single -
    .replace(/^-+/, '')          // Trim - from start of text
    .replace(/-+$/, '');         // Trim - from end of text
}

/**
 * Get slug from exam paper, fallback to ID
 */
export function getExamPaperSlug(paper: {
  slug?: string | null;
  id?: string;
}): string {
  // Use slug if available, otherwise use ID
  return paper.slug || paper.id || 'unknown';
}
