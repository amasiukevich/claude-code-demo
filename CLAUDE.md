# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

UIGen is an AI-powered React component generator with live preview. It allows users to describe React components through chat and see them rendered in real-time with a virtual file system.

## Development Commands

```bash
# Development
npm run dev              # Start development server with Turbopack
npm run dev:daemon       # Start dev server in background with log output

# Build & Deploy
npm run build            # Create production build
npm run start            # Start production server

# Testing & Quality
npm run test             # Run Vitest tests
npm run lint             # Run ESLint

# Database
npm run setup            # Install deps + generate Prisma client + run migrations
npm run db:reset         # Reset database (force)

# Prisma (if needed manually)
npx prisma generate      # Generate Prisma client
npx prisma migrate dev   # Run database migrations
```

## Architecture

### Core Components Structure
- **Virtual File System**: Custom implementation in `src/lib/file-system.ts` handles in-memory file operations
- **Chat Interface**: AI-powered component generation using Anthropic Claude via Vercel AI SDK
- **Live Preview**: Real-time React component rendering using Babel standalone transformation
- **Context Providers**: 
  - `FileSystemContext`: Manages virtual files and tool calls from AI
  - `ChatContext`: Handles AI chat and integrates with file system

### Key Directories
- `src/app/`: Next.js App Router pages and API routes
- `src/components/`: UI components organized by feature (auth, chat, editor, preview, ui)
- `src/lib/`: Core business logic, contexts, and utilities
- `src/actions/`: Server actions for project CRUD operations
- `prisma/`: Database schema and migrations

### Database Schema
- **User**: Authentication with email/password
- **Project**: User projects with messages and file data stored as JSON strings
- Anonymous users can work without accounts (data not persisted)

### AI Integration
- Uses Anthropic Claude via `/api/chat/route.ts`
- Tool calling system for file operations (`str_replace_editor`, `file_manager`)
- Project context maintained through chat messages and file system state

## Key Technologies
- **Next.js 15** with App Router and Turbopack
- **React 19** with latest concurrent features
- **TypeScript** with strict configuration
- **Tailwind CSS v4** for styling
- **Prisma** with SQLite for data persistence
- **Anthropic AI SDK** for component generation
- **Monaco Editor** for code editing
- **Vitest** for testing with jsdom environment

## Special Notes
- Files are never written to disk during development - everything uses virtual file system
- The app works without an API key (returns static code instead of AI-generated)
- Anonymous users can work but data isn't persisted
- Component preview uses Babel standalone for real-time JSX transformation

## Code Writing Guidelines
- Always use descriptive names for the variables
- Only comment the complex code

## AI Interaction Guidelines
- When asked about the database, use @prisma/schema.prisma file, as it contains the schema for the local sqlite database