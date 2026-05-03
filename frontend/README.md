# Exampapel Frontend

A modern Next.js frontend application for the Exampapel exam papers management system.

## Tech Stack

- **Framework**: Next.js 15+ (App Router)
- **UI Components**: shadcn/ui
- **Styling**: Tailwind CSS
- **Authentication**: Better-Auth (email/password + social providers)
- **State Management**: Zustand
- **API Integration**: openapi-fetch + openapi-typescript
- **Type Safety**: TypeScript
- **Deployment**: Docker

## Features

- 🔐 Secure authentication with JWT tokens
- 👥 Role-based access control (Admin, Manager, User)
- 📊 Admin dashboard and management panels
- 📝 Exam papers and questions management
- 🔍 Public exam papers browser
- 📱 Responsive design
- 🔄 Automatic token refresh
- 🛡️ Protected routes with middleware

## Getting Started

See [TASK.md](./TASK.md) for detailed development tasks and [PRD.md](./PRD.md) for product requirements.

## Development

```bash
# Install dependencies
npm install

# Generate API types from backend
npm run generate-api

# Start development server
npm run dev
```

## Docker

```bash
# Build and run with Docker
docker build -t exampapel-frontend .
docker run -p 3000:3000 exampapel-frontend
```

## Project Structure

```
src/
├── app/                 # Next.js App Router
├── components/          # Reusable components
│   └── ui/             # shadcn/ui components
├── lib/                # Utilities and configurations
│   ├── api.ts          # API client setup
│   └── utils.ts        # General utilities
├── types/              # Generated and custom types
├── hooks/              # Custom React hooks
└── stores/             # Zustand stores
```

## Environment Variables

Copy `.env.example` to `.env.local` and configure:

```bash
NEXT_PUBLIC_API_URL=http://fastapi.localhost/api/v1
BETTER_AUTH_SECRET=your-secret-key
BETTER_AUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run generate-api` - Generate API types from backend
- `npm run type-check` - Run TypeScript type checking

## Contributing

1. Follow the task breakdown in [TASK.md](./TASK.md)
2. Ensure all TypeScript types are properly defined
3. Write tests for new components and features
4. Follow the established code style and conventions
5. Update documentation as needed

## License

This project is licensed under the MIT License.
