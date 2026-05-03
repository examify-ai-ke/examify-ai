import React from 'react';
import { Shield, ArrowLeft, Home, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';

interface AccessDeniedProps {
    title?: string;
    message?: string;
    requiredRole?: string;
    showBackButton?: boolean;
    showHomeButton?: boolean;
    className?: string;
}

export function AccessDenied({
    title = "Access Denied",
    message = "You don't have permission to access this page.",
    requiredRole,
    showBackButton = true,
    showHomeButton = true,
    className = "",
}: AccessDeniedProps) {
    const router = useRouter();

    const handleBack = () => {
        if (window.history.length > 1) {
            router.back();
        } else {
            router.push('/dashboard');
        }
    };

    const handleHome = () => {
        router.push('/dashboard');
    };

    return (
        <div className={`flex items-center justify-center min-h-[400px] p-6 ${className}`}>
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                        <Shield className="h-8 w-8 text-red-600" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-gray-900">{title}</CardTitle>
                    <CardDescription className="text-gray-600">
                        {message}
                        {requiredRole && (
                            <span className="block mt-2 text-sm">
                                <AlertTriangle className="inline h-4 w-4 mr-1" />
                                Required role: <span className="font-medium">{requiredRole}</span>
                            </span>
                        )}
                    </CardDescription>
                </CardHeader>
                <CardContent className="text-center space-y-3">
                    <div className="flex flex-col sm:flex-row gap-2 justify-center">
                        {showBackButton && (
                            <Button
                                variant="outline"
                                onClick={handleBack}
                                className="flex items-center gap-2"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Go Back
                            </Button>
                        )}
                        {showHomeButton && (
                            <Button
                                onClick={handleHome}
                                className="flex items-center gap-2"
                            >
                                <Home className="h-4 w-4" />
                                Dashboard
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

// Specific access denied components for common scenarios
export function AdminAccessDenied() {
    return (
        <AccessDenied
            title="Admin Access Required"
            message="You need administrator privileges to access this page."
            requiredRole="Administrator"
        />
    );
}

export function ManagerAccessDenied() {
    return (
        <AccessDenied
            title="Manager Access Required"
            message="You need manager or administrator privileges to access this page."
            requiredRole="Manager or Administrator"
        />
    );
}

export function ContentManagerAccessDenied() {
    return (
        <AccessDenied
            title="Content Management Access Required"
            message="You need content management privileges to access this page."
            requiredRole="Manager or Administrator"
        />
    );
}
