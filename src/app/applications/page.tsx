'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Navigation } from '@/components/navigation';
import { BackToSearchButton } from '@/components/BackToSearchClient';
import { 
  ExternalLink, 
  Edit3, 
  Save, 
  X, 
  Calendar,
  FileText,
  Briefcase,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  MessageSquare,
  Trash2
} from 'lucide-react';

// Define the status options with their display properties
const STATUS_OPTIONS = [
  { value: 'VIEWED', label: 'Viewed', icon: FileText, color: 'bg-gray-100 text-gray-700' },
  { value: 'PLAN_TO_APPLY', label: 'Plan to Apply', icon: Clock, color: 'bg-blue-100 text-blue-700' },
  { value: 'APPLIED', label: 'Applied', icon: CheckCircle, color: 'bg-green-100 text-green-700' },
  { value: 'INTERVIEWING', label: 'Interviewing', icon: MessageSquare, color: 'bg-purple-100 text-purple-700' },
  { value: 'TECHNICAL_INTERVIEW', label: 'Technical Interview', icon: Briefcase, color: 'bg-indigo-100 text-indigo-700' },
  { value: 'FINAL_INTERVIEW', label: 'Final Interview', icon: AlertCircle, color: 'bg-orange-100 text-orange-700' },
  { value: 'OFFER', label: 'Offer', icon: CheckCircle, color: 'bg-emerald-100 text-emerald-700' },
  { value: 'REJECTED', label: 'Rejected', icon: XCircle, color: 'bg-red-100 text-red-700' },
  { value: 'GHOSTED', label: 'Ghosted', icon: XCircle, color: 'bg-gray-100 text-gray-500' },
  { value: 'WITHDRAWN', label: 'Withdrawn', icon: X, color: 'bg-slate-100 text-slate-600' }
];

