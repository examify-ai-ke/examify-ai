'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    Building2,
    MapPin,
    Globe,
    Phone,
    Mail,
    ExternalLink,
    School,
    GraduationCap,
    FileText,
    ArrowLeft,
    Award,
    Users,
    BookOpen,
    TrendingUp,
    Shield,
    Star,
    Edit,
    Trash2,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useUIStore } from '@/stores/ui';
import { adminAPI } from '@/lib/api-admin';
import type { components } from '@/types/generated/api';

// Type definitions from API schema
type InstitutionRead = components['schemas']['InstitutionRead'];

// Mock data for detailed view based on reference structure
const mockInstitution: InstitutionRead = {
    id: '1',
    name: 'University of Nairobi',
    description: 'The University of Nairobi is Kenya\'s largest and oldest public university, established in 1956. It offers a wide range of programs and is a leading institution for research and higher education in East Africa.',
    category: 'University' as any,
    key: 'UON',
    location: 'Nairobi County',
    institution_type: 'Public' as any,
    full_profile: 'The University of Nairobi is Kenya\'s largest and oldest public university, established in 1956. It offers a wide range of programs and is a leading institution for research and higher education in East Africa.\n\nThe university has multiple campuses across Nairobi and offers undergraduate and postgraduate programs in various fields including medicine, engineering, law, business, and social sciences. It is recognized as one of the premier institutions of higher learning in Africa.\n\nWith a commitment to excellence in teaching, research, and community service, the University of Nairobi continues to play a pivotal role in Kenya\'s development and the advancement of knowledge across the continent.',
    parent_ministry: 'Ministry of Education',
    tags: ['public', 'research', 'comprehensive'],
    faculties: [],
    campuses: [],
    exam_papers: [],
    exams_count: 1234,
    campuses_count: 6,
    faculties_count: 12,
    logo: null,
    address: {
        id: '1',
        address_line1: 'University of Nairobi P.O. BOX 30197-00100 Nairobi',
        country: 'Kenya',
        address_line2: 'Nairobi',
        county: 'Nairobi County',
        constituency: 'Starehe',
        zip_code: '00100',
        telephone: '+254 (0) 20 4910000',
        telephone2: '+254 700 000000',
        email: 'info@uonbi.ac.ke',
        website: 'https://uonbi.ac.ke',
    },
    kuccps_institution_url: 'https://students.kuccps.net/institutions/1/',
};

