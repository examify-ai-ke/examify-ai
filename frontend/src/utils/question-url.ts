/**
 * Generate a slug-based URL for a question
 * Format: /questions/{slug}-{id}
 * 
 * This allows for SEO-friendly URLs while still being able to fetch by ID
 * since the backend doesn't support slug-based lookups yet.
 */
export function getQuestionUrl(question: { id: string; slug?: string | null }): string {
  if (question.slug) {
    return `/questions/${question.slug}-${question.id}`;
  }
  // Fallback to just ID if no slug
  return `/questions/${question.id}`;
}

/**
 * Extract question ID from a slug-based URL parameter
 * Format: {slug}-{id} or just {id}
 * 
 * The ID is a UUID in format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
 * We need to extract the last 36 characters (UUID length including hyphens)
 */
export function extractQuestionId(slugParam: string): string {
  // UUID format is 36 characters: 8-4-4-4-12 (with hyphens)
  // If the param is just an ID (UUID), return it as-is
  if (slugParam.length === 36 && slugParam.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
    return slugParam;
  }
  
  // Otherwise, extract the last 36 characters (the UUID at the end)
  // Format is: {slug}-{uuid}
  if (slugParam.length > 36) {
    return slugParam.slice(-36);
  }
  
  // Fallback: return as-is if it doesn't match expected format
  return slugParam;
}
