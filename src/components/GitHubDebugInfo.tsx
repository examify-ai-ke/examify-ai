'use client';

import React, { useState, useEffect } from 'react';

export const GitHubDebugInfo = () => {
    const [debugInfo, setDebugInfo] = useState<any>({});

    useEffect(() => {
        const info = {
            timestamp: new Date().toISOString(),
            currentUrl: window.location.href,
            origin: window.location.origin,
            protocol: window.location.protocol,
            hostname: window.location.hostname,
            port: window.location.port,
            pathname: window.location.pathname,
            search: window.location.search,
            githubClientId: process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID,
            apiUrl: process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL,
            redirectUri: `${window.location.origin}/auth/callback/github`,
            redirectUriGoogle: `${window.location.origin}/auth/callback/google`,
        };
        
        setDebugInfo(info);
        console.log('🔍 GitHub OAuth Debug Info:', info);
    }, []);

    return (
        <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded-lg text-xs max-w-md z-50 opacity-75">
            <h3 className="font-bold mb-2">GitHub OAuth Debug</h3>
            <pre className="whitespace-pre-wrap">
                {JSON.stringify(debugInfo, null, 2)}
            </pre>
            <p className="mt-2 text-yellow-300">
                📋 Check this info matches your GitHub OAuth App settings
            </p>
        </div>
    );
};