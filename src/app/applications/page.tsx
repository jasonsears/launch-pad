import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Navigation } from '@/components/navigation';
import { BackToSearchButton } from '@/components/BackToSearchClient';
import { use } from 'react';

async function getApplications() {
  // Fetch all applications, ordered by updatedAt desc
  return await prisma.application.findMany({
    orderBy: { updatedAt: 'desc' },
    include: { job: true, resume: true },
  });
}

export default function ApplicationsPage() {
  const applications = use(getApplications());

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      <div className="max-w-4xl mx-auto py-8">
        <BackToSearchButton />
        <h1 className="text-3xl font-bold mb-6 text-slate-900">My Applications</h1>
        {applications.length === 0 ? (
          <Card className="mb-6">
            <CardContent className="pt-6 text-center">
              <p className="text-slate-600">No applications tracked yet.</p>
              <p className="text-sm text-slate-500 mt-1">Start saving jobs and tracking your application status here.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => (
              <Card key={app.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {app.job?.title || 'Unknown Position'}
                    <Badge variant="secondary">{app.status}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-slate-700 mb-2">
                    <strong>Company:</strong> {app.company}
                  </div>
                  <div className="text-slate-700 mb-2">
                    <strong>Position:</strong> {app.position}
                  </div>
                  <div className="text-slate-700 mb-2">
                    <strong>Source:</strong> {app.source || 'N/A'}
                  </div>
                  <div className="text-slate-700 mb-2">
                    <strong>Status:</strong> {app.status}
                  </div>
                  <div className="text-slate-700 mb-2">
                    <strong>Viewed:</strong> {app.viewedAt ? new Date(app.viewedAt).toLocaleDateString() : '—'}
                  </div>
                  <div className="text-slate-700 mb-2">
                    <strong>Applied:</strong> {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : '—'}
                  </div>
                  <div className="text-slate-700 mb-2">
                    <strong>Notes:</strong> {app.notes || '—'}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
