'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Search, Loader2, Check, GraduationCap, AlertCircle } from 'lucide-react';
import { adminAPI } from '@/lib/api-admin';
import type { components } from '@/types/generated/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { EmptyState } from '@/components/ui/empty-state';
import { useUIStore } from '@/stores/ui';

type ProgrammeRead = components['schemas']['ProgrammeRead'];

interface AddProgrammesToDepartmentProps {
    departmentId: string;
    existingProgrammeIds: string[];
    onSuccess: () => void;
    onCancel: () => void;
}

export const AddProgrammesToDepartment: React.FC<AddProgrammesToDepartmentProps> = ({
    departmentId,
    existingProgrammeIds,
    onSuccess,
    onCancel,
}) => {
    const { addNotification } = useUIStore();
    const [programmes, setProgrammes] = useState<ProgrammeRead[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedProgrammeIds, setSelectedProgrammeIds] = useState<Set<string>>(new Set());
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

    // Debounce search query
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Load programmes
    const loadProgrammes = useCallback(async () => {
        try {
            setLoading(true);
            let response;

            if (debouncedSearchQuery.trim()) {
                // Use search endpoint if there's a query
                response = await adminAPI.programmes.search({
                    q: debouncedSearchQuery,
                    limit: 100,
                    skip: 0,
                });
            } else {
                // Use list endpoint for all programmes
                response = await adminAPI.programmes.list({
                    limit: 100,
                    skip: 0,
                });
            }

            if (response.data?.data?.items) {
                // Filter out programmes that are already in the department
                const availableProgrammes = response.data.data.items.filter(
                    (programme) => !existingProgrammeIds.includes(programme.id)
                );
                setProgrammes(availableProgrammes);
            } else {
                setProgrammes([]);
            }
        } catch (error) {
            console.error('Error loading programmes:', error);
            addNotification({
                type: 'error',
                title: 'Failed to load programmes',
                message: 'Please try again later.',
            });
            setProgrammes([]);
        } finally {
            setLoading(false);
        }
    }, [debouncedSearchQuery, existingProgrammeIds, addNotification]);

    useEffect(() => {
        loadProgrammes();
    }, [loadProgrammes]);

    // Toggle programme selection
    const toggleProgramme = (programmeId: string) => {
        const newSelected = new Set(selectedProgrammeIds);
        if (newSelected.has(programmeId)) {
            newSelected.delete(programmeId);
        } else {
            newSelected.add(programmeId);
        }
        setSelectedProgrammeIds(newSelected);
    };

    // Select all programmes
    const selectAll = () => {
        if (selectedProgrammeIds.size === programmes.length) {
            setSelectedProgrammeIds(new Set());
        } else {
            setSelectedProgrammeIds(new Set(programmes.map(p => p.id)));
        }
    };

    // Save selected programmes
    const handleSave = async () => {
        if (selectedProgrammeIds.size === 0) {
            addNotification({
                type: 'warning',
                title: 'No programmes selected',
                message: 'Please select at least one programme to add.',
            });
            return;
        }

        try {
            setSaving(true);

            // Add each selected programme to the department
            const promises = Array.from(selectedProgrammeIds).map((programmeId) =>
                adminAPI.departments.addProgramme(departmentId, programmeId)
            );

            await Promise.all(promises);

            addNotification({
                type: 'success',
                title: 'Programmes added successfully',
                message: `${selectedProgrammeIds.size} programme(s) added to the department.`,
            });

            onSuccess();
        } catch (error: any) {
            console.error('Error adding programmes:', error);
            addNotification({
                type: 'error',
                title: 'Failed to add programmes',
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
                    placeholder="Search programmes by name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                />
            </div>

            {/* Selection Controls */}
            {programmes.length > 0 && (
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2">
                        <Checkbox
                            id="select-all"
                            checked={selectedProgrammeIds.size === programmes.length && programmes.length > 0}
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
                        {selectedProgrammeIds.size} of {programmes.length} selected
                    </Badge>
                </div>
            )}

            {/* Programmes List */}
            <div className="max-h-[400px] overflow-y-auto space-y-2 pr-2">
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <LoadingSpinner />
                    </div>
                ) : programmes.length === 0 ? (
                    <EmptyState
                        icon={GraduationCap}
                        title={searchQuery ? 'No programmes found' : 'No available programmes'}
                        description={
                            searchQuery
                                ? 'Try adjusting your search query'
                                : 'All programmes have been added to this department'
                        }
                    />
                ) : (
                    programmes.map((programme) => (
                        <Card
                            key={programme.id}
                            className={`cursor-pointer transition-all hover:shadow-md ${
                                selectedProgrammeIds.has(programme.id)
                                    ? 'border-blue-500 bg-blue-50/50'
                                    : ''
                            }`}
                            onClick={() => toggleProgramme(programme.id)}
                        >
                            <CardContent className="p-4">
                                <div className="flex items-start gap-3">
                                    <Checkbox
                                        id={`programme-${programme.id}`}
                                        checked={selectedProgrammeIds.has(programme.id)}
                                        onCheckedChange={() => toggleProgramme(programme.id)}
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-semibold text-sm truncate">
                                                    {programme.name}
                                                </h4>
                                                {programme.description && (
                                                    <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                                                        {programme.description}
                                                    </p>
                                                )}
                                            </div>
                                            {selectedProgrammeIds.has(programme.id) && (
                                                <Check className="h-5 w-5 text-blue-600 flex-shrink-0" />
                                            )}
                                        </div>
                                        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                                            {programme.courses && programme.courses.length > 0 && (
                                                <span>
                                                    {programme.courses.length} course(s)
                                                </span>
                                            )}
                                            {programme.departments && programme.departments.length > 0 && (
                                                <span>
                                                    Used in {programme.departments.length} department(s)
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
            {selectedProgrammeIds.size > 0 && (
                <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        You are about to add {selectedProgrammeIds.size} programme(s) to this department.
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
                    disabled={saving || selectedProgrammeIds.size === 0}
                >
                    {saving ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Adding Programmes...
                        </>
                    ) : (
                        <>
                            <Check className="mr-2 h-4 w-4" />
                            Add {selectedProgrammeIds.size > 0 ? `${selectedProgrammeIds.size} ` : ''}
                            Programme(s)
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
};

