/**
 * Hook for managing sign-up prompt display logic
 * Tracks user interactions and determines when to show prompts
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import type { SignUpPromptType } from '@/components/public';

interface PromptState {
  viewCount: number;
  dismissedPrompts: string[];
  lastPromptTime: number;
  hasSeenPrompt: boolean;
}

const STORAGE_KEY = 'exampapel_prompt_state';
const MIN_PROMPT_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours
const VIEW_THRESHOLD = 3; // Show prompt after 3 views

/**
 * Get prompt state from localStorage
 */
function getPromptState(): PromptState {
  if (typeof window === 'undefined') {
    return {
      viewCount: 0,
      dismissedPrompts: [],
      lastPromptTime: 0,
      hasSeenPrompt: false,
    };
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error reading prompt state:', error);
  }

  return {
    viewCount: 0,
    dismissedPrompts: [],
    lastPromptTime: 0,
    hasSeenPrompt: false,
  };
}

/**
 * Save prompt state to localStorage
 */
function savePromptState(state: PromptState) {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Error saving prompt state:', error);
  }
}

/**
 * Hook for managing sign-up prompts
 */
export function useSignUpPrompt() {
  const [promptState, setPromptState] = useState<PromptState>(getPromptState);
  const [isPromptOpen, setIsPromptOpen] = useState(false);
  const [promptType, setPromptType] = useState<SignUpPromptType>('time-based');

  // Sync state with localStorage
  useEffect(() => {
    savePromptState(promptState);
  }, [promptState]);

  /**
   * Increment view count
   */
  const incrementViewCount = useCallback(() => {
    setPromptState((prev) => ({
      ...prev,
      viewCount: prev.viewCount + 1,
    }));
  }, []);

  /**
   * Check if prompt should be shown based on conditions
   */
  const shouldShowPrompt = useCallback(
    (type: SignUpPromptType): boolean => {
      const now = Date.now();
      const timeSinceLastPrompt = now - promptState.lastPromptTime;

      // Don't show if dismissed recently (within 24 hours)
      if (
        promptState.dismissedPrompts.includes(type) &&
        timeSinceLastPrompt < MIN_PROMPT_INTERVAL
      ) {
        return false;
      }

      // Don't show if already seen a prompt recently
      if (promptState.hasSeenPrompt && timeSinceLastPrompt < MIN_PROMPT_INTERVAL) {
        return false;
      }

      // Check view threshold for time-based prompts
      if (type === 'time-based' && promptState.viewCount < VIEW_THRESHOLD) {
        return false;
      }

      return true;
    },
    [promptState]
  );

  /**
   * Show prompt of specific type
   */
  const showPrompt = useCallback(
    (type: SignUpPromptType) => {
      if (shouldShowPrompt(type)) {
        setPromptType(type);
        setIsPromptOpen(true);
        setPromptState((prev) => ({
          ...prev,
          hasSeenPrompt: true,
          lastPromptTime: Date.now(),
        }));
      }
    },
    [shouldShowPrompt]
  );

  /**
   * Dismiss prompt (user clicked "Maybe Later")
   */
  const dismissPrompt = useCallback(() => {
    setPromptState((prev) => ({
      ...prev,
      dismissedPrompts: [...prev.dismissedPrompts, promptType],
      lastPromptTime: Date.now(),
    }));
    setIsPromptOpen(false);
  }, [promptType]);

  /**
   * Close prompt without dismissing (user completed action or closed)
   */
  const closePrompt = useCallback(() => {
    setIsPromptOpen(false);
  }, []);

  /**
   * Reset prompt state (for testing or after sign-up)
   */
  const resetPromptState = useCallback(() => {
    const newState: PromptState = {
      viewCount: 0,
      dismissedPrompts: [],
      lastPromptTime: 0,
      hasSeenPrompt: false,
    };
    setPromptState(newState);
    savePromptState(newState);
  }, []);

  /**
   * Check if user should see time-based prompt
   */
  const checkTimeBasedPrompt = useCallback(() => {
    if (promptState.viewCount >= VIEW_THRESHOLD && shouldShowPrompt('time-based')) {
      showPrompt('time-based');
    }
  }, [promptState.viewCount, shouldShowPrompt, showPrompt]);

  return {
    // State
    isPromptOpen,
    promptType,
    viewCount: promptState.viewCount,
    
    // Actions
    incrementViewCount,
    showPrompt,
    dismissPrompt,
    closePrompt,
    resetPromptState,
    checkTimeBasedPrompt,
    
    // Utilities
    shouldShowPrompt,
  };
}

/**
 * Hook for tracking question views
 * Automatically increments view count and checks for time-based prompts
 */
export function useQuestionViewTracking() {
  const { incrementViewCount, checkTimeBasedPrompt } = useSignUpPrompt();

  useEffect(() => {
    // Increment view count when component mounts
    incrementViewCount();

    // Check if time-based prompt should be shown
    const timer = setTimeout(() => {
      checkTimeBasedPrompt();
    }, 5000); // Show after 5 seconds on page

    return () => clearTimeout(timer);
  }, [incrementViewCount, checkTimeBasedPrompt]);
}
