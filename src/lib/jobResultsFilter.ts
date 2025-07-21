/**
 * Job result filtering utilities
 * Provides sophisticated filtering to ensure search results are job-related
 */

export interface JobResultItem {
  title?: string;
  snippet?: string;
  link?: string;
}

export interface JobResultWithScore extends JobResultItem {
  relevanceScore: number;
}

export interface FilteringConfig {
  strictMode?: boolean;
  customJobIndicators?: string[];
  customNonJobIndicators?: string[];
  enableURLFiltering?: boolean;
  enableContentFiltering?: boolean;
}

/**
 * Job-specific terms that indicate a result is likely a job posting
 */
export const JOB_INDICATORS = [
  // Core job terms
  'job', 'position', 'career', 'hiring', 'employment', 'vacancy', 'opening',
  // Application-related terms
  'apply', 'application', 'candidate', 'qualifications', 'requirements',
  'experience', 'skills', 'responsibilities', 'duties', 'salary', 'benefits',
  // Action words in job posts
  'join', 'seeking', 'looking for', 'we are hiring', 'job description',
  'years of experience', 'full time', 'part time', 'remote', 'onsite',
  // Additional job-related terms
  'hire', 'recruit', 'team', 'role', 'opportunity'
] as const;

/**
 * Terms that indicate a result is NOT a job posting
 */
export const NON_JOB_INDICATORS = [
  // Company information pages
  'wikipedia', 'about us', 'our company', 'company history', 'leadership team',
  // News and articles
  'news article', 'press release', 'blog post', 'interview with', 'profile of', 'biography',
  // Financial information
  'stock price', 'earnings', 'financial', 'quarterly results', 'investor', 'annual report',
  // Generic website pages
  'home page', 'contact us', 'privacy policy', 'terms of service', 'cookie policy',
  'site map', 'help center', 'faq'
] as const;

/**
 * Known job site URL patterns for positive identification
 */
export const JOB_SITE_PATTERNS = [
  'linkedin.com/jobs', 'indeed.com', 'glassdoor.com', 'monster.com',
  'dice.com', 'ziprecruiter.com', 'careerbuilder.com', 'simplyhired.com',
  'remote.co', 'weworkremotely.com', 'stackoverflow.com/jobs',
  'angel.co', 'wellfound.com', 'jobs.', 'careers.', '/careers/', '/jobs/',
  'workable.com', 'greenhouse.io', 'lever.co', 'bamboohr.com'
] as const;

/**
 * Common stop words to exclude from query term matching
 */
export const STOP_WORDS = [
  'job', 'position', 'career', 'and', 'or', 'the', 'for', 'in', 'at',
  'with', 'from', 'by', 'as', 'to', 'of', 'a', 'an', 'is', 'are', 'was', 'were'
] as const;

/**
 * Extracts meaningful query terms from the original search query
 */
export const extractQueryTerms = (originalQuery: string): string[] => {
  return originalQuery
    .toLowerCase()
    .split(/\s+/)
    .filter(term => 
      term.length > 2 && 
      !(STOP_WORDS as readonly string[]).includes(term) &&
      !/^\d+$/.test(term) // Exclude pure numbers
    );
};

/**
 * Checks if the result contains terms from the original query
 */
export const hasRelevantQueryTerms = (
  combinedText: string, 
  title: string, 
  queryTerms: string[]
): boolean => {
  if (queryTerms.length === 0) return true;
  
  return queryTerms.some(term => 
    combinedText.includes(term) || 
    title.includes(term)
  );
};

/**
 * Checks if the result contains job-related indicators
 */
export const hasJobIndicators = (
  combinedText: string, 
  url: string, 
  customIndicators: string[] = []
): boolean => {
  const allIndicators = [...JOB_INDICATORS, ...customIndicators];
  return allIndicators.some(indicator => 
    combinedText.includes(indicator) || 
    url.includes(indicator)
  );
};

/**
 * Checks if the result contains non-job indicators
 */