export default function InstitutionDetailPage() {
    const params = useParams();
    const router = useRouter();
    const institutionId = params.id as string;
    const { addNotification } = useUIStore();
    const [institution, setInstitution] = useState<InstitutionRead | null>(null);
    const [loading, setLoading] = useState(true);
    const [userRole, setUserRole] = useState<string>('');

    // Get user role for permissions
    useEffect(() => {
        const user = localStorage.getItem('user');
        if (user) {
            const userData = JSON.parse(user);
            setUserRole(userData.role?.name || userData.role || '');
        }
    }, []);

    useEffect(() => {
        const loadInstitution = async () => {
            try {
                setLoading(true);
                const response = await adminAPI.institutions.getById(institutionId);
                if (response.data?.data) {
                    setInstitution(response.data.data);
                } else {
                    throw new Error('No data received from API');
                }
            } catch (error) {
                console.error('Error loading institution:', error);
                console.log('Using mock data - institution API not available');
                setInstitution(mockInstitution);
                addNotification({
                    type: 'warning',
                    title: 'Using offline data',
                    message: 'Could not connect to server. Showing sample data.',
                });
            } finally {
                setLoading(false);
            }
        };
        loadInstitution();
    }, [institutionId, addNotification]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
                <div className="container mx-auto px-4 py-8">
                    <div className="flex items-center justify-center min-h-[400px]">
                        <LoadingSpinner size="lg" />
                    </div>
                </div>
            </div>
        );
    }

    if (!institution) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
                <div className="container mx-auto px-4 py-8">
                    <div className="text-center">
                        <Building2 className="mx-auto h-12 w-12 text-muted-foreground" />
                        <h3 className="mt-2 text-sm font-medium text-foreground">Institution not found</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                            The institution you're looking for doesn't exist or has been removed.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 dark:from-blue-800 dark:via-purple-800 dark:to-indigo-800">
                <div className="container mx-auto px-4 py-8">
                    {/* Back Button */}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.back()}
                        className="mb-6 text-white hover:bg-white/20"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Institutions
                    </Button>

                    {/* Institution Header */}
                    <div className="flex items-start gap-6 text-white">
                        <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30">
                            <Building2 className="h-10 w-10 text-white" />
                        </div>
                        <div className="flex-1 space-y-4">
                            <div>
                                <h1 className="text-3xl font-bold mb-2">{institution.name}</h1>
                                <div className="flex items-center gap-3 mb-3">
                                    <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30">
                                        {institution.institution_type}
                                    </Badge>
                                    <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30">
                                        {institution.category}
                                    </Badge>
                                    <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30">
                                        {institution.key || 'N/A'}
                                    </Badge>
                                </div>
                                <div className="flex items-center gap-6 text-white/90">
                                    <div className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4" />
                                        <span>{institution.location || 'Location not specified'}</span>
                                    </div>
                                    {institution.parent_ministry && (
                                        <div className="flex items-center gap-2">
                                            <Shield className="h-4 w-4" />
                                            <span>{institution.parent_ministry}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Short Description in Hero */}
                            {institution.description && (
                                <p className="text-white/90 text-lg leading-relaxed max-w-3xl">
                                    {institution.description}
                                </p>
                            )}

                            <div className="flex gap-3 pt-2">
                                {institution.address?.website && (
                                    <Button variant="secondary" size="sm" asChild>
                                        <a
                                            href={institution.address.website}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2"
                                        >
                                            <Globe className="h-4 w-4" />
                                            Visit Website
                                        </a>
                                    </Button>
                                )}
                                {institution.kuccps_institution_url && (
                                    <Button variant="outline" size="sm" asChild className="border-white/30 text-white hover:bg-white/20">
                                        <a
                                            href={institution.kuccps_institution_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2"
                                        >
                                            <ExternalLink className="h-4 w-4" />
                                            KUCCPS Portal
                                        </a>
                                    </Button>
                                )}
                                {(userRole === 'admin' || userRole === 'Admin' || userRole === 'manager' || userRole === 'Manager') && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => router.push(`/dashboard/institutions/${institution.id}/edit`)}
                                        className="border-white/30 text-white hover:bg-white/20"
                                    >
                                        <Edit className="h-4 w-4 mr-2" />
                                        Edit Institution
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-8 space-y-8">
                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 -mt-16 relative z-10">
                    <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-blue-100 text-sm font-medium">Faculties</p>
                                    <p className="text-3xl font-bold">{institution.faculties_count || 0}</p>
                                </div>
                                <div className="p-3 bg-white/20 rounded-full">
                                    <GraduationCap className="h-8 w-8" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500 to-green-600 text-white">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-green-100 text-sm font-medium">Campuses</p>
                                    <p className="text-3xl font-bold">{institution.campuses_count || 0}</p>
                                </div>
                                <div className="p-3 bg-white/20 rounded-full">
                                    <Building2 className="h-8 w-8" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-purple-100 text-sm font-medium">Exam Papers</p>
                                    <p className="text-3xl font-bold">{institution.exams_count || 0}</p>
                                </div>
                                <div className="p-3 bg-white/20 rounded-full">
                                    <FileText className="h-8 w-8" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-orange-100 text-sm font-medium">Rating</p>
                                    <p className="text-3xl font-bold flex items-center gap-1">
                                        4.2 <Star className="h-5 w-5 fill-current" />
                                    </p>
                                </div>
                                <div className="p-3 bg-white/20 rounded-full">
                                    <TrendingUp className="h-8 w-8" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* About the Institution - Well Arranged Long Description */}
                {institution.full_profile && (
                    <Card className="border-0 shadow-lg">
                        <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 dark:from-gray-800 dark:to-gray-700 rounded-t-lg">
                            <CardTitle className="flex items-center gap-2 text-xl">
                                <School className="h-6 w-6 text-blue-600" />
                                About the Institution
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8">
                            <div className="prose prose-lg max-w-none">
                                {institution.full_profile.split('\n\n').map((paragraph, index) => (
                                    <div key={index} className="mb-6">
                                        <p className="text-muted-foreground leading-relaxed text-base">
                                            {paragraph}
                                        </p>
                                        {index < institution.full_profile!.split('\n\n').length - 1 && (
                                            <div className="mt-4 w-16 h-0.5 bg-gradient-to-r from-blue-200 to-purple-200 dark:from-blue-800 dark:to-purple-800"></div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Information Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Contact Information & Location Combined */}
                    <Card className="border-0 shadow-lg">
                        <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 dark:from-gray-800 dark:to-gray-700 rounded-t-lg">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <MapPin className="h-5 w-5 text-green-600" />
                                Location & Contact
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            {/* Address Section */}
                            <div className="flex items-start gap-4">
                                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                                    <MapPin className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-semibold mb-2">Address</h4>
                                    <div className="space-y-1 text-sm text-muted-foreground">
                                        <p>{institution.address?.address_line1 || 'Address not available'}</p>
                                        {institution.address?.address_line2 && <p>{institution.address.address_line2}</p>}
                                        <p>{institution.address?.county || institution.location || 'Not specified'}, {institution.address?.country || 'Kenya'}</p>
                                        {institution.address?.constituency && (
                                            <p><span className="font-medium">Constituency:</span> {institution.address.constituency}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            {/* Phone Section */}
                            <div className="flex items-start gap-4">
                                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                                    <Phone className="h-5 w-5 text-green-600 dark:text-green-400" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-semibold mb-2">Phone</h4>
                                    <div className="space-y-1 text-sm text-muted-foreground">
                                        <p>{institution.address?.telephone || '+254 000 000000'}</p>
                                        {institution.address?.telephone2 && <p>{institution.address.telephone2}</p>}
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            {/* Email & Website Section */}
                            <div className="space-y-4">
                                <div className="flex items-start gap-4">
                                    <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                                        <Mail className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-semibold mb-2">Email</h4>
                                        <a
                                            href={`mailto:${institution.address?.email || `info@${institution.key?.toLowerCase() || 'institution'}.ac.ke`}`}
                                            className="text-primary hover:underline text-sm"
                                        >
                                            {institution.address?.email || `info@${institution.key?.toLowerCase() || 'institution'}.ac.ke`}
                                        </a>
                                    </div>
                                </div>

                                {institution.address?.website && (
                                    <div className="flex items-start gap-4">
                                        <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                                            <Globe className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-semibold mb-2">Website</h4>
                                            <a
                                                href={institution.address.website}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-primary hover:underline text-sm flex items-center gap-1"
                                            >
                                                {institution.address.website}
                                                <ExternalLink className="h-3 w-3" />
                                            </a>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Institution Details & Quick Actions */}
                    <Card className="border-0 shadow-lg">
                        <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 dark:from-gray-800 dark:to-gray-700 rounded-t-lg">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Award className="h-5 w-5 text-purple-600" />
                                Details & Actions
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            {/* Institution Details */}
                            <div className="space-y-4">
                                <div>
                                    <h4 className="font-semibold mb-2">Institution Type</h4>
                                    <Badge variant="secondary" className="text-sm">
                                        {institution.institution_type}
                                    </Badge>
                                </div>

                                <div>
                                    <h4 className="font-semibold mb-2">Category</h4>
                                    <Badge variant="outline" className="text-sm">
                                        {institution.category}
                                    </Badge>
                                </div>

                                <div>
                                    <h4 className="font-semibold mb-2">Institution Code</h4>
                                    <p className="text-muted-foreground text-sm">
                                        {institution.key || 'Not specified'}
                                    </p>
                                </div>

                                {institution.parent_ministry && (
                                    <div>
                                        <h4 className="font-semibold mb-2">Parent Ministry</h4>
                                        <p className="text-muted-foreground text-sm">
                                            {institution.parent_ministry}
                                        </p>
                                    </div>
                                )}

                                {institution.tags && institution.tags.length > 0 && (
                                    <div>
                                        <h4 className="font-semibold mb-3">Tags</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {institution.tags.map((tag, index) => (
                                                <Badge key={index} variant="outline" className="text-xs">
                                                    {tag}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <Separator />

                            {/* Quick Actions */}
                            <div className="space-y-3">
                                <h4 className="font-semibold">Quick Actions</h4>

                                <Button variant="outline" className="w-full justify-start h-12" asChild>
                                    <a href={`/dashboard/institutions/${institution.id}/faculties`}>
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                                                <GraduationCap className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                            </div>
                                            <div className="text-left">
                                                <p className="font-medium">View Faculties</p>
                                                <p className="text-xs text-muted-foreground">{institution.faculties_count || 0} faculties</p>
                                            </div>
                                        </div>
                                    </a>
                                </Button>

                                <Button variant="outline" className="w-full justify-start h-12" asChild>
                                    <a href={`/dashboard/exam-papers/manage?institution=${institution.id}`}>
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                                                <FileText className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                            </div>
                                            <div className="text-left">
                                                <p className="font-medium">View Exam Papers</p>
                                                <p className="text-xs text-muted-foreground">{institution.exams_count || 0} papers</p>
                                            </div>
                                        </div>
                                    </a>
                                </Button>

                                <Button variant="outline" className="w-full justify-start h-12">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                                            <Users className="h-4 w-4 text-green-600 dark:text-green-400" />
                                        </div>
                                        <div className="text-left">
                                            <p className="font-medium">View Students</p>
                                            <p className="text-xs text-muted-foreground">Student information</p>
                                        </div>
                                    </div>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}