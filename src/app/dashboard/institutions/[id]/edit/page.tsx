'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import {
    ArrowLeft,
    Save,
    Upload,
    X,
    Building2,
    Image as ImageIcon,
    Trash2,
    Loader2,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Badge } from '@/components/ui/badge'
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'

import { adminAPI } from '@/lib/api-admin'
import { getAuthToken } from '@/lib/api'
import type { components } from '@/types/generated/api'
import { useUIStore } from '@/stores/ui'

type InstitutionRead = components['schemas']['InstitutionRead']
type InstitutionUpdate = components['schemas']['InstitutionUpdate']

// Form validation schema
const institutionEditSchema = z.object({
    name: z.string()
        .min(2, 'Institution name must be at least 2 characters')
        .max(200, 'Institution name must not exceed 200 characters'),
    description: z.string()
        .nullable()
        .optional()
        .refine((val) => !val || val.length >= 10, {
            message: 'Description must be at least 10 characters if provided'
        })
        .refine((val) => !val || val.length <= 1000, {
            message: 'Description must not exceed 1000 characters'
        }),
    category: z.enum(['University', 'College', 'Tvet', 'Tvc', 'Tti', 'Other']),
    key: z.string()
        .optional()
        .refine((val) => !val || val.length <= 10, {
            message: 'Key must not exceed 10 characters'
        }),
    location: z.string()
        .optional()
        .refine((val) => !val || val.length <= 200, {
            message: 'Location must not exceed 200 characters'
        }),
    institution_type: z.enum(['Public', 'Private', 'Other']).nullable(),
    full_profile: z.string()
        .optional()
        .refine((val) => !val || val.startsWith('http'), {
            message: 'Website URL must start with http:// or https://'
        }),
    parent_ministry: z.string()
        .optional()
        .refine((val) => !val || val.length <= 200, {
            message: 'Parent ministry must not exceed 200 characters'
        }),
    kuccps_institution_url: z.string()
        .optional()
        .refine((val) => !val || val.startsWith('http'), {
            message: 'KUCCPS URL must start with http:// or https://'
        }),
    tags: z.string()
        .optional(),
})

type InstitutionEditFormData = z.infer<typeof institutionEditSchema>