export const hasNonJobIndicators = (
  combinedText: string, 
  url: string, 
  customNonIndicators: string[] = []
): boolean => {
  const allNonIndicators = [...NON_JOB_INDICATORS, ...customNonIndicators];
  return allNonIndicators.some(indicator => 
    combinedText.includes(indicator) || 
    url.includes(indicator)
  );
};

/**
 * Checks if the URL is from a known job site
 */
export const isFromKnownJobSite = (url: string): boolean => {
  return JOB_SITE_PATTERNS.some(pattern => url.includes(pattern));
};

/**
 * Calculates a relevance score for a job result
 */
export const calculateRelevanceScore = (
  item: JobResultItem,
  originalQuery: string
): number => {
  const title = (item.title || '').toLowerCase();
  const snippet = (item.snippet || '').toLowerCase();
  const url = (item.link || '').toLowerCase();
  const combinedText = `${title} ${snippet}`;
  
  let score = 0;
  
  // Query term relevance (up to 40 points)
  const queryTerms = extractQueryTerms(originalQuery);
  const matchingTerms = queryTerms.filter(term => 
    combinedText.includes(term) || title.includes(term)
  );
  score += (matchingTerms.length / Math.max(queryTerms.length, 1)) * 40;
  
  // Job indicators (up to 30 points)
  const jobIndicatorMatches = JOB_INDICATORS.filter(indicator => 
    combinedText.includes(indicator)
  ).length;
  score += Math.min(jobIndicatorMatches * 5, 30);
  
  // Known job site bonus (20 points)
  if (isFromKnownJobSite(url)) {
    score += 20;
  }
  
  // Title relevance bonus (up to 10 points)
  if (title.includes('job') || title.includes('position') || title.includes('career')) {
    score += 10;
  }
  
  // Penalty for non-job indicators
  const nonJobMatches = NON_JOB_INDICATORS.filter(indicator => 
    combinedText.includes(indicator)
  ).length;
  score -= nonJobMatches * 15;
  
  return Math.max(0, Math.min(100, score));
};

/**
 * Main filtering function for job search results
 */
export const filterJobResults = (
  items: JobResultItem[],
  originalQuery: string,
  config: FilteringConfig = {}
): JobResultItem[] => {
  const {
    strictMode = false,
    customJobIndicators = [],
    customNonJobIndicators = [],
    enableURLFiltering = true,
    enableContentFiltering = true
  } = config;

  if (!items || items.length === 0) {
    return [];
  }

  const queryTerms = extractQueryTerms(originalQuery);
  
  return items
    .map(item => ({
      ...item,
      relevanceScore: calculateRelevanceScore(item, originalQuery)
    } as JobResultWithScore))
    .filter(item => {
      const title = (item.title || '').toLowerCase();
      const snippet = (item.snippet || '').toLowerCase();
      const url = (item.link || '').toLowerCase();
      const combinedText = `${title} ${snippet}`;
      
      // Basic query term relevance check
      const hasQueryTerms = hasRelevantQueryTerms(combinedText, title, queryTerms);
      if (!hasQueryTerms && strictMode) {
        return false;
      }
      
      // Job indicator check
      const hasJobContent = enableContentFiltering 
        ? hasJobIndicators(combinedText, url, customJobIndicators)
        : true;
      
      // Non-job indicator check
      const hasNonJobContent = enableContentFiltering
        ? hasNonJobIndicators(combinedText, url, customNonJobIndicators)
        : false;
      
      // URL-based filtering
      const isFromJobSite = enableURLFiltering 
        ? isFromKnownJobSite(url)
        : false;
      
      // In strict mode, require higher standards
      if (strictMode) {
        return hasQueryTerms && 
               (hasJobContent || isFromJobSite) && 
               !hasNonJobContent &&
               item.relevanceScore >= 30;
      }
      
      // Standard filtering logic
      return hasQueryTerms && 
             (hasJobContent || isFromJobSite) && 
             !hasNonJobContent;
    })
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .map(({ relevanceScore, ...item }): JobResultItem => {
      // Remove the temporary score and return clean result
      void relevanceScore; // Acknowledge the variable is intentionally unused
      return item;
    });
};
