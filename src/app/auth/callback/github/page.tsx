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
                    throw new Error(`GitHub OAuth error: ${errorParam}`);
                }

                // Validate required parameters
                if (!code) {
                    throw new Error('No authorization code received from GitHub');
                }

                console.log('🔄 Exchanging GitHub code for authentication...');
                
                // Exchange the authorization code for tokens via backend
                const response = await exchangeGitHubCode(code, 'github');
                
                console.log('✅ GitHub OAuth successful', {
                    hasData: !!response?.data,
                    userEmail: response?.data?.user?.email
                });

                if (response?.data) {
                    // Extract the token and user data
                    const { access_token, refresh_token, user } = response.data;
                    
                    // Log in the user with the received tokens
                    await login({
                        email: user.email,
                        password: '', // Social login doesn't use password
                        provider: 'github'
                    });
                    
                    // Store tokens if needed
                    if (typeof window !== 'undefined') {
                        localStorage.setItem('auth-token', access_token);
                        if (refresh_token) {
                            localStorage.setItem('refresh-token', refresh_token);
                        }
                    }
                    
                    // Redirect to the original destination or dashboard
                    const redirectUrl = state || '/dashboard';
                    console.log('🚀 Redirecting to:', redirectUrl);
                    router.push(redirectUrl);
                } else {
                    throw new Error('No authentication data received from backend');
                }

            } catch (err) {
                console.error('❌ GitHub OAuth callback error:', err);
                const errorMessage = err instanceof Error ? err.message : 'Authentication failed';
                setError(errorMessage);
                
                // Redirect to login page after a short delay
                setTimeout(() => {
                    router.push('/auth/login?error=github_oauth_failed');
                }, 3000);
            } finally {
                setIsProcessing(false);
            }
        };

        handleCallback();
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