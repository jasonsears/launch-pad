# LaunchPad - Job Search Manager

A comprehensive web application designed to help job seekers—particularly recent graduates and early-career professionals—navigate their job application process with confidence and organization.

![LaunchPad Dashboard](https://img.shields.io/badge/Status-Active%20Development-brightgreen) ![Next.js](https://img.shields.io/badge/Next.js-14-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![Prisma](https://img.shields.io/badge/Prisma-5-2D3748)

## ✨ Current Features

### 🏠 **Dynamic Dashboard**
- **Real-time Statistics**: Total applications, weekly progress, upcoming interviews
- **Application Pipeline**: Visual breakdown of application stages (Viewed → Applied → Interviewing → Offers)
- **Recent Activity**: Latest 5 applications with status indicators
- **Success Metrics**: Offer rate calculations and progress tracking
- **Smart Empty State**: Guided onboarding for new users

### 🔍 **Advanced Job Search**
- **Google Custom Search Integration**: Access to major job boards (LinkedIn, Indeed, Glassdoor, etc.)
- **Smart Filtering**: Location, remote work, experience level, job type, company size
- **Saved Searches**: Save and reload search queries with filters
- **Robust Error Handling**: Graceful degradation with demo data during API rate limits
- **URL State Management**: Shareable search results with persistent state
- **Site-Specific Search**: Target specific job boards programmatically

### 📋 **Complete Application Tracker**
- **Full CRUD Operations**: Create, view, edit, and delete job applications
- **Smart Status Management**: Auto-updates status based on date entries
  - Applied Date → Status: "APPLIED"
  - Interview Date → Status: "INTERVIEWING" 
  - Response Date + Interview → Status: "TECHNICAL_INTERVIEW"
- **Interactive Editing**: Inline editing with save/cancel functionality
- **Advanced Filtering & Sorting**: Filter by status, sort by multiple criteria
- **Date Management**: Applied, interview, and response date tracking (timezone-safe)
- **Notes System**: Detailed notes for each application
- **External Links**: Direct links to original job postings
- **Statistics Dashboard**: Application overview with status counts

### 🎯 **Smart Features**
- **Timezone-Safe Dates**: Prevents date shifting issues across time zones
- **Visual Status Indicators**: Color-coded badges with icons for each application status
- **Real-time Updates**: Optimistic UI with server-side persistence
- **Responsive Design**: Mobile-friendly interface throughout
- **Progressive Enhancement**: Features degrade gracefully without JavaScript

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
  - [x] Complete CRUD application tracking (Create, Read, Update, Delete)
  - [x] Interactive editing with inline forms and save/cancel functionality
  - [x] Smart status progression (Viewed → Applied → Interviewing → Technical → Offer)
  - [x] Date management (Applied, Interview, Response dates) with timezone-safe handling
  - [x] Notes system for detailed tracking and application details
  - [x] Advanced filtering and sorting capabilities by status and multiple criteria
  - [x] Delete functionality with confirmation prompts
  - [x] External job posting links and source tracking
  - [x] Application statistics dashboard with status counts and success metrics
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
**Current Phase:** Phase 2 Complete ✅ → Phase 3 Planning 🚀  
**Production Ready:** Core job search and application tracking features

#### 🎉 Recent Achievements
- ✨ **Complete Application Tracker**: Full CRUD with smart status management
- 📈 **Real Dashboard**: Live data visualization and analytics  
- 🔍 **Robust Job Search**: Error handling, saved searches, state persistence
- 🎨 **Professional UI**: Modern, responsive design with accessibility features
- 🛡️ **Production Quality**: Comprehensive error handling and data validation

**Next Milestone:** Resume Manager and Interview Prep System

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

### 🎮 **Quick Start Guide**

1. **Search for Jobs**: Navigate to Job Search and try searching for positions
2. **Save Applications**: Click "Save Application" on interesting jobs
3. **Track Progress**: Go to Applications to manage your saved jobs
4. **Update Status**: Edit applications to track applied dates, interviews, etc.
5. **Monitor Dashboard**: Check your progress on the main dashboard

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