interface Application {
  id: string;
  company: string;
  position: string;
  status: string;
  viewedAt: string | null;
  appliedAt: string | null;
  responseDate: string | null;
  interviewDate: string | null;
  notes: string | null;
  source: string | null;
  job: {
    id: string;
    title: string;
    url: string;
    description: string | null;
  } | null;
}

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Application>>({});
  const [saving, setSaving] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<string>('updated');

  // Fetch applications
  useEffect(() => {
    fetchApplications();
  }, []);

  // Filter and sort applications when data or filters change
  useEffect(() => {
    let filtered = [...applications];

    // Filter by status
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(app => app.status === statusFilter);
    }

    // Sort applications
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'company':
          return a.company.localeCompare(b.company);
        case 'position':
          return (a.job?.title || a.position).localeCompare(b.job?.title || b.position);
        case 'status':
          return a.status.localeCompare(b.status);
        case 'applied':
          const aDate = a.appliedAt ? new Date(a.appliedAt.split('T')[0]) : new Date(0);
          const bDate = b.appliedAt ? new Date(b.appliedAt.split('T')[0]) : new Date(0);
          return bDate.getTime() - aDate.getTime(); // Most recent first
        case 'updated':
        default:
          return new Date(b.viewedAt || 0).getTime() - new Date(a.viewedAt || 0).getTime();
      }
    });

    setFilteredApplications(filtered);
  }, [applications, statusFilter, sortBy]);

  const fetchApplications = async () => {
    try {
      const response = await fetch('/api/applications');
      if (response.ok) {
        const data = await response.json();
        setApplications(data);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Start editing an application
  const startEditing = (app: Application) => {
    setEditingId(app.id);
    setEditData({
      status: app.status,
      appliedAt: app.appliedAt ? app.appliedAt.split('T')[0] : '',
      interviewDate: app.interviewDate ? app.interviewDate.split('T')[0] : '',
      responseDate: app.responseDate ? app.responseDate.split('T')[0] : '',
      notes: app.notes || ''
    });
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingId(null);
    setEditData({});
  };

  // Save changes
  const saveApplication = async (id: string) => {
    const application = applications.find(app => app.id === id);
    if (!application) return;

    setSaving(true);
    try {
      // Prepare the update data, properly handling dates
      const updateData: {
        id: string;
        status?: string;
        notes?: string | null;
        appliedAt?: string | null;
        interviewDate?: string | null;
        responseDate?: string | null;
      } = {
        id,
        status: editData.status || application.status,
        notes: editData.notes !== undefined ? editData.notes : application.notes,
      };

      // Handle dates - only include if they have values
      if (editData.appliedAt) {
        updateData.appliedAt = editData.appliedAt + 'T00:00:00.000Z';
      } else if (editData.appliedAt === '') {
        updateData.appliedAt = null; // Explicitly set to null to clear the date
      }

      if (editData.interviewDate) {
        updateData.interviewDate = editData.interviewDate + 'T00:00:00.000Z';
      } else if (editData.interviewDate === '') {
        updateData.interviewDate = null;
      }

      if (editData.responseDate) {
        updateData.responseDate = editData.responseDate + 'T00:00:00.000Z';
      } else if (editData.responseDate === '') {
        updateData.responseDate = null;
      }

      console.log('Saving application data:', updateData);

      const response = await fetch('/api/applications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });
      
      if (response.ok) {
        const savedApplication = await response.json();
        console.log('Successfully saved application:', savedApplication);
        
        // Update the local state with the saved data
        setApplications(apps => apps.map(app => 
          app.id === id ? savedApplication : app
        ));
        setEditingId(null);
        setEditData({});
      } else {
        const errorText = await response.text();
        console.error('Failed to save application:', response.status, errorText);
      }
    } catch (error) {
      console.error('Error saving application:', error);
    } finally {
      setSaving(false);
    }
  };

  const deleteApplication = async (id: string) => {
    if (!confirm('Are you sure you want to delete this application?')) return;

    try {
      const response = await fetch(`/api/applications?id=${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setApplications(applications.filter(app => app.id !== id));
      }
    } catch (error) {
      console.error('Error deleting application:', error);
    }
  };

  // Get status display properties
  const getStatusInfo = (status: string) => {
    return STATUS_OPTIONS.find(option => option.value === status) || STATUS_OPTIONS[0];
  };

  // Format date for display (timezone-safe)
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '—';
    // Extract just the date part and format it without timezone conversion
    const datePart = dateString.split('T')[0];
    const [year, month, day] = datePart.split('-');
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day)).toLocaleDateString();
  };

  // Get days since application (timezone-safe)
  const getDaysSince = (dateString: string | null) => {
    if (!dateString) return null;
    // Extract just the date part to avoid timezone issues
    const datePart = dateString.split('T')[0];
    const [year, month, day] = datePart.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    const now = new Date();
    const nowDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const diffTime = Math.abs(nowDate.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navigation />
        <div className="max-w-6xl mx-auto py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading applications...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      <div className="max-w-6xl mx-auto py-8">
        <BackToSearchButton />
        
        <div className="flex items-center justify-between mb-6">
                  <h1 className="text-3xl font-bold tracking-tight">Job Applications</h1>
        
        {/* Application Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{applications.length}</div>
            <div className="text-sm text-gray-600">Total Applications</div>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-900">
              {applications.filter(app => app.status === 'APPLIED').length}
            </div>
            <div className="text-sm text-blue-600">Applied</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-purple-900">
              {applications.filter(app => ['INTERVIEWING', 'TECHNICAL_INTERVIEW'].includes(app.status)).length}
            </div>
            <div className="text-sm text-purple-600">Interviewing</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-900">
              {applications.filter(app => app.status === 'OFFER').length}
            </div>
            <div className="text-sm text-green-600">Offers</div>
          </div>
        </div>
          <div className="text-sm text-slate-500">
            {filteredApplications.length} of {applications.length} application{applications.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Filters and Sorting */}
        {applications.length > 0 && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-slate-700">Filter by Status:</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 border border-slate-200 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="ALL">All Statuses</option>
                    {STATUS_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-slate-700">Sort by:</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-2 border border-slate-200 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="updated">Last Updated</option>
                    <option value="applied">Application Date</option>
                    <option value="company">Company Name</option>
                    <option value="position">Position</option>
                    <option value="status">Status</option>
                  </select>
                </div>

                {statusFilter !== 'ALL' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setStatusFilter('ALL')}
                  >
                    <X className="w-4 h-4 mr-1" />
                    Clear Filter
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {applications.length === 0 ? (
          <Card className="mb-6">
            <CardContent className="pt-6 text-center">
              <Briefcase className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600 text-lg mb-2">No applications tracked yet</p>
              <p className="text-sm text-slate-500">Start saving jobs from your search to track them here</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {filteredApplications.map((app) => {
              const isEditing = editingId === app.id;
              const statusInfo = getStatusInfo(app.status);
              const StatusIcon = statusInfo.icon;
              const daysSinceApplied = getDaysSince(app.appliedAt);

              return (
                <Card key={app.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="flex items-center gap-3 mb-2">
                          <span className="text-xl">{app.job?.title || app.position}</span>
                          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>
                            <StatusIcon className="w-4 h-4 mr-1" />
                            {statusInfo.label}
                          </div>
                        </CardTitle>
                        <p className="text-lg text-slate-600">{app.company}</p>
                        {daysSinceApplied && app.status === 'APPLIED' && (
                          <p className="text-sm text-slate-500 mt-1">
                            Applied {daysSinceApplied} day{daysSinceApplied !== 1 ? 's' : ''} ago
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {app.job?.url && (
                          <a 
                            href={app.job.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                          >
                            <Button variant="outline" size="sm">
                              <ExternalLink className="w-4 h-4 mr-2" />
                              View Job
                            </Button>
                          </a>
                        )}
                        {!isEditing ? (
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => startEditing(app)}
                            >
                              <Edit3 className="w-4 h-4 mr-2" />
                              Edit
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => deleteApplication(app.id)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </Button>
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <Button 
                              size="sm"
                              onClick={() => saveApplication(app.id)}
                              disabled={saving}
                            >
                              <Save className="w-4 h-4 mr-2" />
                              {saving ? 'Saving...' : 'Save'}
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={cancelEditing}
                              disabled={saving}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {isEditing ? (
                      <div className="space-y-4">
                        {/* Status Selector */}
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Status
                            <span className="text-xs text-slate-500 ml-2">(auto-updates when dates are set)</span>
                          </label>
                          <select
                            value={editData.status || app.status}
                            onChange={(e) => setEditData({...editData, status: e.target.value})}
                            className="w-full p-2 border border-slate-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            {STATUS_OPTIONS.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Date Fields */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                              <Calendar className="w-4 h-4 inline mr-1" />
                              Applied Date
                            </label>
                            <Input
                              type="date"
                              value={editData.appliedAt || ''}
                              onChange={(e) => {
                                const newAppliedAt = e.target.value;
                                const updatedData = {...editData, appliedAt: newAppliedAt};
                                
                                // Auto-update status to APPLIED when applied date is set
                                if (newAppliedAt && (!editData.status || editData.status === 'VIEWED' || editData.status === 'PLAN_TO_APPLY')) {
                                  updatedData.status = 'APPLIED';
                                }
                                // If applied date is cleared, revert to previous status if it was APPLIED
                                else if (!newAppliedAt && editData.status === 'APPLIED') {
                                  updatedData.status = 'VIEWED';
                                }
                                
                                setEditData(updatedData);
                              }}
                            />
                            {editData.appliedAt && (!editData.status || editData.status === 'VIEWED' || editData.status === 'PLAN_TO_APPLY') && (
                              <p className="text-xs text-blue-600 mt-1">
                                💡 Status will be updated to &ldquo;Applied&rdquo;
                              </p>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                              <Calendar className="w-4 h-4 inline mr-1" />
                              Interview Date
                            </label>
                            <Input
                              type="date"
                              value={editData.interviewDate || ''}
                              onChange={(e) => {
                                const newInterviewDate = e.target.value;
                                const updatedData = {...editData, interviewDate: newInterviewDate};
                                
                                // Auto-update status to INTERVIEWING when interview date is set
                                if (newInterviewDate && (!editData.status || !['TECHNICAL_INTERVIEW', 'OFFER', 'REJECTED'].includes(editData.status))) {
                                  updatedData.status = 'INTERVIEWING';
                                }
                                
                                setEditData(updatedData);
                              }}
                            />
                            {editData.interviewDate && (!editData.status || !['TECHNICAL_INTERVIEW', 'OFFER', 'REJECTED'].includes(editData.status)) && (
                              <p className="text-xs text-purple-600 mt-1">
                                💡 Status will be updated to &ldquo;Interviewing&rdquo;
                              </p>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                              <Calendar className="w-4 h-4 inline mr-1" />
                              Response Date
                            </label>
                            <Input
                              type="date"
                              value={editData.responseDate || ''}
                              onChange={(e) => {
                                const newResponseDate = e.target.value;
                                const updatedData = {...editData, responseDate: newResponseDate};
                                
                                // Auto-update status when response date is set
                                // If we have an interview date and response date, suggest TECHNICAL_INTERVIEW or later status
                                if (newResponseDate && editData.interviewDate && editData.status === 'INTERVIEWING') {
                                  updatedData.status = 'TECHNICAL_INTERVIEW';
                                }
                                // If no interview date but response date, keep current status but note response received
                                
                                setEditData(updatedData);
                              }}
                            />
                            {editData.responseDate && editData.interviewDate && editData.status === 'INTERVIEWING' && (
                              <p className="text-xs text-indigo-600 mt-1">
                                💡 Status will be updated to &ldquo;Technical Interview&rdquo;
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Notes */}
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            <FileText className="w-4 h-4 inline mr-1" />
                            Notes
                          </label>
                          <textarea
                            value={editData.notes || ''}
                            onChange={(e) => setEditData({...editData, notes: e.target.value})}
                            placeholder="Add notes about this application, interview prep, follow-ups, etc."
                            rows={3}
                            className="w-full p-3 border border-slate-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="space-y-3">
                          <div>
                            <span className="text-sm font-medium text-slate-500">Source</span>
                            <p className="text-slate-900">{app.source || 'Unknown'}</p>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-slate-500">Viewed</span>
                            <p className="text-slate-900">{formatDate(app.viewedAt)}</p>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <div>
                            <span className="text-sm font-medium text-slate-500">Applied</span>
                            <p className="text-slate-900">{formatDate(app.appliedAt)}</p>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-slate-500">Interview</span>
                            <p className="text-slate-900">{formatDate(app.interviewDate)}</p>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <div>
                            <span className="text-sm font-medium text-slate-500">Response</span>
                            <p className="text-slate-900">{formatDate(app.responseDate)}</p>
                          </div>
                        </div>

                        {app.notes && (
                          <div className="md:col-span-2 lg:col-span-1">
                            <span className="text-sm font-medium text-slate-500">Notes</span>
                            <p className="text-slate-900 text-sm mt-1">{app.notes}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {app.job?.description && !isEditing && (
                      <div className="mt-4 pt-4 border-t border-slate-200">
                        <span className="text-sm font-medium text-slate-500">Job Description Preview</span>
                        <p className="text-slate-700 text-sm mt-1 line-clamp-2">
                          {app.job.description.length > 200 
                            ? `${app.job.description.substring(0, 200)}...` 
                            : app.job.description
                          }
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
