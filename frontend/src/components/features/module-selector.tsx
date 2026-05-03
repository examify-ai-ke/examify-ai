'use client'

import React, { useState, useEffect } from 'react'
import { Search, BookOpen, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { adminAPI } from '@/lib/api-admin'

interface Module {
    id: string
    name: string
    unit_code?: string
    description?: string
}

interface ModuleSelectorProps {
    selectedModuleIds: string[]
    onSelectionChange: (moduleIds: string[]) => void
    excludeModuleIds?: string[]
    label?: string
    description?: string
}

export function ModuleSelector({
    selectedModuleIds,
    onSelectionChange,
    excludeModuleIds = [],
    label = 'Available Modules',
    description = 'Search and select one or more modules'
}: ModuleSelectorProps) {
    const [modules, setModules] = useState<Module[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')

    useEffect(() => {
        loadModules()
    }, [])

    const loadModules = async () => {
        try {
            setLoading(true)
            const response = await adminAPI.modules.list({ limit: 100, skip: 0 })
            
            let modulesList: Module[] = []
            if (!response.error && response.data) {
                if (response.data.data?.items) {
                    modulesList = response.data.data.items
                } else if (response.data.items) {
                    modulesList = response.data.items
                } else if (Array.isArray(response.data)) {
                    modulesList = response.data
                }
            }
            
            setModules(modulesList)
        } catch (error) {
            console.error('Error loading modules:', error)
            setModules([])
        } finally {
            setLoading(false)
        }
    }

    const handleToggleModule = (moduleId: string) => {
        const newSelection = selectedModuleIds.includes(moduleId)
            ? selectedModuleIds.filter(id => id !== moduleId)
            : [...selectedModuleIds, moduleId]
        onSelectionChange(newSelection)
    }

    const filteredModules = modules
        .filter(module => !excludeModuleIds.includes(module.id))
        .filter(module => {
            if (!searchQuery) return true
            const query = searchQuery.toLowerCase()
            return (
                module.name.toLowerCase().includes(query) ||
                module.unit_code?.toLowerCase().includes(query) ||
                module.description?.toLowerCase().includes(query)
            )
        })

    return (
        <div className="space-y-4">
            {/* Search Input */}
            <div className="space-y-2">
                <Label htmlFor="module-search">Search Modules</Label>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        id="module-search"
                        placeholder="Search by name or code..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                    />
                </div>
            </div>

            {/* Module List */}
            <div className="space-y-2">
                <Label>
                    {label} ({selectedModuleIds.length} selected)
                </Label>
                {loading ? (
                    <div className="p-8 text-center text-sm text-muted-foreground">
                        <LoadingSpinner className="mx-auto mb-2" />
                        Loading modules...
                    </div>
                ) : filteredModules.length > 0 ? (
                    <div className="max-h-[300px] border rounded-md p-4 overflow-y-auto">
                        <div className="space-y-3">
                            {filteredModules.map((module) => (
                                <div
                                    key={module.id}
                                    className="flex items-start space-x-3 p-3 rounded-lg hover:bg-accent cursor-pointer transition-colors"
                                    onClick={() => handleToggleModule(module.id)}
                                >
                                    <Checkbox
                                        checked={selectedModuleIds.includes(module.id)}
                                        onCheckedChange={() => handleToggleModule(module.id)}
                                        className="mt-1"
                                    />
                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium">{module.name}</span>
                                            {module.unit_code && (
                                                <Badge variant="secondary" className="text-xs">
                                                    {module.unit_code}
                                                </Badge>
                                            )}
                                        </div>
                                        {module.description && (
                                            <p className="text-sm text-muted-foreground line-clamp-2">
                                                {module.description}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="p-8 text-center text-sm text-muted-foreground border rounded-md">
                        {searchQuery ? (
                            <>
                                <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                <p>No modules found matching "{searchQuery}"</p>
                            </>
                        ) : (
                            <>
                                <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                <p>No available modules to add</p>
                            </>
                        )}
                    </div>
                )}
            </div>
            
            {description && (
                <p className="text-sm text-muted-foreground">{description}</p>
            )}
        </div>
    )
}
