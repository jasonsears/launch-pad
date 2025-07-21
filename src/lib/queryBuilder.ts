/**
 * Search query building utilities
 * Handles the construction of optimized Google search queries for job searching
 */

import type { JobSearchFilters } from './googleSearch';

export interface QueryBuilderConfig {
  enhanceJobTerms?: boolean;
  addLocationQuotes?: boolean;
  strictExperienceLevel?: boolean;
  customJobKeywords?: string[];
}

/**
 * Core job-related keywords for query enhancement
 */
export const JOB_KEYWORDS = [
  'job', 'career', 'position', 'opening', 'hiring', 'employment', 'vacancy'
] as const;

/**
 * Job posting quality indicators to improve search relevance
 */
export const JOB_QUALITY_INDICATORS = [
  'apply', 'job description', 'requirements', 'qualifications', 'years of experience'
] as const;

/**
 * Experience level mapping for search queries
 */
export const EXPERIENCE_LEVEL_QUERIES = {
  entry: ['entry level', 'junior', 'graduate', 'new grad', 'associate'],
  mid: ['mid level', 'experienced', '3-5 years', 'senior', 'intermediate'],
  senior: ['senior', 'lead', '5+ years', 'principal', 'director', 'manager']
} as const;

/**
 * Job type mapping for search queries
 */
export const JOB_TYPE_QUERIES = {
  'full-time': ['full time', 'fulltime', 'permanent'],
  'part-time': ['part time', 'parttime', 'temporary'],
  'contract': ['contract', 'contractor', 'freelance', 'consulting'],
  'internship': ['intern', 'internship', 'co-op', 'co op']
} as const;

/**
 * Remote work indicators
 */
export const REMOTE_WORK_TERMS = [
  'remote', 'work from home', 'WFH', 'telecommute', 'distributed'
] as const;

/**
 * Checks if the query already contains job-related keywords
 */
export const hasJobKeywords = (query: string): boolean => {
  const lowerQuery = query.toLowerCase();
  return JOB_KEYWORDS.some(keyword => lowerQuery.includes(keyword));
};

/**
 * Enhances the base query with job-related terms if needed
 */
export const enhanceBaseQuery = (
  query: string, 
  config: QueryBuilderConfig = {}
): string => {
  const { enhanceJobTerms = true, customJobKeywords = [] } = config;
  
  if (!enhanceJobTerms) {
    return query.trim();
  }

  let enhancedQuery = query.trim();
  
  // Add job keywords if not already present
  const allJobKeywords = [...JOB_KEYWORDS, ...customJobKeywords];
  if (!hasJobKeywords(enhancedQuery)) {
    const keywordTerms = allJobKeywords.slice(0, 5).join(' OR ');
    enhancedQuery += ` (${keywordTerms})`;
  }
  
  // Add quality indicators to improve relevance
  const qualityTerms = JOB_QUALITY_INDICATORS.slice(0, 3).join(' OR ');
  enhancedQuery += ` (${qualityTerms})`;
  
  return enhancedQuery;
};

/**
 * Builds location filter query
 */
export const buildLocationQuery = (
  location: string, 
  config: QueryBuilderConfig = {}
): string => {
  if (!location?.trim()) {
    return '';
  }

  const { addLocationQuotes = true } = config;
  
  return addLocationQuotes 
    ? ` location:"${location.trim()}"` 
    : ` location:${location.trim()}`;
};

/**
 * Builds remote work filter query
 */
export const buildRemoteQuery = (remote: boolean): string => {
  if (!remote) {
    return '';
  }
  
  const remoteTerms = REMOTE_WORK_TERMS.join(' OR ');
  return ` (${remoteTerms})`;
};

/**
 * Builds experience level filter query
 */
export const buildExperienceLevelQuery = (
  experienceLevel: string | undefined,
  config: QueryBuilderConfig = {}
): string => {
  if (!experienceLevel || !(experienceLevel in EXPERIENCE_LEVEL_QUERIES)) {
    return '';
  }

  const { strictExperienceLevel = false } = config;
  const level = experienceLevel as keyof typeof EXPERIENCE_LEVEL_QUERIES;
  const terms = EXPERIENCE_LEVEL_QUERIES[level];
  
  // For strict mode, use more specific terms
  if (strictExperienceLevel) {
    const strictTerms = terms.filter(term => term.includes('level') || term.includes('years'));
    if (strictTerms.length > 0) {
      return ` (${strictTerms.map(term => `"${term}"`).join(' OR ')})`;
    }
  }
  
  const quotedTerms = terms.map(term => `"${term}"`).join(' OR ');
  return ` (${quotedTerms})`;
};

