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


### Phase 2: Core Features �
- [x] **Job Search Interface**
  - [x] Google Custom Search API integration
  - [x] Search form with advanced filters (location, remote, entry-level, job type, experience level, job board selection)
  - [x] Job results display with save functionality
  - [x] Saved searches: Save, load, and update search queries and filters
  - [x] Visual indicators for loaded/active saved search
  - [x] Programmatic job board filtering for SaaS flexibility
  - [x] **URL-based state management**: Search results persist across navigation
  - [x] **Session persistence**: Saved job indicators survive page refresh
  - [x] **Smart navigation**: Return to active search from Applications page
- [x] **Application Tracker**
  - [x] Application model in database
  - [x] Save jobs from search results with one-click tracking
  - [x] Application list view showing saved jobs with status
  - [x] Smart back navigation to preserve search state
  - [ ] Application form (company, position, status, dates)
  - [ ] Application detail view with notes
  - [ ] Status update functionality
- [x] **Resume Manager** (schema in place, UI coming soon)
  - [x] Resume model in database
  - [ ] File upload functionality
  - [ ] Resume list and version management
  - [ ] Resume viewer/editor
  - [ ] Resume targeting for specific jobs
- [x] **Interview Prep** (schema in place, UI coming soon)
  - [x] Interview notes model in database
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
**Current Phase:** Phase 2 Core Features in Progress 🚀  
**Recent Milestone:** Job Search Interface & Saved Searches Complete

#### Highlights
- Job search, advanced filtering, and saved search features are fully functional
- Database schema supports jobs, applications, resumes, interview notes, and saved searches
- UI is responsive and modern, built with shadcn/ui and Tailwind CSS
- Project is now public on GitHub and ready for collaboration

**Next Milestone:** Application Tracker and Resume Manager UI Implementation

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm, yarn, pnpm, or bun

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/jasonsears/launch-pad.git
cd launch-pad
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
```
Then edit `.env` and add your Google Custom Search API credentials:
- `NEXT_PUBLIC_GOOGLE_API_KEY`: Get from [Google Cloud Console](https://console.developers.google.com/)
- `NEXT_PUBLIC_GOOGLE_CSE_ID`: Create a Custom Search Engine at [Google CSE](https://cse.google.com/)

4. **Set up the database**
```bash
# Generate Prisma client and create database
npx prisma generate
npx prisma db push
```

5. **Run the development server**
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

### Database Management

The project uses SQLite with Prisma ORM. Each developer gets their own local `dev.db` file.

**Common commands:**
```bash
# Apply schema changes to database
npx prisma db push

# Reset database (WARNING: deletes all data)
npx prisma db push --force-reset

# View database in browser
npx prisma studio

# Generate Prisma client after schema changes
npx prisma generate
```

**Note:** The `dev.db` file is not tracked in Git. Each developer will have their own local database.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
