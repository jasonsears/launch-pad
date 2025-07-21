import axios, { AxiosError } from 'axios';
import { DEFAULT_JOB_SITES, getEnabledJobSites } from './jobSites.config';
import { recordApiMetric } from './apiMetrics';
import { filterJobResults as filterResults } from './jobResultsFilter';
import { buildSearchQuery, buildSiteQuery, validateSearchQuery } from './queryBuilder';
import { 
  handleAPIError, 
  createSuccessResponse, 
  extractQuotaInfo, 
  logAPISuccess,
  APIResponse
} from './apiResponseHandler';

export interface JobSearchFilters {
  location?: string;
  experienceLevel?: string;
  jobType?: string;
  selectedSites?: string[];
}

const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
const GOOGLE_CSE_ID = process.env.NEXT_PUBLIC_GOOGLE_CSE_ID;

// Enhanced validation with detailed logging
if (!GOOGLE_API_KEY || !GOOGLE_CSE_ID) {
  console.error('🔑 Google API Configuration Error:', {
    apiKeyStatus: GOOGLE_API_KEY ? 'Present' : 'MISSING',
    cseIdStatus: GOOGLE_CSE_ID ? 'Present' : 'MISSING',
    apiKeyLength: GOOGLE_API_KEY?.length || 0,
    cseIdFormat: GOOGLE_CSE_ID ? (GOOGLE_CSE_ID.includes(':') ? 'Valid format' : 'Invalid format') : 'Missing',
    environmentVariables: {
      'NEXT_PUBLIC_GOOGLE_API_KEY': GOOGLE_API_KEY ? 'SET' : 'NOT_SET',
      'NEXT_PUBLIC_GOOGLE_CSE_ID': GOOGLE_CSE_ID ? 'SET' : 'NOT_SET',
    },
    troubleshooting: [
      'Check .env.local file exists in project root',
      'Verify environment variable names are correct',
      'Restart Next.js development server after adding env vars',
      'Check Google Cloud Console for valid API key',
      'Verify Custom Search Engine is properly configured'
    ]
  });
  throw new Error('Missing Google API Key or Custom Search Engine ID in environment variables');
}

export interface JobSearchConfig {
  maxResults?: number;
  useSiteOperator?: boolean; // Toggle between programmatic vs CSE-configured sites
  customSites?: string[]; // Override default sites entirely
  userTier?: 'free' | 'premium' | 'enterprise'; // For SaaS tiers
  useExclusions?: boolean; // Control whether to apply content exclusions (default: true)
  customExclusions?: string[]; // Custom exclusion terms
}

