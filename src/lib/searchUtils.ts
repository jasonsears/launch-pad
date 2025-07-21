import { JobSearchFilters } from '@/lib/googleSearch';

/**
 * Utility functions for job search functionality
 */

export const getJobSiteName = (url: string): string => {
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

export const getDefaultFilters = (): JobSearchFilters => ({
  location: undefined,
  experienceLevel: undefined,
  jobType: undefined,
  selectedSites: undefined,
});

export const hasNonDefaultFilters = (filters: JobSearchFilters): boolean => {
  return Boolean(
    filters.location?.trim() ||
    filters.experienceLevel ||
    filters.jobType ||
    (filters.selectedSites && filters.selectedSites.length > 0)
  );
};

export const parseFiltersFromURL = (filtersParam: string | null): JobSearchFilters => {
  if (filtersParam) {
    try {
      const parsed = JSON.parse(filtersParam);
      console.log('🔍 Loaded filters from URL:', parsed);
      return parsed;
    } catch (error) {
      console.error('❌ Failed to parse filters from URL:', error, 'Raw:', filtersParam);
    }
  }
  return getDefaultFilters();
};

export const validateSearchQuery = (query: string): string | null => {
  if (!query.trim()) {
    return 'Please enter a search term';
  }
  return null;
};

export const canPerformSearch = (query: string, lastSearchTime: number): string | null => {
  const queryError = validateSearchQuery(query);
  if (queryError) return queryError;
  
  // Rate limiting: prevent searches more frequent than every 2 seconds
  const now = Date.now();
  if (now - lastSearchTime < 2000) {
    return 'Please wait a moment before searching again';
  }
  
  return null;
};

export const formatSearchMetadata = (metadata: {
  originalCount?: number;
  filteredCount?: number;
  searchQuery?: string;
}) => {
  const { originalCount, filteredCount, searchQuery } = metadata;
  
  if (originalCount !== undefined && filteredCount !== undefined) {
    const efficiency = originalCount > 0 
      ? Math.round((filteredCount / originalCount) * 100) 
      : 0;
    
    return {
      originalCount,
      filteredCount,
      efficiency,
      searchQuery,
      hasFiltering: originalCount !== filteredCount
    };
  }
  
  return null;
};
