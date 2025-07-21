"use client";

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, Bookmark, MapPin, Loader2 } from 'lucide-react';

interface JobResult {
  link: string;
  title: string;
  snippet: string;
  displayLink: string;
}

interface SearchResults {
  items?: JobResult[];
  searchInformation?: {
    totalResults: string;
    searchTime: number;
  };
}

interface JobResultsListProps {
  results: SearchResults | null;
  loading?: boolean;
  error?: string | null;
  onSaveApplication?: (item: JobResult) => Promise<void>;
  onRemoveApplication?: (applicationId: number) => Promise<void>;
  isApplicationSaved?: (jobUrl: string) => boolean;
}

export function JobResultsList({
  results,
  loading = false,
  error = null,
  onSaveApplication,
  isApplicationSaved
}: JobResultsListProps) {
  // Loading state
  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Searching for jobs...</p>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="text-red-500 mb-4">
            <ExternalLink className="h-8 w-8 mx-auto mb-2" />
            <p className="font-medium">Search Error</p>
          </div>
          <p className="text-gray-600">{error}</p>
        </CardContent>
      </Card>
    );
  }

  // No results yet
  if (!results) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="text-gray-400 mb-4">
            <ExternalLink className="h-8 w-8 mx-auto mb-2" />
            <p className="font-medium">Ready to Search</p>
          </div>
          <p className="text-gray-600">Enter a job title or keyword to start searching</p>
        </CardContent>
      </Card>
    );
  }

  // No search results
  if (!results.items || results.items.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="text-gray-400 mb-4">
            <ExternalLink className="h-8 w-8 mx-auto mb-2" />
            <p className="font-medium">No Jobs Found</p>
          </div>
          <p className="text-gray-600">Try adjusting your search terms or filters</p>
        </CardContent>
      </Card>
    );
  }

  const getJobSiteName = (url: string): string => {
    if (url.includes('linkedin.com')) return 'LinkedIn';
    if (url.includes('indeed.com')) return 'Indeed';
    if (url.includes('glassdoor.com')) return 'Glassdoor';
    if (url.includes('ziprecruiter.com')) return 'ZipRecruiter';
    if (url.includes('monster.com')) return 'Monster';
    return url.replace('www.', '').split('.')[0];
  };

  return (
    <div className="space-y-6">
      {/* Results Summary */}
      {results.searchInformation && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-700">
            Found {results.searchInformation.totalResults} results in {results.searchInformation.searchTime?.toFixed(2)}s
          </p>
        </div>
      )}

      {/* Job Results */}
      <div className="space-y-4">
        {results.items.map((result, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600">
                      <a 
                        href={result.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="hover:underline"
                      >
                        {result.title}
                      </a>
                    </h3>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-3">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {getJobSiteName(result.link)} • {result.displayLink}
                    </span>
                  </div>
                  
                  <p className="text-gray-700 mb-4 line-clamp-3">
                    {result.snippet}
                  </p>
                </div>
                
                <div className="flex gap-2">
                  {onSaveApplication && (
                    <Button
                      variant={isApplicationSaved?.(result.link) ? "default" : "outline"}
                      size="sm"
                      onClick={() => onSaveApplication(result)}
                      className="flex items-center gap-2"
                    >
                      <Bookmark className="h-4 w-4" />
                      {isApplicationSaved?.(result.link) ? "Saved" : "Save"}
                    </Button>
                  )}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(result.link, '_blank')}
                    className="flex items-center gap-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    View Job
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
        <Card key={index} className="hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  <a 
                    href={result.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:text-blue-600 transition-colors"
                  >
                    {result.title}
                  </a>
                </h3>
                <div className="flex items-center text-sm text-slate-600 mb-2">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span className="text-blue-600 font-medium">
                    {getJobSiteName(result.link)}
                  </span>
                  <span className="mx-2">•</span>
                  <span>{result.displayLink}</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 ml-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onSaveJob(result)}
                  disabled={savingJob === result.link}
                  className={`flex items-center ${
                    savedJobs[result.link] 
                      ? 'bg-green-50 border-green-200 text-green-700' 
                      : ''
                  }`}
                >
                  {savingJob === result.link ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  ) : (
                    <>
                      <Bookmark 
                        className={`w-4 h-4 mr-1 ${
                          savedJobs[result.link] ? 'fill-current' : ''
                        }`} 
                      />
                      {savedJobs[result.link] ? 'Saved' : 'Save'}
                    </>
                  )}
                </Button>
                
                <a 
                  href={result.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" size="sm" className="flex items-center">
                    <ExternalLink className="w-4 h-4 mr-1" />
                    View
                  </Button>
                </a>
              </div>
            </div>
            
            <p className="text-slate-700 leading-relaxed">
              {result.snippet}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
