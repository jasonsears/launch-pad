import axios from 'axios';
import { DEFAULT_JOB_SITES, getEnabledJobSites } from './jobSites.config';

const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
const GOOGLE_CSE_ID = process.env.NEXT_PUBLIC_GOOGLE_CSE_ID;

if (!GOOGLE_API_KEY || !GOOGLE_CSE_ID) {
  throw new Error('Missing Google API Key or Custom Search Engine ID in environment variables');
}

// Helper function to filter search results and ensure they are job-related
const filterJobResults = (items: Array<{ title?: string; snippet?: string; link?: string }>, originalQuery: string) => {
  const jobIndicators = [
    // Job-specific terms
    'job', 'position', 'career', 'hiring', 'employment', 'vacancy', 'opening',
    // Common job posting phrases
    'apply', 'application', 'candidate', 'qualifications', 'requirements',
    'experience', 'skills', 'responsibilities', 'duties', 'salary', 'benefits',
    // Action words in job posts
    'join', 'seeking', 'looking for', 'we are hiring', 'job description',
    'years of experience', 'full time', 'part time', 'remote', 'onsite'
  ];

  const nonJobIndicators = [
    // Content that's definitely not job postings
    'wikipedia', 'about us', 'our company', 'company history', 'news article',
    'press release', 'blog post', 'interview with', 'profile of', 'biography',
    'stock price', 'earnings', 'financial', 'quarterly results', 'investor',
    // Generic pages
    'home page', 'contact us', 'privacy policy', 'terms of service', 'cookie policy'
  ];

  return items.filter(item => {
    const title = (item.title || '').toLowerCase();
    const snippet = (item.snippet || '').toLowerCase();
    const url = (item.link || '').toLowerCase();
    const combinedText = `${title} ${snippet}`;
    
    // Check if the original search query terms appear in the result
    const queryTerms = originalQuery.toLowerCase().split(' ').filter(term => 
      term.length > 2 && !['job', 'position', 'career', 'and', 'or', 'the', 'for', 'in', 'at'].includes(term)
    );
    
    const hasQueryTerms = queryTerms.length === 0 || queryTerms.some(term => 
      combinedText.includes(term) || title.includes(term)
    );
    
    // Must contain job indicators
    const hasJobIndicators = jobIndicators.some(indicator => 
      combinedText.includes(indicator) || url.includes(indicator)
    );
    
    // Must not contain non-job indicators
    const hasNonJobIndicators = nonJobIndicators.some(indicator => 
      combinedText.includes(indicator) || url.includes(indicator)
    );
    
    // URL-based filtering for known job sites
    const isFromJobSite = [
      'linkedin.com/jobs', 'indeed.com', 'glassdoor.com', 'monster.com',
      'dice.com', 'ziprecruiter.com', 'careerbuilder.com', 'simplyhired.com',
      'remote.co', 'weworkremotely.com', 'stackoverflow.com/jobs',
      'angel.co', 'wellfound.com', 'jobs.', 'careers.', '/careers/', '/jobs/'
    ].some(site => url.includes(site));
    
    // Filter logic: must have query terms AND (job indicators OR be from job site) AND not have non-job indicators
    return hasQueryTerms && (hasJobIndicators || isFromJobSite) && !hasNonJobIndicators;
  });
};

export interface JobSearchFilters {
  location?: string;
  remote?: boolean;
  entryLevel?: boolean;
  jobType?: ('full-time' | 'part-time' | 'contract' | 'internship')[]; // Multi-select job types
  experienceLevel?: 'entry' | 'mid' | 'senior';
  sites?: string[]; // Dynamic site filtering
  enabledSiteCategories?: ('general' | 'tech' | 'remote' | 'startup' | 'executive')[];
}

export interface JobSearchConfig {
  maxResults?: number;
  useSiteOperator?: boolean; // Toggle between programmatic vs CSE-configured sites
  customSites?: string[]; // Override default sites entirely
  userTier?: 'free' | 'premium' | 'enterprise'; // For SaaS tiers
}

