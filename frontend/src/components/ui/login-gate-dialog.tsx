'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Lock, ArrowRight } from 'lucide-react';

interface LoginGateDialogProps {
  isOpen: boolean;
  onClose?: () => void;
  redirectUrl?: string;
  message?: string;
}

export function LoginGateDialog({
  isOpen,
  onClose,
  redirectUrl,
  message = "You've reached the limit of free pages. Please sign in to continue browsing.",
}: LoginGateDialogProps) {
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    if (!isOpen) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  const loginUrl = redirectUrl 
    ? `/auth/login?redirect=${encodeURIComponent(redirectUrl)}`
    : '/auth/login';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mx-auto mb-4">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-center text-xl">Sign In Required</DialogTitle>
          <DialogDescription className="text-center pt-2">
            {message}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
            <p className="text-sm text-blue-900 font-medium">
              Redirecting to login in {countdown} seconds...
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <Button asChild className="w-full">
              <Link href={loginUrl}>
                Sign In Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>

            <Button asChild variant="outline" className="w-full">
              <Link href="/auth/register">
                Create Account
              </Link>
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            By signing in, you'll get unlimited access to all exam papers, questions, and study materials.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
