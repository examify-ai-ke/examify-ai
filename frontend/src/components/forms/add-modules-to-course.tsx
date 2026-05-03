'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Search, Loader2, Check, Library, AlertCircle } from 'lucide-react';
import { adminAPI } from '@/lib/api-admin';
import { ModuleRead } from '@/types/generated/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { EmptyState } from '@/components/ui/empty-state';
import { useUIStore } from '@/stores/ui';

interface AddModulesToCourseProps {
    courseId: string;
    existingModuleIds: string[];
    onSuccess: () => void;
    onCancel: () => void;
}

export const AddModulesToCourse: React.FC<AddModulesToCourseProps> = ({
    courseId,
    existingModuleIds,
    onSuccess,
    onCancel,
}) => {
    const { addNotification } = useUIStore();
    const [modules, setModules] = useState<ModuleRead[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedModuleIds, setSelectedModuleIds] = useState<Set<string>>(new Set());
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

    // Debounce search query
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Load modules
    const loadModules = useCallback(async () => {
        try {
            setLoading(true);
            let response;

            if (debouncedSearchQuery.trim()) {
                // Use search endpoint if there's a query
                response = await adminAPI.modules.search({
                    q: debouncedSearchQuery,
                    limit: 100,
                    skip: 0,
                });
            } else {
                // Use list endpoint for all modules
                response = await adminAPI.modules.list({
                    limit: 100,
                    skip: 0,
                });
            }

            if (response.data?.data?.items) {
                // Filter out modules that are already in the course
                const availableModules = response.data.data.items.filter(
                    (module) => !existingModuleIds.includes(module.id)
                );
                setModules(availableModules);
            } else {
                setModules([]);
            }
        } catch (error) {
            console.error('Error loading modules:', error);
            addNotification({
                type: 'error',
                title: 'Failed to load modules',
                message: 'Please try again later.',
            });
            setModules([]);
        } finally {
            setLoading(false);
        }
    }, [debouncedSearchQuery, existingModuleIds, addNotification]);

    useEffect(() => {
        loadModules();
    }, [loadModules]);

    // Toggle module selection
    const toggleModule = (moduleId: string) => {
        const newSelected = new Set(selectedModuleIds);
        if (newSelected.has(moduleId)) {
            newSelected.delete(moduleId);
        } else {
            newSelected.add(moduleId);
        }
        setSelectedModuleIds(newSelected);
    };

    // Select all modules
    const selectAll = () => {
        if (selectedModuleIds.size === modules.length) {
            setSelectedModuleIds(new Set());
        } else {
            setSelectedModuleIds(new Set(modules.map(m => m.id)));
        }
    };

    // Save selected modules
    const handleSave = async () => {
        if (selectedModuleIds.size === 0) {
            addNotification({
                type: 'warning',
                title: 'No modules selected',
                message: 'Please select at least one module to add.',
            });
            return;
        }

        try {
            setSaving(true);

            // Add each selected module to the course
            const promises = Array.from(selectedModuleIds).map((moduleId) =>
                adminAPI.courses.addModule(courseId, moduleId)
            );

            await Promise.all(promises);

            addNotification({
                type: 'success',
                title: 'Modules added successfully',
                message: `${selectedModuleIds.size} module(s) added to the course.`,
            });

            onSuccess();
        } catch (error: any) {
            console.error('Error adding modules:', error);
            addNotification({
                type: 'error',
                title: 'Failed to add modules',
                message: error.message || 'Please try again later.',
            });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search modules by name or code..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                />
            </div>

            {/* Selection Controls */}
            {modules.length > 0 && (
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2">
                        <Checkbox
                            id="select-all"
                            checked={selectedModuleIds.size === modules.length && modules.length > 0}
                            onCheckedChange={selectAll}
                        />
                        <label
                            htmlFor="select-all"
                            className="text-sm font-medium cursor-pointer"
                        >
                            Select All
                        </label>
                    </div>
                    <Badge variant="secondary">
                        {selectedModuleIds.size} of {modules.length} selected
                    </Badge>
                </div>
            )}

            {/* Modules List */}
            <div className="max-h-[400px] overflow-y-auto space-y-2 pr-2">
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <LoadingSpinner />
                    </div>
                ) : modules.length === 0 ? (
                    <EmptyState
                        icon={Library}
                        title={searchQuery ? 'No modules found' : 'No available modules'}
                        description={
                            searchQuery
                                ? 'Try adjusting your search query'
                                : 'All modules have been added to this course'
                        }
                    />
                ) : (
                    modules.map((module) => (
                        <Card
                            key={module.id}
                            className={`cursor-pointer transition-all hover:shadow-md ${selectedModuleIds.has(module.id)
                                    ? 'border-blue-500 bg-blue-50/50'
                                    : ''
                                }`}
                            onClick={() => toggleModule(module.id)}
                        >
                            <CardContent className="p-4">
                                <div className="flex items-start gap-3">
                                    <Checkbox
                                        id={`module-${module.id}`}
                                        checked={selectedModuleIds.has(module.id)}
                                        onCheckedChange={() => toggleModule(module.id)}
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-semibold text-sm truncate">
                                                    {module.name}
                                                </h4>
                                                {module.unit_code && (
                                                    <Badge variant="outline" className="mt-1">
                                                        {module.unit_code}
                                                    </Badge>
                                                )}
                                            </div>
                                            {selectedModuleIds.has(module.id) && (
                                                <Check className="h-5 w-5 text-blue-600 flex-shrink-0" />
                                            )}
                                        </div>
                                        {module.description && (
                                            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                                                {module.description}
                                            </p>
                                        )}
                                        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                                            {module.courses && module.courses.length > 0 && (
                                                <span>
                                                    Used in {module.courses.length} course(s)
                                                </span>
                                            )}
                                            {module.exam_papers && module.exam_papers.length > 0 && (
                                                <span>
                                                    {module.exam_papers.length} exam paper(s)
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {/* Info Alert */}
            {selectedModuleIds.size > 0 && (
                <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        You are about to add {selectedModuleIds.size} module(s) to this course.
                    </AlertDescription>
                </Alert>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    disabled={saving}
                >
                    Cancel
                </Button>
                <Button
                    type="button"
                    onClick={handleSave}
                    disabled={saving || selectedModuleIds.size === 0}
                >
                    {saving ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Adding Modules...
                        </>
                    ) : (
                        <>
                            <Check className="mr-2 h-4 w-4" />
                            Add {selectedModuleIds.size > 0 ? `${selectedModuleIds.size} ` : ''}
                            Module(s)
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
};

