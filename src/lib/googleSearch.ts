import axios from 'axios';
import { DEFAULT_JOB_SITES, getEnabledJobSites } from './jobSites.config';

const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
const GOOGLE_CSE_ID = process.env.NEXT_PUBLIC_GOOGLE_CSE_ID;

if (!GOOGLE_API_KEY || !GOOGLE_CSE_ID) {
  throw new Error('Missing Google API Key or Custom Search Engine ID in environment variables');
}

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
  
  // Add job-specific keywords if not already present
  if (!searchQuery.toLowerCase().includes('job') && 
      !searchQuery.toLowerCase().includes('career') &&
      !searchQuery.toLowerCase().includes('position')) {
    searchQuery += ' job';
  }
  
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
  
  // Combine the query with site restrictions
  const finalQuery = searchQuery + sitesQuery;

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
    
    return {
      ...response.data,
      searchQuery: finalQuery,
      targetSites: useSiteOperator ? (customSites || filters.sites || []) : [],
      config: {
        userTier,
        sitesUsed: useSiteOperator ? (customSites || filters.sites || []).length : 'CSE-configured',
        maxResults,
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
