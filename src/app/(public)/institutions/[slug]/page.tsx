'use client';

import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { publicAPI } from '@/lib/api-public';
import { ExamPaperCard } from '@/components/public';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Building2,
  MapPin,
  FileText,
  GraduationCap,
  ArrowLeft,
  AlertCircle,
  Mail,
  Globe,
  Phone,
  Users,
  BookOpen,
  ExternalLink,
} from 'lucide-react';

export default function InstitutionProfilePage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  // Fetch institution by slug
  const { data: institution, isLoading: institutionLoading, error: institutionError } = useQuery({
    queryKey: ['institution', slug],
    queryFn: async () => {
      const result = await publicAPI.institutions.getBySlug(slug);
      if (result.error) {
        throw new Error('Failed to fetch institution');
      }
      return result.data;
    },
    enabled: !!slug,
  });

  // Fetch exam papers for this institution
  const { data: papersData, isLoading: papersLoading } = useQuery({
    queryKey: ['institutionPapers', institution?.id],
    queryFn: async () => {
      if (!institution?.id) return { data: [], total: 0 };
      
      const result = await publicAPI.institutions.getExamPapers(institution.id, {
        skip: 0,
        limit: 12,
      });
      
      if (result.error) {
        throw new Error('Failed to fetch papers');
      }
      
      return {
        data: result.data || [],
        total: result.total || 0,
      };
    },
    enabled: !!institution?.id,
  });

  const isLoading = institutionLoading || papersLoading;

  if (institutionLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (institutionError || !institution) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Institution Not Found
          </h1>
          <p className="text-gray-600 mb-6">
            The institution you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => router.push('/institutions')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Institutions
          </Button>
        </div>
      </div>
    );
  }

  const papers = papersData?.data || [];
  const totalPapers = papersData?.total || (institution as any).exams_count || 0;
  const facultiesCount = (institution as any).faculties_count || 0;
  const campusesCount = (institution as any).campuses_count || 0;
  console.log(institution.logo.media);
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-teal-600 to-blue-600 text-white pb-20">
        <div className="container mx-auto px-4 py-12">
          <Button
            variant="ghost"
            onClick={() => router.push('/institutions')}
            className="mb-6 text-white hover:bg-white/20"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Institutions
          </Button>

          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Institution Logo */}
            <div className="shrink-0">
              <div className="bg-white rounded-2xl p-4 shadow-xl">
                {institution.logo.media ? (
                  <Image
                    src={institution.logo.media?.link|| '/placeholder.svg'}
                    alt={institution.logo.media?.title || 'Institution logo'}
                    width={160}
                    height={160}
                    className="object-contain rounded-lg"
                  />
                ) : (
                  <div className="w-40 h-40 rounded-lg bg-gradient-to-br from-blue-100 to-teal-100 flex items-center justify-center">
                    <Building2 className="h-20 w-20 text-teal-600" />
                  </div>
                )}
              </div>
            </div>

            {/* Institution Info */}
            <div className="flex-1">
              <div className="mb-4">
                <h1 className="text-4xl md:text-5xl font-bold mb-3">
                  {institution.name}
                </h1>
                {institution.key && (
                  <p className="text-xl text-teal-100">
                    {institution.key}
                  </p>
                )}
              </div>

              {institution.description && (
                <p className="text-lg text-white/90 mb-6 max-w-3xl leading-relaxed">
                  {institution.description}
                </p>
              )}

              {/* Quick Stats */}
              <div className="flex flex-wrap gap-4">
                {institution.institution_type && (
                  <Badge className="bg-white/20 hover:bg-white/30 text-white border-white/30 px-4 py-2 text-sm">
                    <GraduationCap className="h-4 w-4 mr-2" />
                    {institution.institution_type}
                  </Badge>
                )}
                {institution.category && (
                  <Badge className="bg-white/20 hover:bg-white/30 text-white border-white/30 px-4 py-2 text-sm">
                    <Building2 className="h-4 w-4 mr-2" />
                    {institution.category}
                  </Badge>
                )}
                {institution.location && (
                  <Badge className="bg-white/20 hover:bg-white/30 text-white border-white/30 px-4 py-2 text-sm">
                    <MapPin className="h-4 w-4 mr-2" />
                    {institution.location}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 -mt-10  py-8">
        <div className="max-w-7xl mx-auto">
          {/* Statistics Cards */}
          {/* <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 relative z-10"> */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 -mt-10 mb-8 relative z-10">
            <Card className="shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Exam Papers</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {totalPapers.toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Faculties</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {facultiesCount.toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl">
                    <Building2 className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Campuses</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {campusesCount.toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl">
                    <BookOpen className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Category</p>
                    <p className="text-xl font-bold text-gray-900">
                      {institution.category || 'N/A'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Tabs */}
          <Tabs defaultValue="papers" className="space-y-6">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="papers" className="gap-2">
                <FileText className="h-4 w-4" />
                Exam Papers
              </TabsTrigger>
              <TabsTrigger value="about" className="gap-2">
                <Building2 className="h-4 w-4" />
                About
              </TabsTrigger>
            </TabsList>

            {/* Exam Papers Tab */}
            <TabsContent value="papers" className="space-y-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">
                        Available Exam Papers
                      </h2>
                      <p className="text-gray-600 mt-1">
                        {totalPapers} {totalPapers === 1 ? 'paper' : 'papers'} available
                      </p>
                    </div>
                    {totalPapers > 12 && (
                      <Button
                        variant="outline"
                        onClick={() => router.push(`/papers?institution=${slug}`)}
                      >
                        View All Papers
                        <ExternalLink className="h-4 w-4 ml-2" />
                      </Button>
                    )}
                  </div>

                  {papersLoading && (
                    <div className="flex items-center justify-center py-20">
                      <LoadingSpinner />
                    </div>
                  )}

                  {!papersLoading && papers.length === 0 && (
                    <div className="text-center py-20 bg-gray-50 rounded-lg">
                      <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        No Exam Papers Yet
                      </h3>
                      <p className="text-gray-600 max-w-md mx-auto">
                        There are no exam papers available for this institution at the moment. 
                        Check back later for updates.
                      </p>
                    </div>
                  )}

                  {!papersLoading && papers.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {papers.map((paper: any) => (
                        <ExamPaperCard
                          key={paper.id}
                          paper={paper}
                          variant="grid"
                          showBookmark={true}
                        />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* About Tab */}
            <TabsContent value="about" className="space-y-6">
              {/* Institution Details */}
              <Card>
                <CardContent className="pt-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    About {institution.name}
                  </h2>
                  
                  {institution.description && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Overview</h3>
                      <p className="text-gray-700 leading-relaxed">
                        {institution.description}
                      </p>
                    </div>
                  )}

                  {institution.full_profile && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Full Profile</h3>
                      <div className="prose prose-gray max-w-none">
                        <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                          {institution.full_profile}
                        </p>
                      </div>
                    </div>
                  )}

                  <Separator className="my-6" />

                  {/* Institution Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Details</h3>
                      <dl className="space-y-3">
                        {institution.institution_type && (
                          <div>
                            <dt className="text-sm font-medium text-gray-600">Type</dt>
                            <dd className="text-base text-gray-900">{institution.institution_type}</dd>
                          </div>
                        )}
                        {institution.category && (
                          <div>
                            <dt className="text-sm font-medium text-gray-600">Category</dt>
                            <dd className="text-base text-gray-900">{institution.category}</dd>
                          </div>
                        )}
                        {institution.location && (
                          <div>
                            <dt className="text-sm font-medium text-gray-600">Location</dt>
                            <dd className="text-base text-gray-900">{institution.location}</dd>
                          </div>
                        )}
                        {institution.parent_ministry && (
                          <div>
                            <dt className="text-sm font-medium text-gray-600">Parent Ministry</dt>
                            <dd className="text-base text-gray-900">{institution.parent_ministry}</dd>
                          </div>
                        )}
                      </dl>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Links</h3>
                      <div className="space-y-3">
                        {institution.kuccps_institution_url && (
                          <a
                            href={institution.kuccps_institution_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-teal-600 hover:text-teal-700 transition-colors"
                          >
                            <Globe className="h-5 w-5" />
                            <span>KUCCPS Profile</span>
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        )}
                      </div>

                      {institution.tags && institution.tags.length > 0 && (
                        <div className="mt-6">
                          <h4 className="text-sm font-medium text-gray-600 mb-2">Tags</h4>
                          <div className="flex flex-wrap gap-2">
                            {institution.tags.map((tag: string, index: number) => (
                              <Badge key={index} variant="secondary">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>


        </div>
      </div>
    </div>
  );
}
