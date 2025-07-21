import { JobSearchFilters } from '@/lib/googleSearch';

export interface JobSearchResponse {
  items: Array<{
    link: string;
    title: string;
    snippet: string;
    displayLink: string;
  }>;
  searchInformation?: {
    totalResults: string;
  };
  config?: {
    originalCount: number;
    filteredCount: number;
  };
  searchQuery?: string;
}

export interface SaveJobRequest {
  jobId: string;
  company: string;
  position: string;
  source: string;
  jobTitle?: string;
  jobSnippet?: string;
  datePosted?: string;
}

export interface SavedSearch {
  id: string;
  name: string;
  query: string;
  filters: JobSearchFilters;
  createdAt: string;
  lastUsedAt?: string;
  useCount: number;
  isDefault?: boolean;
}

/**
 * API service for job search operations
 */
export class JobSearchAPI {
  /**
   * Search for jobs using the backend API
   */
  static async searchJobs(
    query: string,
    filters: JobSearchFilters = {},
    signal?: AbortSignal
  ): Promise<JobSearchResponse> {
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
      signal,
    });

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        throw new Error(`Search failed with status ${response.status}`);
      }
      
      // Handle specific error types
      if (errorData.code === 'RATE_LIMIT_EXCEEDED') {
        throw new Error('Search rate limit exceeded. Please wait a few minutes before searching again.');
      } else if (errorData.code === 'API_ACCESS_DENIED') {
        throw new Error('Search service configuration error. Please contact support.');
      } else if (errorData.code === 'INVALID_REQUEST') {
        throw new Error('Invalid search request. Please check your search terms and try again.');
      } else {
        throw new Error(errorData.message || 'Search failed. Please try again.');
      }
    }

    return response.json();
  }

  /**
   * Save a job application
   */
  static async saveJob(jobData: SaveJobRequest): Promise<void> {
    const response = await fetch('/api/applications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(jobData)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to save job');
    }
  }

  /**
   * Get all saved searches
   */
  static async getSavedSearches(): Promise<SavedSearch[]> {
    const response = await fetch('/api/saved-searches');
    
    if (!response.ok) {
      throw new Error('Failed to load saved searches');
    }
    
    return response.json();
  }

  /**
   * Create a new saved search
   */
  static async createSavedSearch(
    name: string,
    query: string,
    filters: JobSearchFilters
  ): Promise<SavedSearch> {
    const response = await fetch('/api/saved-searches', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, query, filters })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to save search');
    }

    return response.json();
  }

  /**
   * Update a saved search
   */
  static async updateSavedSearch(
    id: string,
    name: string,
    query: string,
    filters: JobSearchFilters
  ): Promise<SavedSearch> {
    const response = await fetch('/api/saved-searches', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id,
        name,
        query,
        filters,
        updateContent: true
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to update search');
    }

    return response.json();
  }

  /**
   * Delete a saved search
   */
  static async deleteSavedSearch(id: string): Promise<void> {
    const response = await fetch(`/api/saved-searches?id=${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete search');
    }
  }

  /**
   * Load and use a saved search (increments usage count)
   */
  static async loadSavedSearch(id: string): Promise<SavedSearch> {
    const response = await fetch('/api/saved-searches', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id, updateContent: false })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to load search');
    }

    return response.json();
  }
}
