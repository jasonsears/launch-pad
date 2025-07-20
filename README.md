# LaunchPad - Job Search Manager

A comprehensive web application designed to help job seekers—particularly recent graduates and early-career professionals—navigate their job application process with confidence and organization.

## Features

### 🎯 Core Features
- **Dashboard**: Track your job search progress with visual analytics
- **Job Search Interface**: Integration with Google Programmable Search Engine
- **Application Tracker**: Log and manage job applications with status tracking
- **Resume Manager**: Upload, edit, and version your resumes
- **Interview Prep**: Save job descriptions and preparation notes
- **Daily Task Checklist**: Stay organized with suggested daily tasks

### 🔮 Future Features (Planned)
- **AI-Enhanced Features**: Resume analysis and job matching
- **Networking Tracker**: Manage professional contacts and connections
- **Interview Question Bank**: Common questions by role and company

## Technology Stack

- **Frontend**: Next.js 14 with App Router, TypeScript, Tailwind CSS
- **Database**: SQLite with Prisma ORM (development-friendly)
- **UI Components**: Custom components built with Tailwind CSS and Lucide icons
- **Development**: ESLint for code quality, TypeScript for type safety

## Development Plan & Progress

### Phase 1: Foundation ✅
- [x] Project setup with Next.js, TypeScript, and Tailwind CSS
- [x] Database schema design with Prisma
- [x] Basic UI components (Button, Card, Input)
- [x] Navigation structure
- [x] Dashboard layout with mock data
- [x] Project documentation and setup instructions

### Phase 2: Core Features 🚧
- [ ] **Job Search Interface**
  - [ ] Google Custom Search API integration
  - [ ] Search form with filters (location, remote, entry-level)
  - [ ] Job results display with save functionality
  - [ ] Job details page
- [ ] **Application Tracker**
  - [ ] Application form (company, position, status, dates)
  - [ ] Application list view with filtering
  - [ ] Application detail view with notes
  - [ ] Status update functionality
- [ ] **Resume Manager**
  - [ ] File upload functionality
  - [ ] Resume list and version management
  - [ ] Resume viewer/editor
  - [ ] Resume targeting for specific jobs
- [ ] **Interview Prep**
  - [ ] Interview notes creation and editing
  - [ ] Job description storage
  - [ ] Interview question bank
  - [ ] Preparation checklist

### Phase 3: Enhanced Features 🔮
- [ ] **Daily Task System**
  - [ ] Task suggestions based on application status
  - [ ] Custom task creation
  - [ ] Task completion tracking
  - [ ] Daily/weekly goal setting
- [ ] **Analytics & Insights**
  - [ ] Application success rate tracking
  - [ ] Response time analytics
  - [ ] Interview conversion metrics
  - [ ] Visual progress charts
- [ ] **Outreach Tracking**
  - [ ] Contact management (recruiters, employees)
  - [ ] Communication log (emails, calls, LinkedIn)
  - [ ] Follow-up reminders
  - [ ] Networking pipeline

### Phase 4: Advanced Features 🎯
- [ ] **AI-Enhanced Features**
  - [ ] Resume content analysis and suggestions
  - [ ] Job description matching
  - [ ] Interview question generation
  - [ ] Application email templates
- [ ] **User Management**
  - [ ] User authentication (NextAuth.js)
  - [ ] User profiles and preferences
  - [ ] Data export/import functionality
- [ ] **Integrations**
  - [ ] LinkedIn API integration
  - [ ] Calendar integration for interviews
  - [ ] Email integration for application tracking
  - [ ] ATS system integrations

### Current Status
**Last Updated:** July 20, 2025  
**Current Phase:** Phase 1 Complete ✅, Phase 2 Ready to Begin 🚧  
**Next Milestone:** Job Search Interface Implementation

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
