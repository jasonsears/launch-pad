"use client";

import { useState, useEffect, useCallback } from 'react';
import { JobSearchFilters, searchJobs } from '@/lib/googleSearch';
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
import { SavedSearch } from '@/types';

interface SearchResults {
  items?: Array<{
    link: string;
    title: string;
    snippet: string;
    displayLink: string;
  }>;
  searchInformation?: {
    totalResults: string;
    searchTime: number;
  };
}

interface SavedApplication {
  id: number;
  jobTitle: string;
  company: string;
  url: string;
  status: string;
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
    clearFilters
  } = useJobSearchForm();

  // Search state
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<SearchResults | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Data state
  const [savedApplications, setSavedApplications] = useState<SavedApplication[]>([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showLoadDialog, setShowLoadDialog] = useState(false);

  // Load saved applications
  useEffect(() => {
    const loadData = async () => {
      try {
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
        setResults(searchResults.data as SearchResults);
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

  // Wrapper to match SavedSearchDialog interface
  const handleSaveSearchFromDialog = (name: string, searchQuery: string, searchFilters: JobSearchFilters) => {
    handleSaveSearchSubmit({
      name,
      query: searchQuery,
      filters: searchFilters
    });
  };

  // Handle updating existing saved search
  const handleUpdateSearchFromDialog = (id: string, name: string, searchQuery: string, searchFilters: JobSearchFilters) => {
    // Update the current form with the updated search
    updateQuery(searchQuery);
    updateFilters(searchFilters);
    console.log('✅ Search updated successfully');
  };

  // Handle loading saved search
  const handleLoadSearch = () => {
    setShowLoadDialog(true);
  };

  // Handle when a saved search is selected
  const handleLoadSearchFromDialog = (search: SavedSearch) => {
    updateQuery(search.query);
    updateFilters(search.filters);
    setLoadedSearchId(search.id);
    setShowLoadDialog(false);
  };

  // Handle when a saved search is selected for editing
  const handleEditSearchFromDialog = (search: SavedSearch) => {
    updateQuery(search.query);
    updateFilters(search.filters);
    setLoadedSearchId(search.id);
    setShowLoadDialog(false);
    setShowSaveDialog(true); // Open save dialog in edit mode
  };

  // Handle saving application
  const handleSaveApplication = async (item: {
    title: string;
    link: string;
    snippet: string;
    displayLink: string;
  }) => {
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
            loadedSearchId={loadedSearchId || undefined}
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
                    onClearFilters={clearFilters}
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
          onSaveSearch={handleSaveSearchFromDialog}
          onUpdateSearch={handleUpdateSearchFromDialog}
          currentQuery={query}
          currentFilters={filters}
          loadedSearchId={loadedSearchId || undefined}
          mode="save"
        />
      )}

      {/* Load Search Dialog */}
      {showLoadDialog && (
        <SavedSearchDialog
          isOpen={showLoadDialog}
          onClose={() => setShowLoadDialog(false)}
          onLoadSearch={handleLoadSearchFromDialog}
          onEditSearch={handleEditSearchFromDialog}
          currentQuery={query}
          currentFilters={filters}
          mode="load"
          loadedSearchId={loadedSearchId || undefined}
        />
      )}
    </div>
  );
};

export default JobSearchPage;
