# Exampapel Frontend - Development Guide

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Git
- Docker (optional, for containerized development)

### Setup
```bash
# Clone the repository
git clone <repository-url>
cd exampapel-frontend

# Install dependencies
npm install

# Copy environment variables
cp env.example .env.local

# Generate API types from backend
npm run generate-api

# Start development server
npm run dev
```

Visit `http://localhost:3000` to see the application.

## 📁 Project Structure

```
exampapel-frontend/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── auth/              # Authentication pages
│   │   ├── dashboard/         # Protected dashboard pages
│   │   ├── admin/             # Admin-specific pages
│   │   ├── exampapers/        # Public exam papers pages
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Home page
│   │   └── globals.css        # Global styles
│   ├── components/            # Reusable components
│   │   ├── ui/               # shadcn/ui components
│   │   ├── layout/           # Layout components (Header, Sidebar, Footer)
│   │   ├── forms/            # Form components
│   │   └── features/         # Feature-specific components
│   ├── hooks/                # Custom React hooks
│   ├── lib/                  # Utilities and configurations
│   │   ├── api.ts           # API client setup
│   │   ├── utils.ts         # General utilities
│   │   ├── constants.ts     # Application constants
│   │   └── validation.ts    # Validation schemas
│   ├── stores/              # Zustand stores
│   ├── types/               # Type definitions
│   └── middleware.ts        # Next.js middleware
├── scripts/                 # Build and utility scripts
├── public/                  # Static assets
└── [config files]          # Configuration files
```

## 🛠️ Technology Stack

### Core Technologies
- **Next.js 15+** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Component library

### State Management & Data
- **Zustand** - Lightweight state management
- **openapi-fetch** - Type-safe API client
- **openapi-typescript** - API type generation

### Forms & Validation
- **react-hook-form** - Form handling
- **zod** - Schema validation

### Authentication
- **Better-Auth** - Authentication library
- **JWT tokens** - Secure authentication

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Docker** - Containerization

## 🎯 Current Status

### ✅ Completed (Phase 1-2)
- **Project Setup**: Next.js 15+ with TypeScript
- **Authentication System**: Login, registration, password reset
- **Core Dependencies**: All major libraries installed and configured
- **API Integration**: Type-safe API client with generated schemas
- **State Management**: Zustand stores for auth and UI state
- **Route Protection**: Middleware and client-side guards
- **UI Components**: Complete shadcn/ui component library
- **Development Environment**: Docker, linting, formatting

### 🚧 In Progress (Phase 3)
- **Core UI Components**: Layout components, data tables, search
- **Dashboard Layout**: Responsive sidebar and navigation
- **Component Library**: Loading states, empty states, breadcrumbs

### 📋 Next Phases
- **Phase 4**: Admin Dashboard (User management, analytics)
- **Phase 5**: Exam Papers Management (CRUD operations)
- **Phase 6**: Public Exam Browser (Search, filtering)
- **Phase 7**: Testing & Quality Assurance
- **Phase 8**: Deployment & DevOps

## 🔧 Development Workflow

### Code Standards

#### TypeScript
- Use strict TypeScript configuration
- Always define proper types for props, state, and API responses
- Use generated API types from `src/types/generated/api.ts`
- Avoid `any` type - use proper typing or `unknown`

#### Component Structure
```typescript
// Example component structure
interface ComponentProps {
  title: string;
  onAction?: () => void;
  className?: string;
}

export function Component({ title, onAction, className }: ComponentProps) {
  return (
    <div className={cn('base-styles', className)}>
      <h2>{title}</h2>
      {onAction && <button onClick={onAction}>Action</button>}
    </div>
  );
}
```

#### File Naming
- **Files**: kebab-case (`user-profile.tsx`)
- **Components**: PascalCase (`UserProfile`)
- **Hooks**: camelCase with `use` prefix (`useAuth`)
- **Types**: PascalCase (`UserProfileData`)

### State Management

