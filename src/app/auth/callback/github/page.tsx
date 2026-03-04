'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { exchangeGitHubCode } from '@/lib/social-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export default function GitHubCallbackPage() {
    const [error, setError] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(true);
    const router = useRouter();
    const searchParams = useSearchParams();
    const { login } = useAuth();

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

                console.log('🔍 GitHub OAuth callback received', {
                    hasCode: !!code,
                    hasState: !!state,
                    hasError: !!errorParam,
                    errorDescription: errorParam
                });

                // Handle OAuth errors from GitHub
                if (errorParam) {
                    console.log('⚠️ GitHub OAuth cancelled:', errorParam);
                    // User cancelled the authorization - redirect back to login immediately
                    if (errorParam === 'access_denied' || errorParam === 'user_cancelled_login') {
                        if (isMounted) {
                            router.push('/auth/login');
                        }
                        return;
                    }
                    throw new Error(`GitHub OAuth error: ${errorParam}`);
                }

                // Validate required parameters
                if (!code) {
                    throw new Error('No authorization code received from GitHub');
                }

                console.log('🔄 Exchanging GitHub code for authentication...');
                
                // Exchange the authorization code for tokens via backend
                const response = await exchangeGitHubCode(code, 'github');
                
                // Check if component is still mounted before updating state
                if (!isMounted) {
                    console.log('Component unmounted, skipping redirect');
                    return;
                }
                
                console.log('✅ Authentication response:', response);
                console.log('✅ Response type:', typeof response);
                console.log('✅ Response keys:', response ? Object.keys(response) : 'null');

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

                console.log('🔑 Extracted token:', token ? `${token.substring(0, 20)}...` : 'null');
                console.log('👤 Extracted user:', user ? user.email : 'null');

                if (token && user) {
                    // Log in the user with the received tokens
                    await login({
                        email: user.email,
                        password: '', // Social login doesn't use password
                        provider: 'github'
                    });
                    
                    // Store tokens if needed
                    if (typeof window !== 'undefined') {
                        localStorage.setItem('auth-token', token);
                        const refreshToken = (response as any).data?.refresh_token;
                        if (refreshToken) {
                            localStorage.setItem('refresh-token', refreshToken);
                        }
                    }
                    
                    // Determine redirect URL based on user role
                    // Admins and managers go to /dashboard, regular users go to /exampapers
                    let redirectUrl = '/exampapers'; // Default for regular users
                    if (user.is_superuser || user.role?.name === 'manager' || user.role?.name === 'admin') {
                        redirectUrl = state || '/dashboard'; // Admins/managers use state or default to /dashboard
                    } else {
                        // Regular users always go to /exampapers, ignore /dashboard in state
                        redirectUrl = (state && state !== '/dashboard') ? state : '/exampapers';
                    }
                    
                    console.log('🚀 Redirecting to:', redirectUrl);
                    if (isMounted) {
                        router.push(redirectUrl);
                    }
                } else {
                    throw new Error('No authentication data received from backend');
                }

            } catch (err) {
                console.error('❌ GitHub OAuth callback error:', err);
                // Only update state if component is still mounted and error wasn't an abort
                if (isMounted && err instanceof Error && err.name !== 'AbortError') {
                    const errorMessage = err instanceof Error ? err.message : 'Authentication failed';
                    setError(errorMessage);
                    
                    // Redirect to login page after a short delay
                    setTimeout(() => {
                        if (isMounted) {
                            router.push('/auth/login?error=github_oauth_failed');
                        }
                    }, 3000);
                }
            } finally {
                if (isMounted) {
                    setIsProcessing(false);
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

    // Show loading state
    if (isProcessing && !error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <CardTitle className="flex items-center justify-center gap-2">
                            <LoadingSpinner size="sm" />
                            Authenticating with GitHub...
                        </CardTitle>
                        <CardDescription>
                            Please wait while we complete your authentication.
                        </CardDescription>
                    </CardHeader>
                </Card>
            </div>
        );
    }

    // Show error state
    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <CardTitle className="text-red-600">Authentication Failed</CardTitle>
                        <CardDescription>
                            {error}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-gray-600 text-center">
                            You will be redirected to the login page in a few seconds...
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return null;
}