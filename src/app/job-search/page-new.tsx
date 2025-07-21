"use client";

import { useState, useEffect, useCallback } from 'react';
import { JobSearchFilters, getAvailableJobSites, searchJobs } from '@/lib/googleSearch';
import { Navigation } from '@/components/navigation';
import { JobSearchForm } from '@/components/JobSearchForm';
import { JobSearchFiltersPanel } from '@/components/JobSearchFiltersPanel';
import { JobResultsList } from '@/components/JobResultsList';
import { SavedSearchDialog } from '@/components/SavedSearchDialog';
import { useJobSearchForm } from '@/hooks/useJobSearch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Filter, Save, X } from 'lucide-react';
import Link from 'next/link';

interface JobSite {
  domain: string;
  name: string;
  category: string;
  enabled: boolean;
}

interface SavedApplication {
  id: number;
  jobTitle: string;
  company: string;
  url: string;
  status: string;
}

interface SavedSearch {
  id: string;
  name: string;
  query: string;
  filters: JobSearchFilters;
  description?: string;
}

const JobSearchPage = () => {
  // Use the form management hook
  const {
    query,
    filters,
    showFilters,
    loadedSearchId,
    setLoadedSearchId,
    updateQuery,
    updateFilters,
    updateShowFilters,
    clearFilters,
    resetForm
  } = useJobSearchForm();

  // Search state
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Data state
  const [availableJobSites, setAvailableJobSites] = useState<JobSite[]>([]);
  const [savedApplications, setSavedApplications] = useState<SavedApplication[]>([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  // Load available job sites and saved applications
  useEffect(() => {
    const loadData = async () => {
      try {
        const sites = await getAvailableJobSites();
        setAvailableJobSites(sites);

        // Load saved applications
        const response = await fetch('/api/applications');
        if (response.ok) {
          const applications = await response.json();
          setSavedApplications(applications);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();
  }, []);

  // Handle search execution
  const handleSearch = useCallback(async () => {
    if (!query.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const searchResults = await searchJobs(query, filters);
      if (searchResults.success) {
        setResults(searchResults.data);
      } else {
        setError(searchResults.error?.message || 'Search failed');
      }
    } catch (err) {
      setError('Search failed. Please try again.');
      console.error('Search error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [query, filters]);

  // Handle saving search
  const handleSaveSearch = () => {
    setShowSaveDialog(true);
  };

  const handleSaveSearchSubmit = async (searchData: {
    name: string;
    query: string;
    filters: JobSearchFilters;
    description?: string;
  }) => {
    try {
      const response = await fetch('/api/saved-searches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(searchData),
      });

      if (response.ok) {
        console.log('✅ Search saved successfully');
        setShowSaveDialog(false);
      } else {
        console.error('❌ Failed to save search');
      }
    } catch (error) {
      console.error('❌ Error saving search:', error);
    }
  };

  // Handle loading saved search
  const handleLoadSearch = () => {
    // This would typically open a dialog to select from saved searches
    // For now, we'll just log that it was called
    console.log('Load search requested');
  };

  // Handle saving application
  const handleSaveApplication = async (item: any) => {
    try {
      const applicationData = {
        jobTitle: item.title,
        company: item.displayLink || 'Unknown Company',
        location: 'Remote',
        url: item.link,
        description: item.snippet,
        source: 'Job Search',
        status: 'interested'
      };

      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(applicationData),
      });

      if (response.ok) {
        const newApplication = await response.json();
        setSavedApplications(prev => [...prev, newApplication]);
        console.log('✅ Application saved successfully');
      }
    } catch (error) {
      console.error('❌ Error saving application:', error);
    }
  };

  // Handle removing saved application
  const handleRemoveApplication = async (applicationId: number) => {
    try {
      const response = await fetch(`/api/applications?id=${applicationId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSavedApplications(prev => prev.filter(app => app.id !== applicationId));
        console.log('✅ Application removed successfully');
      }
    } catch (error) {
      console.error('❌ Error removing application:', error);
    }
  };

  // Check if an application is saved
  const isApplicationSaved = (jobUrl: string) => {
    return savedApplications.some(app => app.url === jobUrl);
  };

  // Handle clear loaded search
  const handleClearLoadedSearch = () => {
    setLoadedSearchId(null);
  };

  // Handle filter changes
  const handleFiltersChange = (newFilters: JobSearchFilters) => {
    updateFilters(newFilters);
  };

  // Check if filters are applied
  const hasActiveFilters = filters.location || 
    filters.experienceLevel || 
    filters.jobType ||
    (filters.selectedSites && filters.selectedSites.length > 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">Job Search</h1>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSaveSearch}
                disabled={!query.trim()}
              >
                <Save className="h-4 w-4 mr-2" />
                Save Search
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => updateShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
                {hasActiveFilters && (
                  <span className="ml-1 px-1.5 py-0.5 text-xs bg-blue-500 text-white rounded-full">
                    {[
                      filters.location && 'location',
                      filters.experienceLevel && 'experience',
                      filters.jobType && 'type',
                      filters.selectedSites?.length && 'sites'
                    ].filter(Boolean).length}
                  </span>
                )}
              </Button>
            </div>
          </div>

          {/* Search Form */}
          <JobSearchForm
            query={query}
            onQueryChange={updateQuery}
            onSearch={handleSearch}
            loading={isLoading}
            onSaveSearch={handleSaveSearch}
            onLoadSearch={handleLoadSearch}
            loadedSearchId={loadedSearchId}
            onClearLoadedSearch={handleClearLoadedSearch}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Panel */}
          {showFilters && (
            <div className="lg:col-span-1">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Filters</CardTitle>
                    <div className="flex items-center gap-2">
                      {hasActiveFilters && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={clearFilters}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Clear
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => updateShowFilters(false)}
                        className="lg:hidden"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <JobSearchFiltersPanel
                    filters={filters}
                    onFiltersChange={handleFiltersChange}
                    availableJobSites={availableJobSites}
                  />
                </CardContent>
              </Card>
            </div>
          )}

          {/* Results */}
          <div className={showFilters ? "lg:col-span-3" : "lg:col-span-4"}>
            <JobResultsList
              results={results}
              loading={isLoading}
              error={error}
              onSaveApplication={handleSaveApplication}
              onRemoveApplication={handleRemoveApplication}
              isApplicationSaved={isApplicationSaved}
            />
          </div>
        </div>
      </div>

      {/* Save Search Dialog */}
      {showSaveDialog && (
        <SavedSearchDialog
          isOpen={showSaveDialog}
          onClose={() => setShowSaveDialog(false)}
          onSaveSearch={handleSaveSearchSubmit}
          initialQuery={query}
          initialFilters={filters}
        />
      )}
    </div>
  );
};

export default JobSearchPage;