#### Zustand Stores
```typescript
// Example store structure
interface StoreState {
  data: DataType[];
  loading: boolean;
  error: string | null;
}

interface StoreActions {
  setData: (data: DataType[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  fetchData: () => Promise<void>;
}

export const useStore = create<StoreState & StoreActions>((set, get) => ({
  data: [],
  loading: false,
  error: null,
  
  setData: (data) => set({ data }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  
  fetchData: async () => {
    set({ loading: true, error: null });
    try {
      const data = await api.getData();
      set({ data, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },
}));
```

### API Integration

#### Using Generated Types
```typescript
import { api } from '@/lib/api';
import type { components } from '@/types/generated/api';

type User = components['schemas']['IUserRead'];
type CreateUserRequest = components['schemas']['Body_create_user_api_v1_user_post'];

// API call with type safety
const createUser = async (userData: CreateUserRequest): Promise<User> => {
  const response = await api.POST('/api/v1/user', { body: userData });
  return response.data;
};
```

### Form Handling

#### React Hook Form with Zod
```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

type FormData = z.infer<typeof formSchema>;

export function LoginForm() {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: FormData) => {
    // Handle form submission
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {/* Form fields */}
      </form>
    </Form>
  );
}
```

## 🧪 Testing

### Running Tests
```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:coverage
```

### Test Structure
```
src/
├── __tests__/
│   ├── components/
│   ├── hooks/
│   ├── utils/
│   └── stores/
```

## 🚀 Deployment

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

### Docker
```bash
# Development
docker-compose -f docker-compose.dev.yml up

# Production
docker-compose up --build
```

## 📝 Environment Variables

### Required Variables
```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://fastapi.localhost/api/v1

# Better-Auth Configuration
BETTER_AUTH_SECRET=your-super-secret-key-here
BETTER_AUTH_URL=http://localhost:3000

# OAuth Providers (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

### Optional Variables
```bash
# Application Configuration
NEXT_PUBLIC_APP_NAME=Exampapel
NEXT_PUBLIC_APP_DESCRIPTION=Exam Papers Management System

# Feature Flags
NEXT_PUBLIC_ENABLE_SOCIAL_AUTH=true
NEXT_PUBLIC_ENABLE_DARK_MODE=true
```

## 🔍 Debugging

### Common Issues

#### API Connection Issues
1. Check `NEXT_PUBLIC_API_URL` in `.env.local`
2. Ensure backend is running and accessible
3. Check CORS configuration on backend
4. Verify API schema is up-to-date

#### Authentication Issues
1. Check `BETTER_AUTH_SECRET` is set
2. Verify JWT token storage
3. Check middleware configuration
4. Ensure backend auth endpoints are working

#### Build Issues
1. Clear `.next` directory: `rm -rf .next`
2. Clear node_modules: `rm -rf node_modules && npm install`
3. Check TypeScript errors: `npm run type-check`
4. Verify all dependencies are installed

### Development Tools

#### Browser Extensions
- React Developer Tools
- Redux DevTools (for Zustand)
- Tailwind CSS IntelliSense

#### VS Code Extensions
- TypeScript and JavaScript Language Features
- Tailwind CSS IntelliSense
- Prettier - Code formatter
- ESLint

## 📚 Resources

### Documentation
- [Next.js Documentation](https://nextjs.org/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [React Hook Form Documentation](https://react-hook-form.com/)

### API Documentation
- Generated API types: `src/types/generated/api.ts`
- API client: `src/lib/api.ts`
- Authentication hook: `src/hooks/useAuth.ts`

### Component Library
- UI Components: `src/components/ui/`
- Layout Components: `src/components/layout/`
- Form Components: `src/components/forms/`

## 🤝 Contributing

### Development Process
1. Create feature branch from `main`
2. Follow coding standards and conventions
3. Write tests for new features
4. Update documentation as needed
5. Submit pull request with description

### Code Review Checklist
- [ ] TypeScript types are properly defined
- [ ] Components follow established patterns
- [ ] Tests are included and passing
- [ ] Documentation is updated
- [ ] No linting errors
- [ ] Responsive design considerations
- [ ] Accessibility requirements met

## 🆘 Support

### Getting Help
1. Check this development guide
2. Review existing code examples
3. Check GitHub issues
4. Ask in team chat/discussions

### Reporting Issues
When reporting issues, include:
- Description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Browser/device information
- Error messages/logs
- Screenshots if applicable 