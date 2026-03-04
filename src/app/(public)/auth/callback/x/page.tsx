'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/stores/auth';
import { exchangeXCode } from '@/lib/social-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function XCallbackPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const login = useAuthStore((state) => state.login);
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [error, setError] = useState<string>('');

    useEffect(() => {
        // Create abort controller to cancel requests if component unmounts
        const abortController = new AbortController();
        let isMounted = true;

        const handleCallback = async () => {
            try {
                // Get the authorization code from URL parameters
                const code = searchParams.get('code');
                const state = searchParams.get('state');
                const errorParam = searchParams.get('error');

                console.log('🔍 X OAuth callback received', {
                    hasCode: !!code,
                    hasState: !!state,
                    hasError: !!errorParam,
                    errorDescription: errorParam
                });

                // Handle OAuth errors from X
                if (errorParam) {
                    console.log('⚠️ X OAuth cancelled:', errorParam);
                    // User cancelled the authorization - redirect back to login immediately
                    if (errorParam === 'access_denied' || errorParam === 'user_cancelled_login') {
                        if (isMounted) {
                            router.push('/auth/login');
                        }
                        return;
                    }
                    throw new Error(`X OAuth error: ${errorParam}`);
                }

                // Validate required parameters
                if (!code) {
                    throw new Error('No authorization code received from X');
                }

                console.log('🔄 Exchanging X code for authentication...');
                
                // Retrieve the PKCE code verifier stored before redirect
                const codeVerifier = sessionStorage.getItem('x_code_verifier') || undefined;
                sessionStorage.removeItem('x_code_verifier');

                if (!codeVerifier) {
                    console.warn('⚠️ No code_verifier found in sessionStorage — PKCE may fail');
                }
                
                // Exchange the authorization code for tokens via backend
                const response = await exchangeXCode(code, 'twitter', codeVerifier);
                
                // Check if component is still mounted before updating state
                if (!isMounted) {
                    console.log('Component unmounted, skipping redirect');
                    return;
                }
                
                console.log('✅ Authentication response:', response);

                // Extract token and user from response
                let token: string | undefined;
                let user: any | undefined;
                
                if (response && typeof response === 'object' && 'data' in response) {
                    const data = (response as any).data;
                    if (data && typeof data === 'object') {
                        token = data.access_token;
                        user = data.user;
                    }
                }

                if (token && user) {
                    // Log in the user with the received tokens (Store state)
                    login(user, token);
                    
                    // Persist tokens
                    if (typeof window !== 'undefined') {
                        localStorage.setItem('auth-token', token);
                        const refreshToken = (response as any).data?.refresh_token;
                        if (refreshToken) {
                            localStorage.setItem('refresh-token', refreshToken);
                        }

                        // Mirror Google flow: set cookies for SSR and middleware
                        document.cookie = `auth-token=${token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
                        const userRole = user.is_superuser ? 'superuser' : (user.role?.name || 'user');
                        document.cookie = `user-role=${userRole}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
                    }
                    
                    if (isMounted) {
                        setStatus('success');
                    }

                    // Determine redirect URL
                    const redirectUrl = state && state.startsWith('/') ? state : '/exampapers';
                    
                    console.log('🚀 Redirecting to:', redirectUrl);
                    
                    // Delay redirect to show success message (matches Google flow UI)
                    if (isMounted) {
                        setTimeout(() => {
                            if (isMounted) {
                                window.location.href = redirectUrl;
                            }
                        }, 1500);
                    }
                } else {
                    throw new Error('No authentication data received from backend');
                }

            } catch (err) {
                console.error('❌ X OAuth callback error:', err);
                if (isMounted && err instanceof Error && err.name !== 'AbortError') {
                    setStatus('error');
                    setError(err instanceof Error ? err.message : 'Authentication failed');
                }
            }
        };

        handleCallback();

        return () => {
            isMounted = false;
            abortController.abort();
        };
    }, [searchParams, router, login]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-center">
                        {status === 'loading' && 'Completing Sign In...'}
                        {status === 'success' && 'Sign In Successful!'}
                        {status === 'error' && 'Sign In Failed'}
                    </CardTitle>
                    <CardDescription className="text-center">
                        {status === 'loading' && 'Please wait while we complete your X sign in'}
                        {status === 'success' && 'Redirecting you to home...'}
                        {status === 'error' && 'There was a problem signing you in'}
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center space-y-4">
                    {status === 'loading' && (
                        <LoadingSpinner className="h-12 w-12" />
                    )}
                    
                    {status === 'success' && (
                        <div className="flex flex-col items-center space-y-4">
                            <div className="rounded-full bg-green-100 p-3">
                                <CheckCircle2 className="h-12 w-12 text-green-600" />
                            </div>
                            <p className="text-sm text-muted-foreground text-center">
                                You have successfully signed in with X
                            </p>
                        </div>
                    )}
                    
                    {status === 'error' && (
                        <div className="flex flex-col items-center space-y-4 w-full">
                            <div className="rounded-full bg-red-100 p-3">
                                <AlertCircle className="h-12 w-12 text-red-600" />
                            </div>
                            <p className="text-sm text-red-600 text-center">
                                {error}
                            </p>
                            <Button 
                                onClick={() => router.push('/auth/login')}
                                className="w-full"
                            >
                                Back to Login
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