export default function EditInstitutionPage() {
    const params = useParams()
    const router = useRouter()
    const { addNotification } = useUIStore()

    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [institution, setInstitution] = useState<InstitutionRead | null>(null)
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
    const [lastSaved, setLastSaved] = useState<Date | null>(null)
    
    // Logo upload states
    const [logoFile, setLogoFile] = useState<File | null>(null)
    const [logoPreview, setLogoPreview] = useState<string | null>(null)
    const [uploadingLogo, setUploadingLogo] = useState(false)

    const form = useForm<InstitutionEditFormData>({
        resolver: zodResolver(institutionEditSchema),
        defaultValues: {
            name: '',
            description: '',
            category: 'University',
            key: '',
            location: '',
            institution_type: 'Public',
            full_profile: '',
            parent_ministry: '',
            kuccps_institution_url: '',
            tags: '',
        },
        mode: 'onChange',
    })

    // Track form changes
    useEffect(() => {
        const subscription = form.watch(() => {
            setHasUnsavedChanges(true)
        })
        return () => subscription.unsubscribe()
    }, [form])

    // Load institution data
    useEffect(() => {
        const loadInstitution = async () => {
            try {
                setIsLoading(true)

                const token = getAuthToken()
                if (!token) {
                    addNotification({
                        type: 'error',
                        title: 'Authentication Error',
                        message: 'Please log in to continue.',
                    })
                    router.push('/auth/login')
                    return
                }

                const response = await adminAPI.institutions.getById(params.id as string)

                if (!response.error && response.data) {
                    const institutionData = (response.data as any).data || response.data
                    setInstitution(institutionData as InstitutionRead)

                    // Set form values
                    form.reset({
                        name: institutionData.name || '',
                        description: institutionData.description || '',
                        category: institutionData.category || 'University',
                        key: institutionData.key || '',
                        location: institutionData.location || '',
                        institution_type: institutionData.institution_type || 'Public',
                        full_profile: institutionData.full_profile || '',
                        parent_ministry: institutionData.parent_ministry || '',
                        kuccps_institution_url: institutionData.kuccps_institution_url || '',
                        tags: institutionData.tags?.join(', ') || '',
                    })

                    // Set logo preview if exists
                    if (institutionData.logo?.media?.path) {
                        setLogoPreview(institutionData.logo.media.path)
                    } else if (institutionData.logo?.url) {
                        setLogoPreview(institutionData.logo.url)
                    }

                    setLastSaved(new Date())
                    setHasUnsavedChanges(false)
                } else {
                    const errorMessage = (response.error as any)?.detail?.[0]?.msg ||
                        (typeof response.error === 'string' ? response.error : 'Failed to load institution')
                    throw new Error(errorMessage)
                }
            } catch (error) {
                console.error('Error loading institution:', error)
                addNotification({
                    type: 'error',
                    title: 'Load Error',
                    message: error instanceof Error ? error.message : 'Failed to load institution data',
                })
                router.push('/dashboard/institutions')
            } finally {
                setIsLoading(false)
            }
        }

        if (params.id) {
            loadInstitution()
        }
    }, [params.id, router, addNotification, form])

    // Handle logo file selection
    const handleLogoSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (file) {
            // Validate file type
            const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
            if (!validTypes.includes(file.type)) {
                addNotification({
                    type: 'error',
                    title: 'Invalid File Type',
                    message: 'Please select a valid image file (JPEG, PNG, WebP, or GIF)',
                })
                return
            }

            // Validate file size (max 5MB)
            const maxSize = 5 * 1024 * 1024 // 5MB
            if (file.size > maxSize) {
                addNotification({
                    type: 'error',
                    title: 'File Too Large',
                    message: 'Logo file must be smaller than 5MB',
                })
                return
            }

            setLogoFile(file)
            setHasUnsavedChanges(true)
            
            // Create preview
            const reader = new FileReader()
            reader.onload = (e) => {
                setLogoPreview(e.target?.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    // Handle logo upload
    const handleLogoUpload = async () => {
        if (!logoFile || !institution) return

        setUploadingLogo(true)
        try {
            const formData = new FormData()
            formData.append('logo', logoFile)

            const response = await adminAPI.institutions.uploadLogo(institution.id, formData)

            if (!response.error && response.data) {
                addNotification({
                    type: 'success',
                    title: 'Logo Updated',
                    message: 'Institution logo has been updated successfully',
                })
                setLogoFile(null)
                setLastSaved(new Date())
                setHasUnsavedChanges(false)
            } else {
                const errorMessage = (response.error as any)?.detail?.[0]?.msg || 'Failed to upload logo'
                throw new Error(errorMessage)
            }
        } catch (error) {
            console.error('Error uploading logo:', error)
            addNotification({
                type: 'error',
                title: 'Upload Error',
                message: error instanceof Error ? error.message : 'Failed to upload logo',
            })
        } finally {
            setUploadingLogo(false)
        }
    }

    // Handle logo removal
    const handleLogoRemove = async () => {
        if (!institution) return

        try {
            const response = await adminAPI.institutions.removeLogo(institution.id)

            if (!response.error && response.data) {
                setLogoPreview(null)
                setLogoFile(null)
                addNotification({
                    type: 'success',
                    title: 'Logo Removed',
                    message: 'Institution logo has been removed successfully',
                })
                setLastSaved(new Date())
                setHasUnsavedChanges(false)
            } else {
                const errorMessage = (response.error as any)?.detail?.[0]?.msg || 'Failed to remove logo'
                throw new Error(errorMessage)
            }
        } catch (error) {
            console.error('Error removing logo:', error)
            addNotification({
                type: 'error',
                title: 'Remove Error',
                message: error instanceof Error ? error.message : 'Failed to remove logo',
            })
        }
    }

    // Handle form submission
    const onSubmit = async (data: InstitutionEditFormData) => {
        if (!institution) return

        setIsSaving(true)
        try {
            // Prepare update data
            const updateData: InstitutionUpdate = {
                name: data.name,
                description: data.description || null,
                category: data.category,
                key: data.key || null,
                location: data.location || null,
                institution_type: data.institution_type,
                full_profile: data.full_profile || null,
                parent_ministry: data.parent_ministry || null,
                kuccps_institution_url: data.kuccps_institution_url || null,
                tags: data.tags ? data.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
            }

            const response = await adminAPI.institutions.update(institution.id, updateData)

            if (!response.error && response.data) {
                // Upload logo if a new file was selected
                if (logoFile) {
                    await handleLogoUpload()
                }

                addNotification({
                    type: 'success',
                    title: 'Institution Updated',
                    message: 'Institution has been updated successfully',
                })
                setLastSaved(new Date())
                setHasUnsavedChanges(false)
                
                // Redirect to institutions list
                router.push('/dashboard/institutions')
            } else {
                const errorMessage = (response.error as any)?.detail?.[0]?.msg ||
                    (typeof response.error === 'string' ? response.error : 'Failed to update institution')
                throw new Error(errorMessage)
            }
        } catch (error) {
            console.error('Error updating institution:', error)
            addNotification({
                type: 'error',
                title: 'Update Error',
                message: error instanceof Error ? error.message : 'Failed to update institution',
            })
        } finally {
            setIsSaving(false)
        }
    }

    // Handle cancel
    const handleCancel = () => {
        if (hasUnsavedChanges) {
            const confirmCancel = window.confirm('You have unsaved changes. Are you sure you want to cancel?')
            if (!confirmCancel) return
        }
        router.push('/dashboard/institutions')
    }

    if (isLoading) {
        return (
            <div className="container mx-auto py-8">
                <LoadingSpinner />
            </div>
        )
    }

    if (!institution) {
        return (
            <div className="container mx-auto py-8">
                <Card>
                    <CardContent className="pt-6">
                        <p className="text-center text-muted-foreground">Institution not found</p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="container mx-auto py-8 max-w-4xl">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleCancel}
                            className="gap-2"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back
                        </Button>
                        <h1 className="text-3xl font-bold">Edit Institution</h1>
                    </div>
                    <div className="flex items-center gap-2">
                        {lastSaved && (
                            <Badge variant="secondary" className="text-xs">
                                Last saved: {lastSaved.toLocaleTimeString()}
                            </Badge>
                        )}
                        {hasUnsavedChanges && (
                            <Badge variant="outline" className="text-xs">
                                Unsaved changes
                            </Badge>
                        )}
                    </div>
                </div>
                <Breadcrumb
                    items={[
                        { label: 'Dashboard', href: '/dashboard' },
                        { label: 'Institutions', href: '/dashboard/institutions' },
                        { label: `Edit ${institution.name}` }
                    ]}
                />
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* Logo Upload Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <ImageIcon className="h-5 w-5" />
                                Institution Logo
                            </CardTitle>
                            <CardDescription>
                                Upload or update the institution's logo. Recommended size: 400x400px, max 5MB.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-6">
                                {/* Logo Preview */}
                                <div className="relative">
                                    {logoPreview ? (
                                        <div className="relative group">
                                            <img
                                                src={logoPreview}
                                                alt="Institution Logo"
                                                className="w-32 h-32 object-cover rounded-lg border-2 border-border"
                                            />
                                            <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={handleLogoRemove}
                                                    className="gap-2"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                    Remove
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="w-32 h-32 bg-muted rounded-lg border-2 border-border flex items-center justify-center">
                                            <Building2 className="h-12 w-12 text-muted-foreground" />
                                        </div>
                                    )}
                                </div>

                                {/* Upload Controls */}
                                <div className="flex-1 space-y-4">
                                    <div>
                                        <Input
                                            type="file"
                                            accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                                            onChange={handleLogoSelect}
                                            className="hidden"
                                            id="logo-upload"
                                        />
                                        <Label htmlFor="logo-upload">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                className="gap-2 cursor-pointer"
                                                asChild
                                            >
                                                <span>
                                                    <Upload className="h-4 w-4" />
                                                    Choose Logo
                                                </span>
                                            </Button>
                                        </Label>
                                    </div>
                                    
                                    {logoFile && (
                                        <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                                            <div className="flex-1">
                                                <p className="text-sm font-medium">{logoFile.name}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {(logoFile.size / 1024 / 1024).toFixed(2)} MB
                                                </p>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => {
                                                    setLogoFile(null)
                                                    setLogoPreview(institution.logo?.media?.path || null)
                                                }}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    )}

                                    <p className="text-xs text-muted-foreground">
                                        Supported formats: JPEG, PNG, WebP, GIF. Max file size: 5MB.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Basic Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Basic Information</CardTitle>
                            <CardDescription>
                                Update the basic details of the institution.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Institution Name *</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter institution name" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Enter institution description (minimum 10 characters)"
                                                className="min-h-[100px]"
                                                {...field}
                                                value={field.value || ''}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Provide a brief description of the institution.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="category"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Category *</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select category" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="University">University</SelectItem>
                                                    <SelectItem value="College">College</SelectItem>
                                                    <SelectItem value="Tvet">TVET</SelectItem>
                                                    <SelectItem value="Tvc">TVC</SelectItem>
                                                    <SelectItem value="Tti">TTI</SelectItem>
                                                    <SelectItem value="Other">Other</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="institution_type"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Institution Type</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value || undefined}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select type" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="Public">Public</SelectItem>
                                                    <SelectItem value="Private">Private</SelectItem>
                                                    <SelectItem value="Other">Other</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="key"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Institution Key</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter institution key (max 10 characters)" {...field} />
                                        </FormControl>
                                        <FormDescription>
                                            Short identifier for the institution (e.g., "UON" for University of Nairobi).
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>

                    {/* Location & Contact */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Location & Contact</CardTitle>
                            <CardDescription>
                                Update location and contact information.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <FormField
                                control={form.control}
                                name="location"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Location</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter institution location" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="full_profile"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Website URL</FormLabel>
                                        <FormControl>
                                            <Input 
                                                placeholder="https://www.example.com" 
                                                {...field} 
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Official website of the institution.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>

                    {/* Additional Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Additional Information</CardTitle>
                            <CardDescription>
                                Update additional details and links.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <FormField
                                control={form.control}
                                name="parent_ministry"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Parent Ministry</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter parent ministry" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="kuccps_institution_url"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>KUCCPS Institution URL</FormLabel>
                                        <FormControl>
                                            <Input 
                                                placeholder="https://www.kuccps.net/institution/example" 
                                                {...field} 
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            KUCCPS portal link for this institution.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="tags"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tags</FormLabel>
                                        <FormControl>
                                            <Input 
                                                placeholder="Enter tags separated by commas" 
                                                {...field} 
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Add relevant tags separated by commas (e.g., "technology, engineering, medicine").
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleCancel}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSaving || uploadingLogo}
                            className="gap-2"
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4" />
                                    Save Changes
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    )
}