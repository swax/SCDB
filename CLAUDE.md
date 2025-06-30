# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

**Development:**

- `npm run dev` - Start development server with Turbopack
- `npm run compile` - TypeScript compilation check
- `npm run lint:next` - Next.js linting
- `npm run lint:more` - ESLint for all files
- `npm run prettier:write` - Format code with Prettier

**Database:**

- `npm run db:push` - Push Prisma schema changes to database
- `npm run db:backup` - Create database backup

**Production:**

- `npm run build:release` - Build for production
- `npm run run:release` - Start production server

## Project Architecture

**The Sketch Comedy Database** is a Next.js 15 app with App Router that powers SketchTV.lol, a community-driven sketch comedy database.

### Tech Stack

- **Frontend**: Next.js 15 + React 19 + TypeScript + Material-UI
- **Backend**: NextAuth.js + Prisma ORM + PostgreSQL
- **Storage**: AWS S3 for images
- **Development**: Turbopack for fast builds

### Directory Structure

- `/app` - Next.js App Router with route groups:
  - `(content)/` - Dynamic content pages using `[...idslug]` pattern
  - `(lists)/` - Grid/list pages for browsing content
  - `edit/` - CMS interface for content editing
- `/backend` - Server-side business logic organized by domain
- `/database` - Prisma schema + custom SQL functions/triggers
- `/shared` - Utilities, types, and common functions

### Database Design

Core content hierarchy: `show` → `season` → `episode` → `sketch`

Key entities:

- Content: show, season, episode, sketch, recurring_sketch
- People: person, character (with cast/credit relationships)
- Organization: category → tag (hierarchical tagging)
- User features: User (role-based), sketch_rating, comprehensive audit trail

### Key Patterns

- **Server Actions**: Forms use Next.js Server Actions instead of API routes
- **Dynamic Routing**: All content uses `[...idslug]` pattern for SEO-friendly URLs
- **CMS System**: Table-driven content management with field-level editing
- **Caching**: ISR with 5-minute revalidation + React cache for data fetching
- **Role-based Access**: User roles from None to Admin control editing permissions

### Environment Variables

Database: `DATABASE_URL`, `DIRECT_URL`
Auth: `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, Google OAuth credentials
AWS: S3 credentials + `NEXT_PUBLIC_STATIC_HOSTNAME`
Config: `MIN_EDIT_ROLE`, `STATIC_PAGE_COUNT`, `DEFAULT_PAGE_LIST_SIZE`

### Code Organization

- Server Components are the default; Client Components marked with 'use client'
- Shared utilities in `/shared` with clear separation of concerns
- Custom hooks in `/app/hooks` for reusable client-side logic
- Backend services organized by domain (cms, content, edit, mgmt, user)
