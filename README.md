# Bug Tracker App

A full-stack, multi-user bug tracking application designed to help engineering teams capture, triage, and manage defects through their lifecycle.

## Setup & Run Instructions

This application is built with Next.js and uses SQLite for local persistence, making it extremely easy to run without any external database dependencies (like Docker or Postgres).

### Prerequisites
- Node.js (v18.17 or newer)
- npm

### 1. Install dependencies
```bash
npm install
```

### 2. Prepare the Database
The project uses Prisma ORM with a local SQLite file (`dev.db`). Run the following command to sync the database schema and seed it with some initial users and a bug:
```bash
npx prisma db push
npm run seed
```

*(Note: The seed script creates two users: `alice@example.com` and `bob@example.com`. Both have the password `password123`.)*

### 3. Start the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. You will be redirected to the login page. You can log in with a seeded account or register a new one!

---

## Tech Stack & Rationale

- **Framework**: **Next.js (App Router)** - Next.js provides an integrated full-stack environment. Server actions and React Server Components make it trivial to handle form submissions, CRUD operations, and pagination securely on the server without needing to write a separate REST API layer.
- **Language**: **TypeScript** - Used throughout the stack to enforce type safety and reduce runtime errors.
- **Database / ORM**: **SQLite + Prisma** - SQLite was chosen for zero-config local persistence, making it simple for reviewers to pull the repo and run the application in under 10 minutes. Prisma provides excellent type inference across the application.
- **Authentication**: **Custom JWT with `jose` and `bcryptjs`** - Instead of bringing in a heavy NextAuth/Auth.js configuration, a streamlined JWT-in-cookie approach was implemented. `bcryptjs` hashes passwords securely, and `jose` works flawlessly in edge/middleware environments to verify session cookies on every route request.
- **Styling**: **Vanilla CSS (CSS Modules)** - To meet the specific constraint of *avoiding* utility-first frameworks like Tailwind (unless explicitly asked) while delivering a vibrant, dynamic UI. Modern features like CSS variables, flex/grid layouts, and animations are used natively.

## Architectural Overview

- **`src/app`**: The core application logic leveraging Next.js App Router.
  - `(actions)/bugs.ts` & `(actions)/auth.ts`: Server Actions where database interactions and business logic reside.
  - `bugs/`: Protected routes for listing (`page.tsx`), creating (`new/page.tsx`), and viewing bugs (`[id]/page.tsx`).
  - `login/` & `register/`: Public authentication forms.
- **`src/lib`**: Shared utilities.
  - `prisma.ts`: Singleton Prisma client instance.
  - `auth.ts`: Password hashing and JWT token management functions.
- **`src/middleware.ts`**: Edge middleware that intercepts all requests, verifies the JWT cookie, and protects internal routes from unauthenticated access.
- **`prisma/schema.prisma`**: The single source of truth for the data model (User, Bug, Comment, Activity).

## How AI Tools Were Used

This project was built entirely with the assistance of an advanced AI coding assistant (Google DeepMind's Antigravity agent). The AI was utilized to:
1. **Plan Architecture**: Formulate the initial approach regarding database schema, state management, and authentication strategies based on the prompt's constraints.
2. **Generate Code**: The AI generated the vast majority of the React components, CSS Modules, Server Actions, and Prisma schema.
3. **Debug & Resolve Version Issues**: Specifically, managing breaking changes in newer Prisma versions (v7 vs v6/v5) regarding database URLs in the `schema.prisma`. The AI actively rolled back to a stable version (v5) to maintain development velocity during the 6-hour timebox.

All code was reviewed iteratively to ensure it complied with the functional requirements and visual aesthetics requested.

## Assumptions

- **Single Project Context**: The prompt describes a team tracker, so multi-tenant isolation or separate "Projects" were not implemented. All users can see all bugs.
- **Authentication Strictness**: We assumed standard email/password is sufficient without email verification/MFA for this scope.
- **Environment Variables**: While a `.env` is typical for `DATABASE_URL` and `JWT_SECRET`, fallbacks were included in the code so the application runs immediately upon cloning without needing to create a `.env` file manually.

## Trade-offs

- **Custom Auth vs Auth.js**: A lightweight custom JWT implementation was chosen over Auth.js to save setup time and ensure maximum flexibility for simple email/password credentials, which Auth.js sometimes makes cumbersome.
- **Vanilla CSS vs Tailwind**: While Tailwind would have been faster for iterating the UI, Vanilla CSS was mandated. This meant more time spent writing stylesheets (`.module.css`), but it resulted in a clean, highly custom, dark-mode aesthetic.
- **Optimistic UI Updates**: Server actions use `revalidatePath` for simple data updates. While `useOptimistic` could provide a snappier feel for status changes, it was deprioritized in favor of ensuring correctness and a complete audit log via standard server revalidation.

## Future Work

If given more time, the following enhancements would be prioritized:
1. **Rich Text Editor**: Integrating a Markdown or rich-text editor for bug descriptions and comments.
2. **File Attachments**: Allowing users to upload screenshots to S3/Cloud Storage.
3. **Real-time Updates**: Using WebSockets to update the UI when another user comments or changes a bug's status.
4. **Enhanced Filtering**: A more robust filtering UI supporting multi-select for assignees, tags/labels, and date-range queries.
5. **Role-based Access Control (RBAC)**: Distinguishing between standard users and admins (who could delete other users' comments or bugs).
