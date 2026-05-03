/**
 * Social Authentication utilities
 * Handles OAuth flows for Google, GitHub, etc.
 */

import { api } from './api';

export type SocialProvider = 'google' | 'github' | 'x' | 'twitter' | 'facebook';

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

interface XAuthResponse {
    access_token: string;
    token_type: string;
    expires_in?: number;
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
                path: { provider: provider as any }
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
            const err = response.error as any;
            if (typeof err === 'object') {
                if (err.detail && Array.isArray(err.detail)) {
                    errorMessage = err.detail.map((d: any) => d.msg).join(', ');
                } else if (err.detail) {
                    errorMessage = typeof err.detail === 'string' ? err.detail : JSON.stringify(err.detail);
                } else if (err.message) {
                    errorMessage = err.message;
                } else {
                    errorMessage = JSON.stringify(err);
                }
            } else if (typeof err === 'string') {
                errorMessage = err;
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
    } as any);

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
        const callbackUrl = typeof window !== 'undefined' 
            ? `${window.location.origin}/auth/callback/github`
            : '';
        
        console.log('📍 Callback URL:', callbackUrl);
        console.log('📋 Request body:', { code: code.substring(0, 20) + '...', redirect_uri: callbackUrl });
        
        const response = await api.POST('/api/v1/user/social-auth/{provider}/callback', {
            params: {
                path: { provider: provider as any }
            },
            body: {
                code: code,
                redirect_uri: callbackUrl
            }
        });

        console.log('📋 Backend response:', response);
        console.log('📊 Response structure:', response ? Object.keys(response) : 'null');

        if (response.error) {
            console.error('❌ Backend error object:', response.error);
            
            // Extract detailed error message
            let errorMessage = 'Failed to authenticate with GitHub';
            const err = response.error as any;
            if (typeof err === 'object') {
                if (err.detail && Array.isArray(err.detail)) {
                    errorMessage = err.detail.map((d: any) => d.msg).join(', ');
                } else if (err.detail) {
                    errorMessage = typeof err.detail === 'string' ? err.detail : JSON.stringify(err.detail);
                } else if (err.message) {
                    errorMessage = err.message;
                } else {
                    errorMessage = JSON.stringify(err);
                }
            } else if (typeof err === 'string') {
                errorMessage = err;
            }
            
            console.error('🔴 Detailed error message:', errorMessage);
            console.error('🔴 Full error response:', JSON.stringify(response.error, null, 2));
            
            // Provide helpful debugging hints
            if (errorMessage.includes('No token received')) {
                console.error('💡 Debug hint: Backend did not receive token from GitHub');
                console.error('   1. Check backend GITHUB_CLIENT_SECRET in .env');
                console.error('   2. Verify redirect_uri matches exactly');
                console.error('   3. Check GitHub app Client ID/Secret are correct');
                console.error('   4. See GITHUB_OAUTH_BACKEND_TROUBLESHOOTING.md for more');
            } else if (errorMessage.includes('Invalid GitHub token')) {
                console.error('💡 Debug hint: GitHub returned invalid credentials');
                console.error('   1. Authorization code may have expired (10 min limit)');
                console.error('   2. Code may have already been used (single-use)');
                console.error('   3. Try fresh authentication in incognito window');
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

// ==================== X (TWITTER) OAUTH IMPLEMENTATION ====================

/**
 * Generate a cryptographically random code verifier for PKCE
 * X OAuth 2.0 requires PKCE for all authorization code flows
 */
function generateCodeVerifier(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return btoa(String.fromCharCode(...array))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
}

/**
 * Generate a code challenge from a code verifier using SHA-256 (S256 method)
 */
async function generateCodeChallenge(codeVerifier: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(codeVerifier);
    const digest = await crypto.subtle.digest('SHA-256', data);
    return btoa(String.fromCharCode(...new Uint8Array(digest)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
}

/**
 * Initiates X (Twitter) OAuth flow using Authorization Code with PKCE
 */
export function initiateXAuth(redirectUrl?: string): Promise<XAuthResponse> {
    return new Promise((resolve, reject) => {
        const clientId = process.env.NEXT_PUBLIC_X_CLIENT_ID;
        
        if (!clientId) {
            reject(new Error('X Client ID not configured'));
            return;
        }

        // Build the OAuth URL
        const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
        const callbackUrl = `${baseUrl}/auth/callback/x`;
        
        const params = new URLSearchParams({
            client_id: clientId,
            redirect_uri: callbackUrl,
            response_type: 'code',
            scope: 'tweet.read users.read offline.access users.email',
            state: redirectUrl || '/exampapers',
        });

        const authUrl = `https://twitter.com/i/oauth2/authorize?${params.toString()}`;

        // Open popup window
        const width = 500;
        const height = 600;
        const left = window.screenX + (window.outerWidth - width) / 2;
        const top = window.screenY + (window.outerHeight - height) / 2;

        const popup = window.open(
            authUrl,
            'X Sign In',
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

            if (event.data.type === 'X_AUTH_SUCCESS') {
                window.removeEventListener('message', handleMessage);
                popup.close();
                resolve(event.data.data);
            } else if (event.data.type === 'X_AUTH_ERROR') {
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
 * Backend handles the code exchange with X (Twitter) securely
 */
export async function exchangeXCode(code: string, provider: SocialProvider = 'twitter', codeVerifier?: string) {
    try {
        console.log('🔄 Sending X authorization code to backend...', { provider, codeLength: code.length });
        
        // Send the authorization code to backend
        const callbackUrl = typeof window !== 'undefined' 
            ? `${window.location.origin}/auth/callback/x`
            : '';
        
        console.log('📍 Callback URL:', callbackUrl);
        console.log('📋 Request body:', { code: code.substring(0, 20) + '...', redirect_uri: callbackUrl });
        
        const response = await api.POST('/api/v1/user/social-auth/{provider}/callback', {
            params: {
                path: { provider: provider as any }
            },
            body: {
                code: code,
                redirect_uri: callbackUrl,
                ...(codeVerifier ? { code_verifier: codeVerifier } : {})
            } as any
        });

        console.log('📋 Backend response:', response);
        console.log('📊 Response structure:', response ? Object.keys(response) : 'null');

        if (response.error) {
            console.error('❌ Backend error object:', response.error);
            
            // Extract detailed error message
            let errorMessage = 'Failed to authenticate with X';
            const err = response.error as any;
            if (typeof err === 'object') {
                if (err.detail && Array.isArray(err.detail)) {
                    errorMessage = err.detail.map((d: any) => d.msg).join(', ');
                } else if (err.detail) {
                    errorMessage = typeof err.detail === 'string' ? err.detail : JSON.stringify(err.detail);
                } else if (err.message) {
                    errorMessage = err.message;
                } else {
                    errorMessage = JSON.stringify(err);
                }
            } else if (typeof err === 'string') {
                errorMessage = err;
            }
            
            console.error('🔴 Detailed error message:', errorMessage);
            console.error('🔴 Full error response:', JSON.stringify(response.error, null, 2));
            
            throw new Error(`Backend error: ${errorMessage}`);
        }

        return response.data;
    } catch (error) {
        console.error('❌ Error exchanging X code:', error);
        throw error;
    }
}

/**
 * Complete X authentication flow
 * This is the main function to call from your login page
 */
export async function loginWithX(redirectUrl?: string): Promise<{
    success: boolean;
    token?: string;
    error?: string;
}> {
    try {
        // Step 1: Initiate OAuth and get authorization code
        console.log('🔐 Initiating X OAuth...');
        const authResponse = await initiateXAuth(redirectUrl);
        
        return {
            success: true,
        };
    } catch (error) {
        console.error('❌ X auth error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Authentication failed',
        };
    }
}

/**
 * Direct redirect approach for X with PKCE (required by X OAuth 2.0)
 * Generates code verifier/challenge and stores verifier in sessionStorage
 * for use in the callback page token exchange.
 */
export async function redirectToXAuth(redirectUrl?: string) {
    const clientId = process.env.NEXT_PUBLIC_X_CLIENT_ID;
    
    if (!clientId) {
        throw new Error('X Client ID not configured');
    }

    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const callbackUrl = `${baseUrl}/auth/callback/x`;

    // Generate PKCE values (required by X OAuth 2.0)
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = await generateCodeChallenge(codeVerifier);

    // Store the verifier so the callback page can use it during code exchange
    sessionStorage.setItem('x_code_verifier', codeVerifier);
    
    const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: callbackUrl,
        response_type: 'code',
        scope: 'tweet.read users.read offline.access users.email',
        state: redirectUrl || '/exampapers',
        code_challenge: codeChallenge,
        code_challenge_method: 'S256',
    });

    const authUrl = `https://twitter.com/i/oauth2/authorize?${params.toString()}`;
    
    window.location.href = authUrl;
}
