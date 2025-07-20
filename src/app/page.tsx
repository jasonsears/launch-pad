import { Navigation } from '@/components/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Briefcase, 
  FileText, 
  Calendar, 
  CheckSquare,
  Search
} from 'lucide-react'
import Link from 'next/link'

const dashboardStats = {
  applications: {
    total: 24,
    thisWeek: 5,
  },
  interviews: {
    upcoming: 2,
    thisWeek: 3
  },
  tasks: {
    pending: 7,
    overdue: 2
  },
  resumes: {
    total: 4,
    active: 2
  }
}

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
            <p className="mt-2 text-slate-600">
              Track your job search progress and stay organized
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
                <Briefcase className="h-4 w-4 text-slate-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardStats.applications.total}</div>
                <p className="text-xs text-slate-600">
                  +{dashboardStats.applications.thisWeek} this week
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Upcoming Interviews</CardTitle>
                <Calendar className="h-4 w-4 text-slate-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardStats.interviews.upcoming}</div>
                <p className="text-xs text-slate-600">
                  {dashboardStats.interviews.thisWeek} this week
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
                <CheckSquare className="h-4 w-4 text-slate-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardStats.tasks.pending}</div>
                <p className="text-xs text-slate-600">
                  {dashboardStats.tasks.overdue} overdue
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Resumes</CardTitle>
                <FileText className="h-4 w-4 text-slate-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardStats.resumes.active}</div>
                <p className="text-xs text-slate-600">
                  of {dashboardStats.resumes.total} total
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link href="/job-search">
                  <Button className="w-full h-16 flex flex-col items-center justify-center space-y-2">
                    <Search className="h-5 w-5" />
                    <span>Search Jobs</span>
                  </Button>
                </Link>
                <Link href="/applications">
                  <Button className="w-full h-16 flex flex-col items-center justify-center space-y-2" variant="outline">
                    <Briefcase className="h-5 w-5" />
                    <span>View Applications</span>
                  </Button>
                </Link>
                <Link href="/resumes">
                  <Button className="w-full h-16 flex flex-col items-center justify-center space-y-2" variant="outline">
                    <FileText className="h-5 w-5" />
                    <span>Manage Resumes</span>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
