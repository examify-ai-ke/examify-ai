'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

function PapersManageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        // Preserve any query parameters when redirecting
        const queryString = searchParams.toString();
        const redirectUrl = queryString
            ? `/dashboard/exam-papers/manage?${queryString}`
            : '/dashboard/exam-papers/manage';

        router.replace(redirectUrl);
    }, [router, searchParams]);

    return (
        <div className="flex h-96 items-center justify-center">
            <div className="text-center">
                <LoadingSpinner size="lg" />
                <p className="mt-4 text-gray-600">Redirecting to Exam Papers Management...</p>
            </div>
        </div>
    );
}

export default function PapersManageRedirect() {
    return (
        <Suspense fallback={null}>
            <PapersManageContent />
        </Suspense>
    );
}
