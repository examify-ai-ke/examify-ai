'use client'

import React, { useState } from 'react'
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

            const answerPayload = {
                text: { ...data.text, time: data.text.time || Date.now() },
                question_id: questionId,
            }

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

    const handleSubmit = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
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
