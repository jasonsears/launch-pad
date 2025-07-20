# Copilot Instructions

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Project Overview
This is a job search management web application built with Next.js, TypeScript, and Tailwind CSS. The application helps job seekers—particularly recent graduates and early-career professionals—navigate the job application process.

## Core Features
1. **Job Search Interface** - Integration with Google Programmable Search Engine API
2. **Resume Manager** - Upload, edit, version, and tailor resumes
3. **Application & Outreach Tracker** - Log applications and track status
4. **Interview Prep & Notes** - Save job descriptions and prep notes
5. **Daily Job Search Checklist** - Suggested daily tasks
6. **AI-Enhanced Features** (future) - Resume analysis and job matching

## Technology Stack
- **Frontend**: Next.js 14 with App Router, TypeScript, Tailwind CSS
- **Database**: SQLite with Prisma ORM
- **UI Components**: shadcn/ui components
- **State Management**: React hooks and Context API
- **File Upload**: For resume management
- **API Integration**: Google Custom Search API

## Code Standards
- Use TypeScript for all components and utilities
- Follow Next.js App Router patterns
- Use Tailwind CSS for styling with consistent design system
- Implement proper error handling and loading states
- Use React Server Components where appropriate
- Follow accessibility best practices
- Implement proper form validation
- Use meaningful variable and function names
- Write clean, maintainable code with proper commenting

## Database Schema
- Users table for authentication (future)
- Jobs table for saved job postings
- Applications table for tracking applications
- Resumes table for managing resume versions
- Interview Notes table for prep materials
- Daily Tasks table for checklist functionality

## File Structure
- `/src/app` - Next.js App Router pages and layouts
- `/src/components` - Reusable UI components
- `/src/lib` - Utility functions and configurations
- `/src/types` - TypeScript type definitions
- `/prisma` - Database schema and migrations
- `/public` - Static assets

## Best Practices
- Use server actions for form submissions
- Implement proper loading and error states
- Use React Suspense for data fetching
- Follow responsive design principles
- Implement proper SEO with Next.js metadata
- Use environment variables for API keys
- Implement proper data validation
- Follow security best practices for file uploads
