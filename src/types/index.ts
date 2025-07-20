export interface JobSearchFilters {
  keywords: string
  location: string
  remote: boolean
  entryLevel: boolean
  datePosted?: 'day' | 'week' | 'month'
}

export interface JobResult {
  title: string
  company: string
  location?: string
  source: string
  url: string
  datePosted: string
  snippet?: string
}

export interface ResumeVersion {
  id: string
  title: string
  fileName: string
  version: number
  targetPosition?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export enum ApplicationStatus {
  VIEWED = 'VIEWED',
  PLAN_TO_APPLY = 'PLAN_TO_APPLY',
  APPLIED = 'APPLIED',
  INTERVIEWING = 'INTERVIEWING',
  TECHNICAL_INTERVIEW = 'TECHNICAL_INTERVIEW',
  FINAL_INTERVIEW = 'FINAL_INTERVIEW',
  OFFER = 'OFFER',
  REJECTED = 'REJECTED',
  GHOSTED = 'GHOSTED',
  WITHDRAWN = 'WITHDRAWN'
}

export enum OutreachType {
  INITIAL_CONTACT = 'INITIAL_CONTACT',
  FOLLOW_UP = 'FOLLOW_UP',
  THANK_YOU = 'THANK_YOU',
  CHECK_IN = 'CHECK_IN',
  NETWORKING = 'NETWORKING'
}

export enum TaskType {
  APPLICATION = 'APPLICATION',
  FOLLOW_UP = 'FOLLOW_UP',
  RESUME_UPDATE = 'RESUME_UPDATE',
  INTERVIEW_PREP = 'INTERVIEW_PREP',
  NETWORKING = 'NETWORKING',
  SKILL_DEVELOPMENT = 'SKILL_DEVELOPMENT',
  JOB_SEARCH = 'JOB_SEARCH'
}

export interface ApplicationSummary {
  total: number
  byStatus: Record<ApplicationStatus, number>
  thisWeek: number
  thisMonth: number
}

export interface DashboardStats {
  applications: ApplicationSummary
  interviews: {
    upcoming: number
    thisWeek: number
  }
  tasks: {
    pending: number
    completed: number
    overdue: number
  }
  resumes: {
    total: number
    active: number
  }
}

export interface DailyTaskSuggestion {
  title: string
  description: string
  type: TaskType
  priority: 'high' | 'medium' | 'low'
}
