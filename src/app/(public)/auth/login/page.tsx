'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { loginSchema } from '@/lib/validation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import type { LoginFormData } from '@/lib/validation';
import { redirectToGoogleAuth, redirectToXAuth } from '@/lib/social-auth';

// Official X (Twitter) Logo
const XLogo = () => (
    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.657l-5.207-6.807-5.979 6.807H2.556l7.73-8.835L1.488 2.25h6.876l4.722 6.244 5.892-6.244zM17.552 20.917h1.833L5.697 4.636H3.867l13.685 16.281z"/>
    </svg>
);

// Official Google Logo
const GoogleLogo = () => (
    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
);

function LoginForm() {
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { login, isAuthenticated, logout } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    });

    // Get redirect URL from query params or default to dashboard
    const redirectUrl = searchParams.get('redirect') || '/dashboard';

    // Handle authentication state on component mount
    useEffect(() => {
        // If user is already authenticated, redirect them
        if (isAuthenticated) {
            router.push(redirectUrl);
        }
    }, [isAuthenticated, redirectUrl, router]);

    // Clear any expired tokens on component mount (only once)
    useEffect(() => {
        // Check if there are any expired tokens to clear silently
        const token = localStorage.getItem('auth-token');
        if (token && !isAuthenticated) {
            // Clear tokens silently without showing notification
            localStorage.removeItem('auth-token');
            document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        }
    }, []); // Empty dependency array - runs only once on mount

    const onSubmit = async (data: LoginFormData) => {
        setIsLoading(true);
        try {
            const result = await login(data);
            if (result.success) {
                // Redirect to the original destination or dashboard
                router.push(redirectUrl);
            }
        } catch (error) {
            console.error('Login error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        try {
            // Redirect to Google OAuth
            redirectToGoogleAuth(redirectUrl);
        } catch (error) {
            console.error('Google login error:', error);
            alert('Failed to initiate Google login. Please check your configuration.');
        }
    };

    const handleXLogin = async () => {
        try {
            // Redirect to X (Twitter) OAuth
            await redirectToXAuth(redirectUrl);
        } catch (error) {
            console.error('X login error:', error);
            alert('Failed to initiate X login. Please check your configuration.');
        }
    };

    return (
        <Card className="w-full">
            <CardHeader className="space-y-1">
                <CardTitle className="text-2xl text-center">Sign in to your account</CardTitle>
                <CardDescription className="text-center">
                    Enter your email and password to access your account
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <Button 
                        variant="outline" 
                        className="w-full"
                        type="button"
                        onClick={() => handleXLogin()}
                        disabled={isLoading}
                    >
                        <XLogo />
                        X
                    </Button>
                    <Button 
                        variant="outline" 
                        className="w-full"
                        type="button"
                        onClick={() => handleGoogleLogin()}
                        disabled={isLoading}
                    >
                        <GoogleLogo />
                        Google
                    </Button>
                </div>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">
                            Or sign in with email
                        </span>
                    </div>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="email"
                                type="email"
                                placeholder="Enter your email"
                                className="pl-10"
                                {...register('email')}
                            />
                        </div>
                        {errors.email && (
                            <p className="text-sm text-red-600">{errors.email.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Enter your password"
                                className="pl-10 pr-10"
                                {...register('password')}
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? (
                                    <EyeOff className="h-4 w-4" />
                                ) : (
                                    <Eye className="h-4 w-4" />
                                )}
                            </Button>
                        </div>
                        {errors.password && (
                            <p className="text-sm text-red-600">{errors.password.message}</p>
                        )}
                    </div>

                    <div className="flex items-center justify-between">
                        <Link
                            href="/auth/forgot-password"
                            className="text-sm text-blue-600 hover:text-blue-500"
                        >
                            Forgot your password?
                        </Link>
                    </div>

                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? 'Signing in...' : 'Sign in'}
                    </Button>
                </form>

                <div className="text-center text-sm">
                    Don't have an account?{' '}
                    <Link href="/auth/register" className="text-blue-600 hover:text-blue-500">
                        Sign up
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
}

export default function LoginPage() {
    return <LoginForm />;
} 