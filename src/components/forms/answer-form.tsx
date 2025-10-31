'use client'

import React, { useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import Editor from '@/components/ui/editor'
import { OutputData } from '@editorjs/editorjs'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { adminAPI } from '@/lib/api-admin'
import { useUIStore } from '@/stores/ui'
import type { components } from '@/types/generated/api'

type AnswerRead = components['schemas']['AnswerRead']

// Answer form schema - more lenient validation
const answerFormSchema = z.object({
    text: z.custom<OutputData>(
        data => {
            // Allow any data structure that looks like OutputData
            return data && typeof data === 'object';
        },
        'Answer text is required'
    ),
})

type AnswerFormData = z.infer<typeof answerFormSchema>

interface AnswerFormProps {
    questionId: string
    answer?: AnswerRead
    onSuccess?: () => void
    onCancel?: () => void
}

export function AnswerForm({ questionId, answer, onSuccess, onCancel }: AnswerFormProps) {
    const { addNotification } = useUIStore()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const isEditing = !!answer
    const editorInstanceRef = useRef<any>(null)

    const form = useForm<AnswerFormData>({
        resolver: zodResolver(answerFormSchema),
        defaultValues: {
            text: answer?.text || {
                time: Date.now(),
                blocks: [
                    {
                        id: 'initial',
                        type: 'paragraph',
                        data: {
                            text: ''
                        }
                    }
                ],
                version: '2.22.2'
            },
        },
    });

    const onSubmit = async (data: AnswerFormData) => {
        try {
            setIsSubmitting(true)

            // Validate that we have actual content
            const hasContent = data.text.blocks.some(block => {
                if (block.type === 'paragraph' && block.data?.text) {
                    return block.data.text.trim().length > 0;
                }
                // Non-paragraph blocks (images, tables, etc.) count as content
                return block.type !== 'paragraph';
            });

            if (!hasContent) {
                addNotification({
                    type: 'error',
                    title: 'Validation Error',
                    message: 'Please enter some content for the answer before submitting.'
                });
                setIsSubmitting(false);
                return;
            }

            const answerPayload = {
                text: { ...data.text, time: data.text.time || Date.now() },
                question_id: questionId,
            }

            console.log('Submitting answer:', answerPayload);

            let response
            if (isEditing && answer) {
                response = await adminAPI.answers.update(answer.id, answerPayload as any)
            } else {
                response = await adminAPI.answers.create(answerPayload as any)
            }

            if (!response.error) {
                addNotification({
                    type: 'success',
                    title: 'Success',
                    message: `Answer ${isEditing ? 'updated' : 'created'} successfully!`
                })
                onSuccess?.()
            } else {
                const errorMessage = (response.error as any)?.message || 'Failed to save answer'
                addNotification({
                    type: 'error',
                    title: 'Error',
                    message: errorMessage
                })
            }
        } catch (error) {
            console.error('Error saving answer:', error)
            addNotification({
                type: 'error',
                title: 'Error',
                message: 'An unexpected error occurred while saving the answer.'
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleSubmit = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        
        // Get the latest data directly from the editor instance
        if (editorInstanceRef.current) {
            try {
                const currentData = await editorInstanceRef.current.save();
                form.setValue('text', currentData);
                console.log('Got current editor data:', currentData);
            } catch (error) {
                console.error('Error getting editor data:', error);
            }
        }
        
        // Small delay to ensure form state is updated
        await new Promise(resolve => setTimeout(resolve, 50));
        
        form.handleSubmit(onSubmit)();
    };

    return (
        <Form {...form}>
            <div className="space-y-4">
                {/* Answer Text Editor */}
                <FormField
                    control={form.control}
                    name="text"
                    render={({ field }) => (
                        <FormItem className="w-full">
                            <FormLabel className="text-base font-semibold">
                                {isEditing ? 'Edit Answer' : 'Add Answer'}
                            </FormLabel>
                            <FormControl>
                                <div className="w-full rounded-md border-2 border-input bg-white hover:border-primary/50 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                                    <div className="w-full min-h-[150px] max-h-[400px] overflow-y-auto p-4">
                                        <Editor
                                            data={field.value}
                                            onChange={field.onChange}
                                            editorRef={editorInstanceRef}
                                        />
                                    </div>
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Form Actions */}
                <div className="flex justify-end space-x-2 pt-2">
                    {onCancel && (
                        <Button type="button" variant="outline" onClick={onCancel} size="sm">
                            Cancel
                        </Button>
                    )}
                    <Button type="button" onClick={handleSubmit} disabled={isSubmitting} size="sm">
                        {isSubmitting ? (
                            <>
                                <LoadingSpinner className="mr-2 h-4 w-4" />
                                {isEditing ? 'Updating...' : 'Adding...'}
                            </>
                        ) : (
                            <>
                                {isEditing ? 'Update Answer' : 'Add Answer'}
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </Form>
    )
}
