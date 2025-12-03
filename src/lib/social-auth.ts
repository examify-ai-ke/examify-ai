/**
 * Social Authentication utilities
 * Handles OAuth flows for Google, GitHub, etc.
 */

import { api } from './api';

export type SocialProvider = 'google' | 'github' | 'facebook' | 'twitter';

interface GoogleAuthResponse {
    access_token: string;
    id_token?: string;
    expires_in: number;
    scope: string;
    token_type: string;
}

interface GitHubAuthResponse {
    access_token: string;
    scope: string;
    token_type: string;
}

/**
 * Initiates Google OAuth flow
 * Opens Google login in a popup window
 */
export function initiateGoogleAuth(redirectUrl?: string): Promise<GoogleAuthResponse> {
    return new Promise((resolve, reject) => {
        const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
        
        if (!clientId) {
            reject(new Error('Google Client ID not configured'));
            return;
        }

        // Build the OAuth URL
        const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
        const callbackUrl = `${baseUrl}/auth/callback/google`;
        
        const params = new URLSearchParams({
            client_id: clientId,
            redirect_uri: callbackUrl,
            response_type: 'code',
            scope: 'openid email profile',
            access_type: 'offline',
            prompt: 'consent',
            state: redirectUrl || '/exampapers', // Store redirect URL in state
        });

        const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

        // Open popup window
        const width = 500;
        const height = 600;
        const left = window.screenX + (window.outerWidth - width) / 2;
        const top = window.screenY + (window.outerHeight - height) / 2;

        const popup = window.open(
            authUrl,
            'Google Sign In',
            `width=${width},height=${height},left=${left},top=${top}`
        );

        if (!popup) {
            reject(new Error('Popup blocked. Please allow popups for this site.'));
            return;
        }

        // Listen for messages from the popup
        const handleMessage = (event: MessageEvent) => {
            // Verify origin
            if (event.origin !== window.location.origin) {
                return;
            }

            if (event.data.type === 'GOOGLE_AUTH_SUCCESS') {
                window.removeEventListener('message', handleMessage);
                popup.close();
                resolve(event.data.data);
            } else if (event.data.type === 'GOOGLE_AUTH_ERROR') {
                window.removeEventListener('message', handleMessage);
                popup.close();
                reject(new Error(event.data.error || 'Authentication failed'));
            }
        };

        window.addEventListener('message', handleMessage);

        // Check if popup was closed
        const checkClosed = setInterval(() => {
            if (popup.closed) {
                clearInterval(checkClosed);
                window.removeEventListener('message', handleMessage);
                reject(new Error('Authentication cancelled'));
            }
        }, 1000);
    });
}

/**
 * Exchanges authorization code for tokens via backend
 * Backend handles the code exchange with Google securely
 */
export async function exchangeGoogleCode(code: string, provider: SocialProvider = 'google') {
    try {
        console.log('🔄 Sending authorization code to backend...', { provider, codeLength: code.length });
        
        // Send the authorization code to backend
        // Backend will exchange it with Google and return our auth tokens
        const response = await api.POST('/api/v1/user/social-auth/{provider}/callback', {
            params: {
                path: { provider }
            },
            body: {
                code: code,
                redirect_uri: typeof window !== 'undefined' 
                    ? `${window.location.origin}/auth/callback/google`
                    : ''
            }
        });

        console.log('📋 Backend response:', response);

        if (response.error) {
            console.error('❌ Backend error:', response.error);
            
            // Extract detailed error message
            let errorMessage = 'Failed to authenticate with Google';
            if (typeof response.error === 'object') {
                const err = response.error as any;
                if (err.detail && Array.isArray(err.detail)) {
                    errorMessage = err.detail.map((d: any) => d.msg).join(', ');
                } else if (err.detail) {
                    errorMessage = typeof err.detail === 'string' ? err.detail : JSON.stringify(err.detail);
                } else if (err.message) {
                    errorMessage = err.message;
                } else {
                    errorMessage = JSON.stringify(err);
                }
            } else if (typeof response.error === 'string') {
                errorMessage = response.error;
            }
            
            throw new Error(`Backend error: ${errorMessage}`);
        }

        return response.data;
    } catch (error) {
        console.error('❌ Error exchanging Google code:', error);
        throw error;
    }
}

/**
 * Complete Google authentication flow
 * This is the main function to call from your login page
 */
export async function loginWithGoogle(redirectUrl?: string): Promise<{
    success: boolean;
    token?: string;
    error?: string;
}> {
    try {
        // Step 1: Initiate OAuth and get authorization code
        console.log('🔐 Initiating Google OAuth...');
        const authResponse = await initiateGoogleAuth(redirectUrl);
        
        // Note: The actual code exchange happens in the callback page
        // This function is mainly for initiating the flow
        
        return {
            success: true,
        };
    } catch (error) {
        console.error('❌ Google auth error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Authentication failed',
        };
    }
}

/**
 * Alternative: Direct redirect approach (simpler, but full page redirect)
 */
