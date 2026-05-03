---
inclusion: always
---
# Exampapel Frontend Development Rules

## Project Overview
This is a Next.js 15+ frontend application for an exam papers management system. The project uses TypeScript, shadcn/ui, Zustand for state management, and openapi-fetch for API integration.

## Current Status
- ✅ **Phase 1-2 Complete**: Foundation & Authentication system working
- 🚧 **Phase 3 Active**: Core UI Components & Layout (Tasks 21-30)
- 📋 **Remaining**: Phases 4-8 (Admin Dashboard, Exam Papers Management, Public Browser, Testing, Deployment)

## Technology Stack
- **Framework**: Next.js 15+ with App Router
- **Language**: TypeScript (strict mode)
- **UI**: shadcn/ui components + Tailwind CSS
- **State**: Zustand stores
- **API**: openapi-fetch with generated types
- **Auth**: Better-Auth with JWT tokens
- **Forms**: react-hook-form + zod validation
- **Deployment**: Docker

## Code Standards

### TypeScript
- Use strict TypeScript configuration
- Always define proper types for props, state, and API responses
- Use generated API types from `src/types/generated/api.ts`
- Avoid `any` type - use proper typing or `unknown`

### Component Structure
- Use functional components with hooks
- Follow shadcn/ui component patterns
- Implement proper prop interfaces
- Use React.memo for performance optimization when needed

### File Organization
```
src/
├── app/                 # Next.js App Router pages
├── components/          # Reusable components
│   ├── ui/             # shadcn/ui components
│   ├── forms/          # Form components
│   ├── layout/         # Layout components
│   └── features/       # Feature-specific components
├── hooks/              # Custom React hooks
├── lib/                # Utilities and configurations
├── stores/             # Zustand stores
├── types/              # Type definitions
└── middleware.ts       # Next.js middleware
```

### Naming Conventions
- **Files**: kebab-case (e.g., `user-profile.tsx`)
- **Components**: PascalCase (e.g., `UserProfile`)
- **Hooks**: camelCase with `use` prefix (e.g., `useAuth`)
- **Types**: PascalCase with descriptive names (e.g., `UserProfileData`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `API_ENDPOINTS`)

### State Management
- Use Zustand for global state (auth, UI, etc.)
- Use React state for component-local state
- Use React Query for server state when needed
- Keep stores simple and focused

### API Integration
- Use generated types from OpenAPI schema
- Implement proper error handling
- Use loading states for async operations
- Handle token refresh automatically

### Styling
- Use Tailwind CSS classes
- Follow mobile-first responsive design
- Use shadcn/ui components as base
- Maintain consistent spacing and colors

### Authentication
- All protected routes must use middleware
- Implement proper role-based access control
- Handle token expiration gracefully
- Use secure token storage

### Form Handling
- Use react-hook-form with zod validation
- Implement real-time validation feedback
- Handle form submission states
- Provide user-friendly error messages

### Error Handling
- Use global error boundary
- Implement proper API error handling
- Show user-friendly error messages
- Log errors for debugging

### Performance
- Implement lazy loading for routes
- Use proper image optimization
- Minimize bundle size
- Implement proper caching strategies

## Development Workflow

### Current Phase: Phase 3 - Core UI Components & Layout
**Priority Tasks (21-30):**
1. Create main layout components (header, sidebar, footer)
2. Build dashboard layout system
3. Create data table components
4. Implement search components
5. Build form components
6. Create modal and dialog components
7. Add loading and empty states
8. Implement theme system
9. Build responsive components
10. Create component documentation

### Next Phases:
- **Phase 4**: Admin Dashboard (Tasks 31-40)
- **Phase 5**: Exam Papers Management (Tasks 41-50)
- **Phase 6**: Public Exam Browser (Tasks 51-60)
- **Phase 7**: Testing & Quality Assurance (Tasks 61-70)
- **Phase 8**: Deployment & DevOps (Tasks 71-80)

### Testing Requirements
- Write unit tests for components
- Implement integration tests for auth flows
- Add E2E tests for critical user journeys
- Maintain good test coverage

### Security Considerations
- Validate all user inputs
- Implement proper CSRF protection
- Use secure authentication practices
- Follow OWASP security guidelines

### Accessibility
- Follow WCAG 2.1 AA guidelines
- Implement proper ARIA labels
- Ensure keyboard navigation
- Test with screen readers

## Environment Setup
- Use Node.js 18+ and npm
- Configure environment variables properly
- Use Docker for development and production
- Set up proper linting and formatting

## Documentation
- Document all reusable components
- Maintain up-to-date API documentation
- Create user guides for complex features
- Keep README and task files current

## Git Workflow
- Use descriptive commit messages
- Create feature branches for new development
- Follow conventional commit format
- Keep commits atomic and focused

## Quality Assurance
- Run linting before commits
- Ensure TypeScript compilation passes
- Test on multiple browsers and devices
- Validate accessibility compliance
- Check performance metrics

## Deployment
- Use Docker for containerization
- Implement proper CI/CD pipeline
- Set up monitoring and logging
- Configure proper environment variables
- Implement backup and recovery procedures
description:
globs:
alwaysApply: false
---
