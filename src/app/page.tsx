import { Navigation } from '@/components/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Briefcase, 
  FileText, 
  Calendar, 
  CheckSquare,
  Search,
  Clock
} from 'lucide-react'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'

async function getDashboardData() {
  try {
    // Get application statistics
    const totalApplications = await prisma.application.count();
    
    // Applications this week
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const applicationsThisWeek = await prisma.application.count({
      where: {
        appliedAt: {
          gte: oneWeekAgo
        }
      }
    });

    // Upcoming interviews (interviews scheduled for future dates)
    const now = new Date();
    const upcomingInterviews = await prisma.application.count({
      where: {
        interviewDate: {
          gte: now
        }
      }
    });

    // Applications by status
    const applicationsByStatus = await prisma.application.groupBy({
      by: ['status'],
      _count: {
        id: true
      }
    });

    // Recent applications (last 5)
    const recentApplications = await prisma.application.findMany({
      take: 5,
      orderBy: {
        viewedAt: 'desc'
      },
      include: {
        job: true
      }
    });

    // Convert status counts to object for easier access
    const statusCounts = applicationsByStatus.reduce((acc, item) => {
      acc[item.status] = item._count.id;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalApplications,
      applicationsThisWeek,
      upcomingInterviews,
      statusCounts,
      recentApplications
    };
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return {
      totalApplications: 0,
      applicationsThisWeek: 0,
      upcomingInterviews: 0,
      statusCounts: {},
      recentApplications: []
    };
  }
}

export default async function DashboardPage() {
  const dashboardData = await getDashboardData();

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
                <div className="text-2xl font-bold">{dashboardData.totalApplications}</div>
                <p className="text-xs text-slate-600">
                  +{dashboardData.applicationsThisWeek} this week
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Upcoming Interviews</CardTitle>
                <Calendar className="h-4 w-4 text-slate-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData.upcomingInterviews}</div>
                <p className="text-xs text-slate-600">
                  scheduled ahead
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Applied</CardTitle>
                <CheckSquare className="h-4 w-4 text-slate-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData.statusCounts.APPLIED || 0}</div>
                <p className="text-xs text-slate-600">
                  applications submitted
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                <Clock className="h-4 w-4 text-slate-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(dashboardData.statusCounts.INTERVIEWING || 0) + (dashboardData.statusCounts.TECHNICAL_INTERVIEW || 0)}
                </div>
                <p className="text-xs text-slate-600">
                  interviewing
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Applications Section */}
          {dashboardData.recentApplications.length > 0 ? (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Recent Applications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboardData.recentApplications.map((application) => (
                    <div key={application.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium text-slate-900">{application.position}</h4>
                        <p className="text-sm text-slate-600">{application.company}</p>
                        <p className="text-xs text-slate-500">
                          Viewed: {application.viewedAt ? new Date(application.viewedAt).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          application.status === 'APPLIED' ? 'bg-green-100 text-green-700' :
                          application.status === 'INTERVIEWING' ? 'bg-purple-100 text-purple-700' :
                          application.status === 'TECHNICAL_INTERVIEW' ? 'bg-indigo-100 text-indigo-700' :
                          application.status === 'OFFER' ? 'bg-emerald-100 text-emerald-700' :
                          application.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {application.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <Link href="/applications">
                    <Button variant="outline" className="w-full">
                      View All Applications
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ) : dashboardData.totalApplications === 0 && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Get Started</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Search className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 mb-2">Start Your Job Search</h3>
                  <p className="text-slate-600 mb-4">
                    Begin by searching for jobs that match your interests. You can save applications and track your progress.
                  </p>
                  <Link href="/job-search">
                    <Button>
                      Search for Jobs
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Application Pipeline Section */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Application Pipeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-600">{dashboardData.statusCounts.VIEWED || 0}</div>
                  <div className="text-xs text-gray-500">Viewed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{dashboardData.statusCounts.PLAN_TO_APPLY || 0}</div>
                  <div className="text-xs text-blue-500">Plan to Apply</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{dashboardData.statusCounts.APPLIED || 0}</div>
                  <div className="text-xs text-green-500">Applied</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{dashboardData.statusCounts.INTERVIEWING || 0}</div>
                  <div className="text-xs text-purple-500">Interviewing</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-indigo-600">{dashboardData.statusCounts.TECHNICAL_INTERVIEW || 0}</div>
                  <div className="text-xs text-indigo-500">Technical</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-emerald-600">{dashboardData.statusCounts.OFFER || 0}</div>
                  <div className="text-xs text-emerald-500">Offers</div>
                </div>
              </div>
              {dashboardData.totalApplications > 0 && (
                <div className="mt-4 text-center">
                  <p className="text-sm text-slate-600">
                    Success Rate: {dashboardData.statusCounts.OFFER ? 
                      Math.round((dashboardData.statusCounts.OFFER / dashboardData.totalApplications) * 100) : 0}% 
                    (Offers / Total Applications)
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

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
