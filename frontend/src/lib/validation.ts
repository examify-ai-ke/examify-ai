import { z } from 'zod';
import { VALIDATION_CONFIG } from './constants';

// Common validation schemas
export const emailSchema = z
  .string()
  .email('Please enter a valid email address')
  .max(VALIDATION_CONFIG.email.maxLength, 'Email is too long');

export const passwordSchema = z
  .string()
  .min(VALIDATION_CONFIG.password.minLength, `Password must be at least ${VALIDATION_CONFIG.password.minLength} characters`)
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

export const usernameSchema = z
  .string()
  .min(VALIDATION_CONFIG.username.minLength, `Username must be at least ${VALIDATION_CONFIG.username.minLength} characters`)
  .max(VALIDATION_CONFIG.username.maxLength, `Username must be no more than ${VALIDATION_CONFIG.username.maxLength} characters`)
  .regex(VALIDATION_CONFIG.username.pattern, 'Username can only contain letters, numbers, underscores, and hyphens');

export const nameSchema = z
  .string()
  .min(2, 'Name must be at least 2 characters')
  .max(50, 'Name must be no more than 50 characters')
  .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes');

// Authentication schemas
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string().min(1, 'Please confirm your password'),
  firstName: nameSchema,
  lastName: nameSchema,
  username: usernameSchema.optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z.object({
  password: passwordSchema,
  confirmPassword: z.string().min(1, 'Please confirm your password'),
  token: z.string().min(1, 'Reset token is required'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Profile schemas
export const profileUpdateSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema,
  email: emailSchema,
  username: usernameSchema.optional(),
  bio: z.string().max(500, 'Bio must be no more than 500 characters').optional(),
});

export const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordSchema,
  confirmNewPassword: z.string().min(1, 'Please confirm your new password'),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: "Passwords don't match",
  path: ["confirmNewPassword"],
});

// Exam paper schemas
export const examPaperSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be no more than 200 characters'),
  description: z.string().max(1000, 'Description must be no more than 1000 characters').optional(),
  institution: z.string().min(1, 'Institution is required'),
  year: z.number().min(1900).max(new Date().getFullYear() + 1),
  subject: z.string().min(1, 'Subject is required'),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  duration: z.number().min(1, 'Duration must be at least 1 minute').optional(),
  totalMarks: z.number().min(1, 'Total marks must be at least 1').optional(),
});

export const questionSchema = z.object({
  text: z.string().min(1, 'Question text is required'),
  type: z.enum(['multiple_choice', 'essay', 'short_answer', 'true_false']),
  marks: z.number().min(1, 'Marks must be at least 1'),
  options: z.array(z.string()).optional(),
  correctAnswer: z.string().optional(),
  explanation: z.string().max(500, 'Explanation must be no more than 500 characters').optional(),
});

// Search schemas
export const searchSchema = z.object({
  query: z.string().min(VALIDATION_CONFIG.minQueryLength, `Search query must be at least ${VALIDATION_CONFIG.minQueryLength} characters`),
  filters: z.object({
    institution: z.string().optional(),
    year: z.number().optional(),
    subject: z.string().optional(),
    difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
  }).optional(),
});

// Pagination schema
export const paginationSchema = z.object({
  page: z.number().min(1, 'Page must be at least 1'),
  pageSize: z.number().min(1).max(100, 'Page size must be between 1 and 100'),
});

// File upload schema
export const fileUploadSchema = z.object({
  file: z.instanceof(File),
  type: z.enum(['image', 'document', 'pdf']),
  maxSize: z.number().optional(),
});

// Utility functions
export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < VALIDATION_CONFIG.password.minLength) {
    errors.push(`Password must be at least ${VALIDATION_CONFIG.password.minLength} characters`);
  }
  
  if (VALIDATION_CONFIG.password.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (VALIDATION_CONFIG.password.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (VALIDATION_CONFIG.password.requireNumbers && !/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (VALIDATION_CONFIG.password.requireSpecialChars && !/[^A-Za-z0-9]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateFile = (file: File, allowedTypes: string[], maxSize: number): { isValid: boolean; error?: string } => {
  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, error: 'File type not allowed' };
  }
  
  if (file.size > maxSize) {
    return { isValid: false, error: `File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB` };
  }
  
  return { isValid: true };
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= VALIDATION_CONFIG.email.maxLength;
};

// Type exports
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
export type ProfileUpdateFormData = z.infer<typeof profileUpdateSchema>;
export type PasswordChangeFormData = z.infer<typeof passwordChangeSchema>;
export type ExamPaperFormData = z.infer<typeof examPaperSchema>;
export type QuestionFormData = z.infer<typeof questionSchema>;
export type SearchFormData = z.infer<typeof searchSchema>;
export type PaginationFormData = z.infer<typeof paginationSchema>;
export type FileUploadFormData = z.infer<typeof fileUploadSchema>; 