export function redirectToGoogleAuth(redirectUrl?: string) {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    
    if (!clientId) {
        throw new Error('Google Client ID not configured');
    }

    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const callbackUrl = `${baseUrl}/auth/callback/google`;
    
    const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: callbackUrl,
        response_type: 'code',
        scope: 'openid email profile',
        access_type: 'offline',
        prompt: 'consent',
        state: redirectUrl || '/exampapers',
    });

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    
    window.location.href = authUrl;
}

// ==================== GITHUB OAUTH IMPLEMENTATION ====================

/**
 * Initiates GitHub OAuth flow
 * Opens GitHub login in a popup window
 */
export function initiateGitHubAuth(redirectUrl?: string): Promise<GitHubAuthResponse> {
    return new Promise((resolve, reject) => {
        const clientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;
        
        if (!clientId) {
            reject(new Error('GitHub Client ID not configured'));
            return;
        }

        // Build the OAuth URL
        const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
        const callbackUrl = `${baseUrl}/auth/callback/github`;
        
        const params = new URLSearchParams({
            client_id: clientId,
            redirect_uri: callbackUrl,
            scope: 'read:user user:email',
            state: redirectUrl || '/exampapers', // Store redirect URL in state
        });

        const authUrl = `https://github.com/login/oauth/authorize?${params.toString()}`;

        // Open popup window
        const width = 500;
        const height = 600;
        const left = window.screenX + (window.outerWidth - width) / 2;
        const top = window.screenY + (window.outerHeight - height) / 2;

        const popup = window.open(
            authUrl,
            'GitHub Sign In',
            `width=${width},height=${height},left=${left},top=${top}`
        );

        if (!popup) {
            reject(new Error('Popup blocked. Please allow popups for this site.'));
            return;
        }

        // Listen for messages from the popup
        const handleMessage = (event: MessageEvent) => {
            // Verify origin
            if (event.origin !== window.location.origin) {
                return;
            }

            if (event.data.type === 'GITHUB_AUTH_SUCCESS') {
                window.removeEventListener('message', handleMessage);
                popup.close();
                resolve(event.data.data);
            } else if (event.data.type === 'GITHUB_AUTH_ERROR') {
                window.removeEventListener('message', handleMessage);
                popup.close();
                reject(new Error(event.data.error || 'Authentication failed'));
            }
        };

        window.addEventListener('message', handleMessage);

        // Check if popup was closed
        const checkClosed = setInterval(() => {
            if (popup.closed) {
                clearInterval(checkClosed);
                window.removeEventListener('message', handleMessage);
                reject(new Error('Authentication cancelled'));
            }
        }, 1000);
    });
}

/**
 * Exchanges authorization code for access token via backend
 * Backend handles the code exchange with GitHub securely
 */
export async function exchangeGitHubCode(code: string, provider: SocialProvider = 'github') {
    try {
        console.log('🔄 Sending GitHub authorization code to backend...', { provider, codeLength: code.length });
        
        // Send the authorization code to backend
        const response = await api.POST('/api/v1/user/social-auth/{provider}/callback', {
            params: {
                path: { provider }
            },
            body: {
                code: code,
                redirect_uri: typeof window !== 'undefined' 
                    ? `${window.location.origin}/auth/callback/github`
                    : ''
            }
        });

        console.log('📋 Backend response:', response);

        if (response.error) {
            console.error('❌ Backend error:', response.error);
            
            // Extract detailed error message
            let errorMessage = 'Failed to authenticate with GitHub';
            if (typeof response.error === 'object') {
                const err = response.error as any;
                if (err.detail && Array.isArray(err.detail)) {
                    errorMessage = err.detail.map((d: any) => d.msg).join(', ');
                } else if (err.detail) {
                    errorMessage = typeof err.detail === 'string' ? err.detail : JSON.stringify(err.detail);
                } else if (err.message) {
                    errorMessage = err.message;
                } else {
                    errorMessage = JSON.stringify(err);
                }
            } else if (typeof response.error === 'string') {
                errorMessage = response.error;
            }
            
            throw new Error(`Backend error: ${errorMessage}`);
        }

        return response.data;
    } catch (error) {
        console.error('❌ Error exchanging GitHub code:', error);
        throw error;
    }
}

/**
 * Complete GitHub authentication flow
 * This is the main function to call from your login page
 */
export async function loginWithGitHub(redirectUrl?: string): Promise<{
    success: boolean;
    token?: string;
    error?: string;
}> {
    try {
        // Step 1: Initiate OAuth and get authorization code
        console.log('🔐 Initiating GitHub OAuth...');
        const authResponse = await initiateGitHubAuth(redirectUrl);
        
        return {
            success: true,
        };
    } catch (error) {
        console.error('❌ GitHub auth error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Authentication failed',
        };
    }
}

/**
 * Alternative: Direct redirect approach for GitHub (simpler, but full page redirect)
 */
export function redirectToGitHubAuth(redirectUrl?: string) {
    const clientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;
    
    if (!clientId) {
        throw new Error('GitHub Client ID not configured');
    }

    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const callbackUrl = `${baseUrl}/auth/callback/github`;
    
    const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: callbackUrl,
        scope: 'read:user user:email',
        state: redirectUrl || '/exampapers',
    });

    const authUrl = `https://github.com/login/oauth/authorize?${params.toString()}`;
    
    window.location.href = authUrl;
}
