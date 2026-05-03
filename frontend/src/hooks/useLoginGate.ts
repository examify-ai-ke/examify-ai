import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './useAuth';

const MAX_FREE_PAGES = 3;
const STORAGE_KEY = 'pages_viewed';

interface UseLoginGateOptions {
  currentPage: number;
  enabled?: boolean;
}

/**
 * Hook to enforce login after viewing a certain number of pages
 * Tracks page views in sessionStorage and redirects to login when limit is reached
 */
export function useLoginGate({ currentPage, enabled = true }: UseLoginGateOptions) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  useEffect(() => {
    // Skip if not in browser, user is authenticated, or feature is disabled
    if (typeof window === 'undefined' || isAuthenticated || !enabled) {
      // If user is authenticated, ensure prompt is hidden and clear storage
      if (isAuthenticated && typeof window !== 'undefined') {
        setShowLoginPrompt(false);
        sessionStorage.removeItem(STORAGE_KEY);
      }
      return;
    }

    // Get viewed pages from sessionStorage
    const viewedPagesStr = sessionStorage.getItem(STORAGE_KEY);
    const viewedPages: Set<number> = viewedPagesStr 
      ? new Set(JSON.parse(viewedPagesStr))
      : new Set();

    // Add current page to viewed pages
    viewedPages.add(currentPage);

    // Save updated viewed pages
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(viewedPages)));

    // Check if user has exceeded the limit
    if (viewedPages.size > MAX_FREE_PAGES) {
      // Show login prompt
      setShowLoginPrompt(true);
      
      // Redirect to login after a short delay
      const timer = setTimeout(() => {
        const currentPath = window.location.pathname + window.location.search;
        router.push(`/auth/login?redirect=${encodeURIComponent(currentPath)}`);
      }, 3000); // Increased to 3 seconds to match countdown

      return () => clearTimeout(timer);
    }
  }, [currentPage, isAuthenticated, enabled, router]);

  // Helper function to get pages viewed count (only in browser)
  const getPagesViewed = () => {
    if (typeof window === 'undefined' || isAuthenticated) {
      return 0;
    }
    const viewedPagesStr = sessionStorage.getItem(STORAGE_KEY);
    return viewedPagesStr ? JSON.parse(viewedPagesStr).length : 0;
  };

  // Function to close the prompt
  const closePrompt = () => {
    setShowLoginPrompt(false);
  };

  return {
    showLoginPrompt,
    pagesViewed: getPagesViewed(),
    maxFreePages: MAX_FREE_PAGES,
    closePrompt,
  };
}
