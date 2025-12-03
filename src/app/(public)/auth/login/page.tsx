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
import { Eye, EyeOff, Mail, Lock, Github, Chrome } from 'lucide-react';
import type { LoginFormData } from '@/lib/validation';
import { redirectToGoogleAuth, redirectToGitHubAuth } from '@/lib/social-auth';

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

    const handleGitHubLogin = () => {
        try {
            // Redirect to GitHub OAuth
            redirectToGitHubAuth(redirectUrl);
        } catch (error) {
            console.error('GitHub login error:', error);
            alert('Failed to initiate GitHub login. Please check your configuration.');
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

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">
                            Or continue with
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <Button 
                        variant="outline" 
                        className="w-full"
                        type="button"
                        onClick={() => handleGitHubLogin()}
                        disabled={isLoading}
                    >
                        <Github className="mr-2 h-4 w-4" />
                        GitHub
                    </Button>
                    <Button 
                        variant="outline" 
                        className="w-full"
                        type="button"
                        onClick={() => handleGoogleLogin()}
                        disabled={isLoading}
                    >
                        <Chrome className="mr-2 h-4 w-4" />
                        Google
                    </Button>
                </div>

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