import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { JobSearchFilters } from '@/lib/googleSearch';
import { parseFiltersFromURL, getDefaultFilters, hasNonDefaultFilters } from '@/lib/searchUtils';

/**
 * Custom hook for managing job search URL state
 */
export const useJobSearchURLState = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const getQueryFromURL = useCallback(() => {
    return searchParams.get('q') || '';
  }, [searchParams]);

  const getFiltersFromURL = useCallback((): JobSearchFilters => {
    const filtersParam = searchParams.get('filters');
    return parseFiltersFromURL(filtersParam);
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
      if (hasNonDefaultFilters(updates.filters)) {
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

  return {
    getQueryFromURL,
    getFiltersFromURL,
    getShowFiltersFromURL,
    updateURLState
  };
};

/**
 * Custom hook for managing saved jobs state
 */
export const useSavedJobs = () => {
  const [savedJobs, setSavedJobs] = useState<{ [url: string]: boolean }>(() => {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('savedJobs');
      return saved ? JSON.parse(saved) : {};
    }
    return {};
  });

  // Persist to sessionStorage whenever savedJobs changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('savedJobs', JSON.stringify(savedJobs));
    }
  }, [savedJobs]);

  const addSavedJob = useCallback((jobUrl: string) => {
    setSavedJobs(prev => ({ ...prev, [jobUrl]: true }));
  }, []);

  const removeSavedJob = useCallback((jobUrl: string) => {
    setSavedJobs(prev => {
      const updated = { ...prev };
      delete updated[jobUrl];
      return updated;
    });
  }, []);

  return {
    savedJobs,
    addSavedJob,
    removeSavedJob
  };
};

/**
 * Custom hook for managing search form state
 */
export const useJobSearchForm = () => {
  const { getQueryFromURL, getFiltersFromURL, getShowFiltersFromURL, updateURLState } = useJobSearchURLState();
  
  const [query, setQuery] = useState(getQueryFromURL());
  const [filters, setFilters] = useState<JobSearchFilters>(getFiltersFromURL());
  const [showFilters, setShowFilters] = useState(getShowFiltersFromURL());
  const [loadedSearchId, setLoadedSearchId] = useState<string | null>(null);

  const updateQuery = useCallback((newQuery: string) => {
    setQuery(newQuery);
    updateURLState({ query: newQuery });
  }, [updateURLState]);

  const updateFilters = useCallback((newFilters: JobSearchFilters) => {
    setFilters(newFilters);
    updateURLState({ filters: newFilters });
  }, [updateURLState]);

  const updateShowFilters = useCallback((show: boolean) => {
    setShowFilters(show);
    updateURLState({ showFilters: show });
  }, [updateURLState]);

  const clearFilters = useCallback(() => {
    const defaultFilters = getDefaultFilters();
    setFilters(defaultFilters);
    updateURLState({ filters: defaultFilters });
  }, [updateURLState]);

  const resetForm = useCallback(() => {
    const defaultQuery = '';
    const defaultFilters = getDefaultFilters();
    setQuery(defaultQuery);
    setFilters(defaultFilters);
    setLoadedSearchId(null);
    updateURLState({ 
      query: defaultQuery, 
      filters: defaultFilters,
      replace: true 
    });
  }, [updateURLState]);

  return {
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
  };
};