/**
 * Builds job type filter query
 */
export const buildJobTypeQuery = (jobTypes: string[]): string => {
  if (!jobTypes || jobTypes.length === 0) {
    return '';
  }

  const typeQueries = jobTypes
    .filter(type => type in JOB_TYPE_QUERIES)
    .map(type => {
      const terms = JOB_TYPE_QUERIES[type as keyof typeof JOB_TYPE_QUERIES];
      return `(${terms.join(' OR ')})`;
    });

  return typeQueries.length > 0 ? ` (${typeQueries.join(' OR ')})` : '';
};

/**
 * Builds site restriction query
 */
export const buildSiteQuery = (sites: string[]): string => {
  if (!sites || sites.length === 0) {
    return '';
  }

  const siteQueries = sites.map(site => `site:${site}`);
  return ` (${siteQueries.join(' OR ')})`;
};

/**
 * Builds exclusion query to filter out non-job content
 */
export const buildExclusionQuery = (
  customExclusions: string[] = [],
  isSpecificSearch = false
): string => {
  const baseExclusions = ['wikipedia', '"about us"', '"our company"'];
  const broadExclusions = [
    'blog', 'news', '"press release"', '"company profile"', 'investor'
  ];

  let exclusions = [...baseExclusions];
  
  if (!isSpecificSearch) {
    exclusions = [...exclusions, ...broadExclusions];
  }

  if (customExclusions.length > 0) {
    exclusions = [...exclusions, ...customExclusions];
  }

  return exclusions.length > 0 
    ? ` ${exclusions.map(term => `-${term}`).join(' ')}` 
    : '';
};

/**
 * Determines if a search should be considered "specific" for exclusion purposes
 */
export const isSpecificSearch = (
  query: string, 
  filters: JobSearchFilters
): boolean => {
  return query.includes('"') || 
         Boolean(filters.location && filters.location.trim() !== '') ||
         Boolean(filters.selectedSites && filters.selectedSites.length <= 2);
};

/**
 * Main query builder function
 */
export const buildSearchQuery = (
  baseQuery: string,
  filters: JobSearchFilters = {},
  customExclusions: string[] = [],
  config: QueryBuilderConfig = {}
): string => {
  // Start with enhanced base query
  let searchQuery = enhanceBaseQuery(baseQuery, config);
  
  // Add filter components
  if (filters.location) {
    searchQuery += buildLocationQuery(filters.location, config);
  }
  searchQuery += buildExperienceLevelQuery(filters.experienceLevel, config);
  
  // Handle job type as single string instead of array
  if (filters.jobType) {
    searchQuery += buildJobTypeQuery([filters.jobType]);
  }
  
  // Add exclusions (but not site restrictions - those are handled separately)
  const specificSearch = isSpecificSearch(baseQuery, filters);
  searchQuery += buildExclusionQuery(customExclusions, specificSearch);
  
  return searchQuery;
};

/**
 * Validates and sanitizes a search query
 */
export const validateSearchQuery = (query: string): { 
  isValid: boolean; 
  sanitized: string; 
  errors: string[] 
} => {
  const errors: string[] = [];
  let sanitized = query.trim();
  
  // Check for minimum length
  if (sanitized.length === 0) {
    errors.push('Search query cannot be empty');
    return { isValid: false, sanitized: '', errors };
  }
  
  if (sanitized.length < 2) {
    errors.push('Search query must be at least 2 characters long');
  }
  
  // Check for maximum length (Google has limits)
  if (sanitized.length > 200) {
    errors.push('Search query is too long (maximum 200 characters)');
    sanitized = sanitized.substring(0, 200);
  }
  
  // Remove potentially problematic characters
  sanitized = sanitized.replace(/[<>]/g, '');
  
  // Check for balanced quotes
  const quoteCount = (sanitized.match(/"/g) || []).length;
  if (quoteCount % 2 !== 0) {
    errors.push('Unbalanced quotes in search query');
  }
  
  return {
    isValid: errors.length === 0,
    sanitized,
    errors
  };
};
