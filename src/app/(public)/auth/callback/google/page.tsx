'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { exchangeGoogleCode } from '@/lib/social-auth';
import { useAuthStore } from '@/stores/auth';

function GoogleCallbackContent() {
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
                // Get authorization code from URL
                const code = searchParams.get('code');
                const state = searchParams.get('state'); // This contains the redirect URL
                const errorParam = searchParams.get('error');

                // Handle user cancellation
                if (errorParam) {
                    // console.log('⚠️ Google OAuth cancelled:', errorParam);
                    // User cancelled the authorization - redirect back to login immediately
                    if (errorParam === 'access_denied' || errorParam === 'user_cancelled_login') {
                        if (isMounted) {
                            router.push('/auth/login');
                        }
                        return;
                    }
                    throw new Error(`Google authentication failed: ${errorParam}`);
                }

                if (!code) {
                    throw new Error('No authorization code received from Google');
                }

                /* console.log('🔐 Received authorization code from Google');
                console.log('📍 Redirect URL from state:', state);
                console.log('🔑 Code length:', code.length); */

                // Exchange code for tokens via backend
                const response = await exchangeGoogleCode(code, 'google');
                
                // Check if component is still mounted before updating state
                if (!isMounted) {
                    // console.log('Component unmounted, skipping redirect');
                    return;
                }
                
                /* console.log('✅ Authentication response:', response);
                console.log('✅ Response type:', typeof response);
                console.log('✅ Response keys:', response ? Object.keys(response) : 'null'); */

                // Extract token and user from response
                // Response structure: { message, meta, data: { access_token, token_type, refresh_token, user } }
                let token: string | undefined;
                let user: any | undefined;
                
                if (response && typeof response === 'object' && 'data' in response) {
                    const data = (response as any).data;
                    if (data && typeof data === 'object') {
                        token = data.access_token;
                        user = data.user;
                    }
                }

                // console.log('🔑 Extracted token:', token ? `${token.substring(0, 20)}...` : 'null');
                // console.log('👤 Extracted user:', user ? user.email : 'null');

                if (!token) {
                    // console.error('❌ Token extraction failed. Response structure:', JSON.stringify(response, null, 2));
                    throw new Error('No authentication token received from server');
                }

                if (!user) {
                    // console.error('❌ User extraction failed. Response structure:', JSON.stringify(response, null, 2));
                    throw new Error('No user data received from server');
                }

                // Store the token and user using login method (sets isAuthenticated: true)
                login(user, token);
                localStorage.setItem('auth-token', token);
                
                // Set cookie for SSR
                document.cookie = `auth-token=${token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
                
                // Store user role in cookie for middleware access control
                const userRole = user.is_superuser ? 'superuser' : (user.role?.name || 'user');
                document.cookie = `user-role=${userRole}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;

                // console.log('✅ User and token stored successfully');
                if (isMounted) {
                    setStatus('success');
                }

                // Redirect immediately using window.location for a hard redirect
                const redirectUrl = state && state.startsWith('/') ? state : '/exampapers';
                // console.log('🔄 Redirecting to:', redirectUrl);
                if (isMounted) {
                    window.location.href = redirectUrl;
                }

            } catch (error) {
                // console.error('❌ Google callback error:', error);
                // Only update state if component is still mounted and error wasn't an abort
                if (isMounted && error instanceof Error && error.name !== 'AbortError') {
                    setStatus('error');
                    setError(error instanceof Error ? error.message : 'Authentication failed');
                }
            }
        };

        handleCallback();

        // Cleanup function
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
                        {status === 'loading' && 'Please wait while we complete your Google sign in'}
                        {status === 'success' && 'Redirecting you to exam papers...'}
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
                                You have successfully signed in with Google
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

export default function GoogleCallbackPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
                <Card className="w-full max-w-md">
                    <CardContent className="flex flex-col items-center py-10">
                        <LoadingSpinner className="h-12 w-12" />
                        <p className="mt-4 text-muted-foreground">Redirecting to Google...</p>
                    </CardContent>
                </Card>
            </div>
        }>
            <GoogleCallbackContent />
        </Suspense>
    );
}