export const searchJobs = async (
  query: string, 
  filters: JobSearchFilters = {}, 
  config: JobSearchConfig = {}
): Promise<APIResponse> => {
  const startTime = Date.now();
  
  try {
    const {
      maxResults = 10,
      useSiteOperator = true,
      customSites,
      userTier = 'free',
      useExclusions = true,
      customExclusions = []
    } = config;

    // Validate the search query
    const validation = validateSearchQuery(query);
    if (!validation.isValid) {
      throw new Error(validation.errors[0] || 'Invalid search query');
    }

    // Build the optimized search query using the query builder
    const searchQuery = buildSearchQuery(
      validation.sanitized, 
      filters, 
      useExclusions ? customExclusions : [],
      { enhanceJobTerms: true }
    );

    // Dynamic site filtering for SaaS flexibility
    let targetSites: string[] = [];
    
    if (useSiteOperator) {
      if (customSites && customSites.length > 0) {
        // Use completely custom sites (for enterprise users)
        targetSites = customSites;
      } else if (filters.selectedSites && filters.selectedSites.length > 0) {
        // Use user-selected sites
        targetSites = filters.selectedSites;
      } else {
        // Use default sites based on user tier
        const availableSites = getEnabledJobSites(DEFAULT_JOB_SITES);
        
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
            // Premium tier: All general + specialized sites
            targetSites = availableSites
              .filter(site => ['general', 'specialized'].includes(site.category))
              .map(site => site.domain);
            break;
          case 'enterprise':
            // Enterprise tier: All sites
            targetSites = availableSites.map(site => site.domain);
            break;
          default:
            targetSites = availableSites
              .filter(site => site.category === 'general')
              .slice(0, 3)
              .map(site => site.domain);
        }
      }
    }

    // Build the site query if using site operator
    const sitesQuery = targetSites.length > 0 ? buildSiteQuery(targetSites) : '';
    const finalQuery = searchQuery + sitesQuery;

    // Prepare API request parameters
    const params = {
      key: GOOGLE_API_KEY,
      cx: GOOGLE_CSE_ID,
      q: finalQuery,
      num: Math.min(maxResults, 10), // Google CSE limit is 10 per request
      start: 1,
    };

    console.log('🔍 Google Search Request:', {
      originalQuery: query,
      enhancedQuery: searchQuery,
      finalQuery,
      filters,
      userTier,
      maxResults,
      useSiteOperator,
      sitesCount: useSiteOperator ? targetSites.length : 'CSE-configured',
      targetSites: useSiteOperator ? targetSites : [],
      timestamp: new Date().toISOString()
    });

    // Record API metrics start
    const metricsContext = {
      provider: 'google',
      endpoint: 'customsearch',
      query: finalQuery,
      filters,
      userTier,
      maxResults
    };

    // Make the API request
    const response = await axios.get('https://www.googleapis.com/customsearch/v1', { 
      params,
      timeout: 30000 // 30 second timeout
    });

    const responseTime = Date.now() - startTime;

    // Extract quota information
    const quotaInfo = extractQuotaInfo(response.headers);

    // Log successful API call
    logAPISuccess(responseTime, quotaInfo, metricsContext);

    // Record successful API metrics
    await recordApiMetric(
      'success',
      responseTime,
      finalQuery,
      response.data.searchInformation?.totalResults || '0'
    );

    // Apply intelligent result filtering
    const filteredItems = response.data.items ? filterResults(response.data.items, query) : [];

    const searchResults = {
      items: filteredItems,
      searchInformation: response.data.searchInformation,
      queries: response.data.queries,
      context: {
        query,
        enhancedQuery: searchQuery,
        finalQuery,
        filters,
        resultsFiltered: (response.data.items?.length || 0) - filteredItems.length,
        targetSites: useSiteOperator ? targetSites : [],
        config: {
          userTier,
          maxResults,
          useSiteOperator,
          sitesUsed: useSiteOperator ? targetSites.length : 'CSE-configured',
        },
        apiMetrics: {
          responseTime,
          quotaInfo,
          timestamp: new Date().toISOString()
        }
      }
    };

    return createSuccessResponse(searchResults, responseTime);

  } catch (error) {
    const responseTime = Date.now() - startTime;
    
    // Record failed API metrics
    const errorInfo = error as AxiosError;
    await recordApiMetric(
      'error',
      responseTime,
      query,
      '0',
      {
        type: errorInfo.code || 'unknown',
        message: errorInfo.message,
        statusCode: errorInfo.response?.status
      }
    );

    return handleAPIError(error, {
      query,
      filters,
      config,
      responseTime
    });
  }
};

export const getAvailableSitesForTier = (tier: JobSearchConfig['userTier'] = 'free') => {
  const availableSites = getEnabledJobSites(DEFAULT_JOB_SITES);
  
  switch (tier) {
    case 'free':
      return availableSites
        .filter(site => site.category === 'general')
        .slice(0, 5);
    case 'premium':
      return availableSites
        .filter(site => ['general', 'specialized'].includes(site.category));
    case 'enterprise':
      return availableSites;
    default:
      return availableSites
        .filter(site => site.category === 'general')
        .slice(0, 3);
  }
};

export const validateSitesForTier = (
  selectedSites: string[],
  tier: JobSearchConfig['userTier'] = 'free'
) => {
  const availableSites = getAvailableSitesForTier(tier);
  const availableDomains = availableSites.map(site => site.domain);
  
  return selectedSites.every(site => availableDomains.includes(site));
};

export const getAvailableJobSites = () => {
  return getEnabledJobSites(DEFAULT_JOB_SITES);
};
