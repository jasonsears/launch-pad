"use client";

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { JobSearchFilters, getAvailableJobSites } from '@/lib/googleSearch';
import { Navigation } from '@/components/navigation';
import { SavedSearchDialog } from '@/components/SavedSearchDialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, ExternalLink, Bookmark, ArrowLeft, Filter, MapPin, Save, FolderOpen, X } from 'lucide-react';
import Link from 'next/link';

const JobSearchPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Helper functions for URL state management
  const getQueryFromURL = useCallback(() => {
    return searchParams.get('q') || '';
  }, [searchParams]);

  const getFiltersFromURL = useCallback((): JobSearchFilters => {
    const filtersParam = searchParams.get('filters');
    if (filtersParam) {
      try {
        return JSON.parse(filtersParam);
      } catch {
        // If parsing fails, return default filters
      }
    }
    return {
      location: '',
      remote: false,
      entryLevel: false,
      jobType: [],
      experienceLevel: undefined,
      sites: [],
    };
  }, [searchParams]);

  const getShowFiltersFromURL = useCallback(() => {
    return searchParams.get('showFilters') === 'true';
  }, [searchParams]);

  const updateURLState = useCallback((updates: {
    query?: string;
    filters?: JobSearchFilters;
    showFilters?: boolean;
    replace?: boolean;
  }) => {
    const params = new URLSearchParams(searchParams);
    
    if (updates.query !== undefined) {
      if (updates.query) {
        params.set('q', updates.query);
      } else {
        params.delete('q');
      }
    }
    
    if (updates.filters !== undefined) {
      // Only store non-default filters to keep URLs clean
      const hasNonDefaultFilters = Object.values(updates.filters).some(value => {
        if (Array.isArray(value)) return value.length > 0;
        if (typeof value === 'boolean') return value;
        if (typeof value === 'string') return value.trim() !== '';
        return value !== undefined;
      });
      
      if (hasNonDefaultFilters) {
        params.set('filters', JSON.stringify(updates.filters));
      } else {
        params.delete('filters');
      }
    }
    
    if (updates.showFilters !== undefined) {
      if (updates.showFilters) {
        params.set('showFilters', 'true');
      } else {
        params.delete('showFilters');
      }
    }

    const newURL = `/job-search?${params.toString()}`;
    if (updates.replace) {
      router.replace(newURL);
    } else {
      router.push(newURL);
    }
  }, [searchParams, router]);

  // Initialize state from URL
  const [query, setQuery] = useState(getQueryFromURL());
  const [filters, setFilters] = useState<JobSearchFilters>(getFiltersFromURL());
  const [showFilters, setShowFilters] = useState(getShowFiltersFromURL());
  
  // Track saved jobs using sessionStorage for persistence
  const [savedJobs, setSavedJobs] = useState<{ [url: string]: boolean }>(() => {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('savedJobs');
      return saved ? JSON.parse(saved) : {};
    }
    return {};
  });
  
  const [savingJob, setSavingJob] = useState<string | null>(null);
  const [results, setResults] = useState<{ link: string; title: string; snippet: string; displayLink: string }[]>([]);
  const [searchMetadata, setSearchMetadata] = useState<{
    originalCount?: number;
    filteredCount?: number;
    searchQuery?: string;
  }>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [savedSearchDialog, setSavedSearchDialog] = useState<{ isOpen: boolean; mode: 'save' | 'load' }>({
    isOpen: false,
    mode: 'save'
  });
  const [loadedSearchId, setLoadedSearchId] = useState<string | null>(null);

  // Sync state with URL when URL changes (browser back/forward)
  useEffect(() => {
    setQuery(getQueryFromURL());
    setFilters(getFiltersFromURL());
    setShowFilters(getShowFiltersFromURL());
  }, [searchParams, getQueryFromURL, getFiltersFromURL, getShowFiltersFromURL]);

  // Persist savedJobs to sessionStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('savedJobs', JSON.stringify(savedJobs));
    }
  }, [savedJobs]);

  const availableJobSites = getAvailableJobSites();

  const handleSearch = useCallback(async () => {
    if (!query.trim()) {
      setError('Please enter a search term');
      return;
    }
    
    // Update URL with current search state
    updateURLState({ query, filters, replace: true });
    
    setLoading(true);
    setError(null);
    try {
      // Use the API endpoint for better filtering and processing
      const response = await fetch('/api/search/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          filters,
          userId: 'free-user' // Default for now
        }),
      });

      if (!response.ok) {
        throw new Error(`Search failed: ${response.status}`);
      }

      const data = await response.json();
      setResults(data.items || []);
      setSearchQuery(data.searchQuery || query);
      setSearchMetadata({
        originalCount: data.config?.originalCount,
        filteredCount: data.config?.filteredCount,
        searchQuery: data.searchQuery
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch job results. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [query, filters, updateURLState]);

  // Auto-search when URL has query parameter on initial load
  useEffect(() => {
    const urlQuery = getQueryFromURL();
    if (urlQuery && results.length === 0 && !loading) {
      handleSearch();
    }
  }, [getQueryFromURL, results.length, loading, handleSearch]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Save Job handler
  const handleSaveJob = async (result: { link: string; title: string; snippet: string; displayLink: string }) => {
    setSavingJob(result.link);
    try {
      // Compose comprehensive job info for API
      const payload = {
        jobId: result.link, // Use link as unique jobId for now
        company: result.displayLink || 'Unknown',
        position: result.title,
        source: getJobSiteName(result.displayLink),
        status: 'VIEWED',
        jobTitle: result.title,
        jobSnippet: result.snippet || '',
        datePosted: new Date().toISOString(), // Current date as fallback
      };
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setSavedJobs((prev) => ({ ...prev, [result.link]: true }));
      } else {
        // Get more detailed error information
        const errorData = await res.json();
        console.error('Failed to save job:', errorData);
        alert('Failed to save job.');
      }
    } catch (error) {
      console.error('Error saving job:', error);
      alert('Failed to save job.');
    } finally {
      setSavingJob(null);
    }
  };

  const clearFilters = () => {
    const defaultFilters = {
      location: '',
      remote: false,
      entryLevel: false,
      jobType: [],
      experienceLevel: undefined,
      sites: [],
    };
    setFilters(defaultFilters);
    updateURLState({ filters: defaultFilters });
  };

  const getJobSiteName = (url: string): string => {
    if (url.includes('linkedin.com')) return 'LinkedIn';
    if (url.includes('indeed.com')) return 'Indeed';
    if (url.includes('glassdoor.com')) return 'Glassdoor';
    if (url.includes('monster.com')) return 'Monster';
    if (url.includes('ziprecruiter.com')) return 'ZipRecruiter';
    if (url.includes('dice.com')) return 'Dice';
    if (url.includes('stackoverflow.com')) return 'Stack Overflow';
    if (url.includes('angel.co')) return 'AngelList';
    if (url.includes('remote.co')) return 'Remote.co';
    if (url.includes('weworkremotely.com')) return 'We Work Remotely';
    return url;
  };

  const handleSaveSearch = (name: string, query: string, filters: JobSearchFilters) => {
    // Handle successful save - could show a toast notification
    console.log('Search saved:', { name, query, filters });
    setLoadedSearchId(null); // Clear loaded search since we created a new one
  };

  const handleUpdateSearch = (id: string, name: string, query: string, filters: JobSearchFilters) => {
    // Handle successful update
    console.log('Search updated:', { id, name, query, filters });
  };

  const handleLoadSearch = (savedSearch: { id: string; name: string; query: string; filters: JobSearchFilters }) => {
    setQuery(savedSearch.query);
    setFilters(savedSearch.filters);
    setLoadedSearchId(savedSearch.id); // Track which search was loaded
    // Clear results when loading a different search
    setResults([]);
    setSearchQuery('');
    // Update URL with loaded search
    updateURLState({ query: savedSearch.query, filters: savedSearch.filters });
    // Optionally trigger a search automatically
    // handleSearch();
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header with back button */}
          <div className="mb-8">
            <Link href="/" className="inline-flex items-center text-slate-600 hover:text-slate-900 mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-slate-900">Job Search</h1>
            <p className="mt-2 text-slate-600">
              Search across major job sites including LinkedIn, Indeed, Glassdoor, and more
            </p>
          </div>

          {/* Search Form */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Search className="w-5 h-5 mr-2" />
                  Search Jobs
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newShowFilters = !showFilters;
                    setShowFilters(newShowFilters);
                    updateURLState({ showFilters: newShowFilters });
                  }}
                  className="flex items-center"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Loaded Search Indicator */}
              {loadedSearchId && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <FolderOpen className="w-4 h-4 text-blue-600 mr-2" />
                      <span className="text-sm text-blue-800">
                        Loaded saved search - modifications can be saved back to the original search
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setLoadedSearchId(null);
                        const defaultQuery = '';
                        const defaultFilters = {
                          location: '',
                          remote: false,
                          entryLevel: false,
                          jobType: [],
                          experienceLevel: undefined,
                          sites: [],
                        };
                        setQuery(defaultQuery);
                        setFilters(defaultFilters);
                        setResults([]);
                        setSearchQuery('');
                        // Clear URL state
                        updateURLState({ 
                          query: defaultQuery, 
                          filters: defaultFilters,
                          replace: true 
                        });
                      }}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              )}

              <div className="flex space-x-4 mb-4">
                <Input
                  type="text"
                  value={query}
                  onChange={(e) => {
                    const newQuery = e.target.value;
                    setQuery(newQuery);
                    // Don't update URL on every keystroke, only on search
                  }}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter job title, keywords, or company name (required)"
                  className="flex-1"
                  required
                />
                <Button 
                  onClick={handleSearch}
                  disabled={loading || !query.trim()}
                  className="px-8"
                >
                  {loading ? 'Searching...' : 'Search'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setSavedSearchDialog({ isOpen: true, mode: 'save' })}
                  disabled={!query.trim() || !results.length}
                  title={loadedSearchId ? "Update saved search" : "Save current search"}
                >
                  <Save className="w-4 h-4" />
                  {loadedSearchId && <span className="ml-1 text-xs">Update</span>}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setSavedSearchDialog({ isOpen: true, mode: 'load' })}
                  title="Load saved search"
                >
                  <FolderOpen className="w-4 h-4" />
                </Button>
              </div>

              {/* Quick Job Board Filters */}
              <div className="flex flex-wrap gap-2 mt-4">
                <span className="text-sm text-slate-600 mr-2">Quick filters:</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newFilters = {...filters, sites: ['linkedin.com']};
                    setFilters(newFilters);
                    updateURLState({ filters: newFilters });
                  }}
                  className={filters.sites?.includes('linkedin.com') ? 'bg-blue-100' : ''}
                >
                  LinkedIn Only
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newFilters = {...filters, sites: ['indeed.com']};
                    setFilters(newFilters);
                    updateURLState({ filters: newFilters });
                  }}
                  className={filters.sites?.includes('indeed.com') ? 'bg-blue-100' : ''}
                >
                  Indeed Only
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newFilters = {...filters, sites: ['dice.com', 'stackoverflow.com/jobs']};
                    setFilters(newFilters);
                    updateURLState({ filters: newFilters });
                  }}
                  className={filters.sites?.some(site => ['dice.com', 'stackoverflow.com/jobs'].includes(site)) ? 'bg-blue-100' : ''}
                >
                  Tech Sites
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newFilters = {...filters, sites: ['remote.co', 'weworkremotely.com']};
                    setFilters(newFilters);
                    updateURLState({ filters: newFilters });
                  }}
                  className={filters.sites?.some(site => ['remote.co', 'weworkremotely.com'].includes(site)) ? 'bg-blue-100' : ''}
                >
                  Remote Sites
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newFilters = {...filters, sites: []};
                    setFilters(newFilters);
                    updateURLState({ filters: newFilters });
                  }}
                  className={!filters.sites || filters.sites.length === 0 ? 'bg-blue-100' : ''}
                >
                  All Sites
                </Button>
              </div>

              {/* Filters */}
              {showFilters && (
                <div className="border-t pt-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Location
                      </label>
                      <Input
                        type="text"
                        value={filters.location || ''}
                        onChange={(e) => {
                          const newFilters = {...filters, location: e.target.value};
                          setFilters(newFilters);
                          // Update URL immediately for location changes
                          updateURLState({ filters: newFilters });
                        }}
                        placeholder="e.g., San Francisco, CA"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Experience Level
                      </label>
                      <select
                        value={filters.experienceLevel || ''}
                        onChange={(e) => {
                          const newFilters = {...filters, experienceLevel: e.target.value as JobSearchFilters['experienceLevel']};
                          setFilters(newFilters);
                          updateURLState({ filters: newFilters });
                        }}
                        className="w-full p-2 border border-slate-200 rounded-md"
                      >
                        <option value="">Any Level</option>
                        <option value="entry">Entry Level</option>
                        <option value="mid">Mid Level</option>
                        <option value="senior">Senior Level</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Job Type (select multiple)
                      </label>
                      <div className="space-y-2">
                        {[
                          { value: 'full-time' as const, label: 'Full Time' },
                          { value: 'part-time' as const, label: 'Part Time' },
                          { value: 'contract' as const, label: 'Contract' },
                          { value: 'internship' as const, label: 'Internship' }
                        ].map((jobType) => (
                          <label key={jobType.value} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={filters.jobType?.includes(jobType.value) || false}
                              onChange={(e) => {
                                const currentTypes = filters.jobType || [];
                                const newFilters = e.target.checked
                                  ? {
                                      ...filters, 
                                      jobType: [...currentTypes, jobType.value]
                                    }
                                  : {
                                      ...filters, 
                                      jobType: currentTypes.filter(t => t !== jobType.value)
                                    };
                                setFilters(newFilters);
                                updateURLState({ filters: newFilters });
                              }}
                              className="mr-2"
                            />
                            <span className="text-sm">{jobType.label}</span>
                          </label>
                        ))}
                      </div>
                      {filters.jobType && filters.jobType.length > 0 && (
                        <div className="mt-2 text-xs text-slate-600">
                          Selected: {filters.jobType.join(', ')}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Job Board Selection */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Specific Job Boards (optional)
                    </label>
                    <p className="text-xs text-slate-500 mb-3">
                      Select specific job boards to search. Leave empty to search all available boards.
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {availableJobSites.map((site, index) => (
                        <label key={index} className="flex items-center p-2 border rounded-md hover:bg-slate-50">
                          <input
                            type="checkbox"
                            checked={filters.sites?.includes(site.domain) || false}
                            onChange={(e) => {
                              const currentSites = filters.sites || [];
                              const newFilters = e.target.checked
                                ? {
                                    ...filters, 
                                    sites: [...currentSites, site.domain]
                                  }
                                : {
                                    ...filters, 
                                    sites: currentSites.filter(s => s !== site.domain)
                                  };
                              setFilters(newFilters);
                              updateURLState({ filters: newFilters });
                            }}
                            className="mr-2"
                          />
                          <div className="flex-1">
                            <div className="text-sm font-medium">{site.name}</div>
                            <div className={`text-xs px-1 py-0.5 rounded inline-block ${
                              site.category === 'tech' ? 'bg-blue-100 text-blue-700' :
                              site.category === 'remote' ? 'bg-green-100 text-green-700' :
                              site.category === 'startup' ? 'bg-purple-100 text-purple-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {site.category}
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                    {filters.sites && filters.sites.length > 0 && (
                      <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
                        <p className="text-sm text-blue-700">
                          <strong>Searching {filters.sites.length} selected job board{filters.sites.length > 1 ? 's' : ''}:</strong>{' '}
                          {filters.sites.map(site => 
                            availableJobSites.find(s => s.domain === site)?.name || site
                          ).join(', ')}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.remote || false}
                        onChange={(e) => {
                          const newFilters = {...filters, remote: e.target.checked};
                          setFilters(newFilters);
                          updateURLState({ filters: newFilters });
                        }}
                        className="mr-2"
                      />
                      Remote jobs only
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.entryLevel || false}
                        onChange={(e) => {
                          const newFilters = {...filters, entryLevel: e.target.checked};
                          setFilters(newFilters);
                          updateURLState({ filters: newFilters });
                        }}
                        className="mr-2"
                      />
                      Entry level friendly
                    </label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearFilters}
                    >
                      Clear Filters
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Search Query Display */}
          {searchQuery && searchQuery !== query && (
            <Card className="mb-4 bg-blue-50 border-blue-200">
              <CardContent className="pt-4">
                <p className="text-sm text-blue-700">
                  <strong>Search query used:</strong> {searchQuery}
                </p>
                {searchMetadata.originalCount !== undefined && searchMetadata.filteredCount !== undefined && (
                  <p className="text-sm text-blue-600 mt-1">
                    Found {searchMetadata.originalCount} results, showing {searchMetadata.filteredCount} job-related matches
                    {searchMetadata.originalCount > searchMetadata.filteredCount && 
                      ` (filtered out ${searchMetadata.originalCount - searchMetadata.filteredCount} non-job results)`}
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Job Sites Info */}
          <Card className="mb-6 bg-green-50 border-green-200">
            <CardContent className="pt-4">
              {filters.sites && filters.sites.length > 0 ? (
                <p className="text-sm text-green-700">
                  <strong>Searching {filters.sites.length} selected job board{filters.sites.length > 1 ? 's' : ''}:</strong>{' '}
                  {filters.sites.map(site => 
                    availableJobSites.find(s => s.domain === site)?.name || site
                  ).join(', ')}
                </p>
              ) : (
                <p className="text-sm text-green-700">
                  <strong>Searching across:</strong> {availableJobSites.slice(0, 6).map(site => site.name).join(', ')} 
                  {availableJobSites.length > 6 && ` and ${availableJobSites.length - 6} more job sites`}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Error Message */}
          {error && (
            <Card className="mb-6 border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <p className="text-red-600">{error}</p>
              </CardContent>
            </Card>
          )}

          {/* Results */}
          {results.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-slate-900">
                Search Results ({results.length} found)
              </h2>
              {results.map((result, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                            {getJobSiteName(result.displayLink)}
                          </span>
                          <span className="text-slate-500 text-sm flex items-center">
                            <MapPin className="w-3 h-3 mr-1" />
                            {result.displayLink}
                          </span>
                        </div>
                        <h3 className="text-lg font-medium text-slate-900 mb-2">
                          {result.title}
                        </h3>
                        <p className="text-slate-600 mb-4">
                          {result.snippet}
                        </p>
                        <div className="flex space-x-2">
                          <a 
                            href={result.link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center"
                          >
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="inline-flex items-center"
                            >
                              <ExternalLink className="w-4 h-4 mr-2" />
                              View Job
                            </Button>
                          </a>
                          <Button
                            variant={savedJobs[result.link] ? 'secondary' : 'outline'}
                            size="sm"
                            className="inline-flex items-center"
                            onClick={() => handleSaveJob(result)}
                            disabled={!!savedJobs[result.link] || savingJob === result.link}
                          >
                            <Bookmark className="w-4 h-4 mr-2" />
                            {savedJobs[result.link]
                              ? 'Saved'
                              : savingJob === result.link
                                ? 'Saving...'
                                : 'Save Job'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* No Results */}
          {!loading && results.length === 0 && query && !error && (
            <Card>
              <CardContent className="pt-6 text-center">
                <Search className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">No relevant job postings found</h3>
                <p className="text-slate-600 mb-4">
                  We filtered out non-job results but couldn&apos;t find job postings matching &quot;{query}&quot;.
                </p>
                <div className="text-sm text-slate-500 space-y-2">
                  <p><strong>Try these suggestions:</strong></p>
                  <ul className="list-disc list-inside space-y-1 text-left max-w-md mx-auto">
                    <li>Use more specific job titles (e.g., &quot;Software Engineer&quot; instead of &quot;Tech&quot;)</li>
                    <li>Include relevant skills or technologies</li>
                    <li>Try broader terms or remove location filters</li>
                    <li>Check if your search terms appear in typical job descriptions</li>
                  </ul>
                  <p className="mt-4">Make sure your Google Custom Search Engine is configured to search job sites.</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Empty State */}
          {!loading && results.length === 0 && !query && (
            <Card>
              <CardContent className="pt-6 text-center">
                <Search className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">Start your job search</h3>
                <p className="text-slate-600 mb-4">
                  Enter keywords, job titles, or company names to find opportunities across major job sites.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-slate-500">
                  {availableJobSites.slice(0, 8).map((site, index) => (
                    <div key={index} className="p-2 bg-slate-100 rounded">
                      {site.name}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Saved Search Dialog */}
      <SavedSearchDialog
        isOpen={savedSearchDialog.isOpen}
        mode={savedSearchDialog.mode}
        onClose={() => setSavedSearchDialog({ ...savedSearchDialog, isOpen: false })}
        onSaveSearch={handleSaveSearch}
        onUpdateSearch={handleUpdateSearch}
        onLoadSearch={handleLoadSearch}
        currentQuery={query}
        currentFilters={filters}
        loadedSearchId={loadedSearchId || undefined}
      />
    </div>
  );
};

export default JobSearchPage;
