# Exampapel Frontend (Next.js)

Welcome to the frontend application for **Exampapel** — the B2C student hub of the **Examify.ai** ecosystem.

This application provides students with an interactive platform to access highly accurate, AI-generated step-by-step answers for authentic past papers, eliminating the friction of hunting down professors or textbooks.

## 🚀 Mission
Exampapel serves as the ultimate growth engine for the Examify ecosystem. By making high-quality revision tools entirely free for students, we democratize education across Africa. Our RAG-powered intelligence guarantees zero hallucinations because the data is strictly sourced from verified institutional materials.

## 🛠️ Tech Stack
- **Framework:** Next.js 15+ (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui & Radix UI
- **Rich Text Editor:** Editor.js (for rendering interactive math/science questions)
- **Authentication:** Better-Auth (Email/Password & Social OAuth)
- **State Management:** Zustand & React Query (@tanstack/react-query)
- **API Client:** openapi-fetch + openapi-typescript (End-to-end type safety with FastAPI backend)

## ⚙️ Key Features
- **Public Exam Browser:** Searchable repository of digitized past papers.
- **Interactive Revision:** Topic-based quizzes and step-by-step AI marking schemes.
- **Role-Based Dashboards:** Separate experiences for Students, Educators, and Admins.
- **Mobile-First Design:** Fully responsive interface tailored for the African mobile context.

---

## 💻 Local Development

### 1. Environment Setup
Copy the environment variables template:
```bash
cp .env.example .env.local
```
Update `.env.local` to point to the local backend:
```env
NEXT_PUBLIC_API_URL=http://fastapi.localhost/api/v1
BETTER_AUTH_SECRET=your_dev_secret_key
BETTER_AUTH_URL=http://localhost:3000
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Generate API Types
We use `openapi-typescript` to ensure our frontend stays perfectly in sync with the FastAPI backend. Make sure the backend is running locally, then run:
```bash
npm run generate-api
```

### 4. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

---

## 🏗️ Project Structure
```text
src/
├── app/             # Next.js App Router (Pages, Layouts, API Routes)
├── components/      # Reusable UI components
│   └── ui/          # shadcn/ui generic components
├── lib/             # Utility functions, API clients, and constants
├── hooks/           # Custom React hooks
├── stores/          # Zustand global state managers
└── types/           # Generated API types and interfaces
```

## 🧪 Scripts
- `npm run dev`: Start the development server with Turbopack.
- `npm run build`: Build for production.
- `npm run generate-api`: Fetch the `openapi.json` from the backend and generate TypeScript definitions.
- `npm run format`: Format the code using Prettier.
- `npm run type-check`: Run strict TypeScript validation without emitting files.

---
*Built with ❤️ for African Education.*