export const searchJobs = async (
  query: string, 
  filters: JobSearchFilters = {}, 
  config: JobSearchConfig = {}
) => {
  const {
    maxResults = 10,
    useSiteOperator = true, // Default to programmatic approach
    customSites,
    userTier = 'free'
  } = config;

  // Build the base search query
  let searchQuery = query.trim();
  
  // Require search terms - throw error if empty
  if (!searchQuery) {
    throw new Error('Search query is required');
  }
  
  // Enhanced job-specific keyword construction
  const jobKeywords = ['job', 'career', 'position', 'opening', 'hiring', 'employment', 'vacancy'];
  const hasJobKeyword = jobKeywords.some(keyword => 
    searchQuery.toLowerCase().includes(keyword)
  );
  
  if (!hasJobKeyword) {
    // Add multiple job-related terms to improve relevance
    searchQuery += ' (job OR position OR hiring OR career OR opening)';
  }
  
  // Add job posting indicators to improve quality
  searchQuery += ' (apply OR "job description" OR requirements OR qualifications OR "years of experience")';
  
  // Add location filter
  if (filters.location) {
    searchQuery += ` location:"${filters.location}"`;
  }
  
  // Add remote filter
  if (filters.remote) {
    searchQuery += ' (remote OR "work from home" OR WFH)';
  }
  
  // Add experience level filter
  if (filters.experienceLevel) {
    switch (filters.experienceLevel) {
      case 'entry':
        searchQuery += ' ("entry level" OR junior OR graduate OR "new grad")';
        break;
      case 'mid':
        searchQuery += ' ("mid level" OR experienced OR "3-5 years")';
        break;
      case 'senior':
        searchQuery += ' (senior OR lead OR "5+ years" OR principal)';
        break;
    }
  }
  
  // Add job type filter (now supports multiple selections)
  if (filters.jobType && filters.jobType.length > 0) {
    const jobTypeMap = {
      'full-time': 'full time OR fulltime',
      'part-time': 'part time OR parttime',
      'contract': 'contract OR contractor OR freelance',
      'internship': 'intern OR internship'
    };
    
    const jobTypeTerms = filters.jobType.map(type => `(${jobTypeMap[type]})`);
    searchQuery += ` (${jobTypeTerms.join(' OR ')})`;
  }

  // **DYNAMIC SITE FILTERING** - This is the key for SaaS flexibility
  let sitesQuery = '';
  
  if (useSiteOperator) {
    // Determine which sites to search based on user configuration
    let targetSites: string[] = [];
    
    if (customSites && customSites.length > 0) {
      // Use completely custom sites (for enterprise users)
      targetSites = customSites;
    } else if (filters.sites && filters.sites.length > 0) {
      // Use user-selected sites
      targetSites = filters.sites;
    } else {
      // Use default sites based on user tier and categories
      const availableSites = getEnabledJobSites(DEFAULT_JOB_SITES);
      
      // Filter by categories if specified
      if (filters.enabledSiteCategories && filters.enabledSiteCategories.length > 0) {
        targetSites = availableSites
          .filter(site => filters.enabledSiteCategories!.includes(site.category))
          .map(site => site.domain);
      } else {
        // Apply tier-based restrictions
        switch (userTier) {
          case 'free':
            // Free tier: Only top 5 general sites
            targetSites = availableSites
              .filter(site => site.category === 'general')
              .slice(0, 5)
              .map(site => site.domain);
            break;
          case 'premium':
            // Premium tier: Top 10 sites across all categories
            targetSites = availableSites
              .slice(0, 10)
              .map(site => site.domain);
            break;
          case 'enterprise':
            // Enterprise tier: All available sites
            targetSites = availableSites.map(site => site.domain);
            break;
        }
      }
    }
    
    // Build the site restriction query
    if (targetSites.length > 0) {
      sitesQuery = ' (' + targetSites.map(site => `site:${site}`).join(' OR ') + ')';
    }
  }
  
  // Combine the query with site restrictions and exclusions
  let finalQuery = searchQuery + sitesQuery;
  
  // Add exclusions to filter out non-job content
  finalQuery += ' -wikipedia -"about us" -"our company" -blog -news -"press release" -"company profile" -investor';
  
  const params = {
    key: GOOGLE_API_KEY,
    cx: GOOGLE_CSE_ID,
    q: finalQuery,
    num: Math.min(maxResults, 10), // Google CSE limit is 10 per request
    safe: 'off',
    filter: '1', // Enable duplicate filtering
    // Additional parameters for better job search results
    sort: 'date', // Try to get recent postings first
  };

  try {
    const response = await axios.get('https://www.googleapis.com/customsearch/v1', { params });
    
    // Filter results to ensure they are job-related
    const filteredItems = response.data.items ? filterJobResults(response.data.items, query) : [];
    
    return {
      ...response.data,
      items: filteredItems,
      searchQuery: finalQuery,
      targetSites: useSiteOperator ? (customSites || filters.sites || []) : [],
      config: {
        userTier,
        sitesUsed: useSiteOperator ? (customSites || filters.sites || []).length : 'CSE-configured',
        maxResults,
        originalCount: response.data.items?.length || 0,
        filteredCount: filteredItems.length,
      },
    };
  } catch (error) {
    console.error('Error fetching job search results:', error);
    throw error;
  }
};

// **SaaS-READY FUNCTIONS**

// Get available sites based on user tier
export const getAvailableSitesForTier = (tier: JobSearchConfig['userTier'] = 'free') => {
  const allSites = getEnabledJobSites(DEFAULT_JOB_SITES);
  
  switch (tier) {
    case 'free':
      return allSites.filter(site => site.category === 'general').slice(0, 5);
    case 'premium':
      return allSites.slice(0, 10);
    case 'enterprise':
      return allSites;
    default:
      return allSites.slice(0, 5);
  }
};

// Validate if sites are allowed for user tier
export const validateSitesForTier = (
  requestedSites: string[], 
  userTier: JobSearchConfig['userTier'] = 'free'
): { allowed: string[]; blocked: string[] } => {
  const allowedSites = getAvailableSitesForTier(userTier).map(site => site.domain);
  
  const allowed = requestedSites.filter(site => allowedSites.includes(site));
  const blocked = requestedSites.filter(site => !allowedSites.includes(site));
  
  return { allowed, blocked };
};

// For backwards compatibility
export const getAvailableJobSites = () => {
  return getEnabledJobSites(DEFAULT_JOB_SITES);
};
