import axios, { AxiosError } from 'axios';
import { DEFAULT_JOB_SITES, getEnabledJobSites } from './jobSites.config';
import { recordApiMetric } from './apiMetrics';

// Enhanced error type for better error handling
interface EnhancedError extends Error {
  originalError?: unknown;
  status?: number;
  timestamp?: string;
  query?: string;
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
  useExclusions?: boolean; // Control whether to apply content exclusions (default: true)
  customExclusions?: string[]; // Custom exclusion terms
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
    userTier = 'free',
    useExclusions = true,
    customExclusions
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
  
  // Add exclusions to filter out non-job content (configurable)
  if (useExclusions) {
    if (customExclusions && customExclusions.length > 0) {
      // Use custom exclusions if provided
      const exclusions = customExclusions.map(term => `-${term}`).join(' ');
      finalQuery += ' ' + exclusions;
    } else {
      // Use smart exclusions based on search specificity
      const isSpecificSearch = searchQuery.includes('"') || 
                              (filters.location && filters.location.trim() !== '') ||
                              (filters.sites && filters.sites.length <= 2);
      
      if (isSpecificSearch) {
        // For specific searches, use minimal exclusions to avoid over-filtering
        finalQuery += ' -wikipedia -"about us" -"our company"';
      } else {
        // For broad searches, use full exclusions to filter noise
        finalQuery += ' -wikipedia -"about us" -"our company" -blog -news -"press release" -"company profile" -investor';
      }
    }
  }
  
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

  // Enhanced logging for debugging API issues
  console.log('🔍 Google Search API Request:', {
    timestamp: new Date().toISOString(),
    query: finalQuery,
    queryLength: finalQuery.length,
    params: {
      ...params,
      key: params.key ? `${params.key.substring(0, 10)}...` : 'MISSING', // Mask API key
    },
    config: {
      userTier,
      maxResults,
      useSiteOperator,
      sitesCount: useSiteOperator ? (customSites || filters.sites || []).length : 'CSE-configured',
    }
  });

  try {
    const startTime = Date.now();
    const response = await axios.get('https://www.googleapis.com/customsearch/v1', { 
      params,
      timeout: 30000, // 30 second timeout
      headers: {
        'User-Agent': 'LaunchPad-JobSearch/1.0',
      }
    });
    const responseTime = Date.now() - startTime;
    
    // Enhanced success logging with quota analysis
    const quotaHeaders = {
      dailyQuotaUsed: response.headers['x-daily-quota-used'],
      rateLimitRemaining: response.headers['x-ratelimit-remaining'],
      rateLimitReset: response.headers['x-ratelimit-reset'],
      quotaLimit: response.headers['x-quota-limit'],
      requestsRemaining: response.headers['x-requests-remaining'],
    };
    
    console.log('✅ Google Search API Success:', {
      timestamp: new Date().toISOString(),
      responseTime: `${responseTime}ms`,
      totalResults: response.data.searchInformation?.totalResults || '0',
      resultsReturned: response.data.items?.length || 0,
      searchInformation: response.data.searchInformation,
      quotaInfo: quotaHeaders,
      responseHeaders: Object.keys(response.headers).filter(h => 
        h.includes('quota') || h.includes('limit') || h.includes('rate')
      ).reduce((obj: Record<string, unknown>, key) => {
        obj[key] = response.headers[key];
        return obj;
      }, {}),
    });
    
    // Check for quota warnings
    if (quotaHeaders.dailyQuotaUsed) {
      const quotaUsed = parseInt(quotaHeaders.dailyQuotaUsed);
      if (quotaUsed > 80) {
        console.warn('⚠️ High quota usage detected:', {
          dailyQuotaUsed: quotaUsed + '%',
          message: 'Approaching daily quota limit - this could cause intermittent failures'
        });
      }
    }
    
    // Filter results to ensure they are job-related
    const filteredItems = response.data.items ? filterJobResults(response.data.items, query) : [];
    
    console.log('🎯 Results Processing:', {
      originalCount: response.data.items?.length || 0,
      filteredCount: filteredItems.length,
      filterEfficiency: response.data.items?.length ? 
        `${Math.round((filteredItems.length / response.data.items.length) * 100)}%` : '0%'
    });
    
    // Record successful API metric
    recordApiMetric(
      'success',
      responseTime,
      query,
      response.data.searchInformation?.totalResults || '0'
    );
    
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
        responseTime,
        quotaInfo: quotaHeaders,
      },
    };
  } catch (error: unknown) {
    // Enhanced error logging with detailed diagnosis
    const isAxiosError = (err: unknown): err is AxiosError => {
      return (err as AxiosError)?.isAxiosError === true;
    };
    
    console.error('❌ Google Search API Error:', {
      timestamp: new Date().toISOString(),
      errorType: error instanceof Error ? error.constructor.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      status: isAxiosError(error) ? error.response?.status : undefined,
      statusText: isAxiosError(error) ? error.response?.statusText : undefined,
      headers: isAxiosError(error) ? error.response?.headers : undefined,
      data: isAxiosError(error) ? error.response?.data : undefined,
      config: isAxiosError(error) ? {
        url: error.config?.url,
        timeout: error.config?.timeout,
        params: error.config?.params ? {
          ...error.config.params,
          key: error.config.params.key ? `${error.config.params.key.substring(0, 10)}...` : 'MISSING'
        } : undefined,
      } : undefined,
      requestDetails: {
        query: finalQuery,
        queryLength: finalQuery.length,
        userTier,
        maxResults,
      }
    });

    // Specific error diagnosis and recommendations
    if (isAxiosError(error) && error.response?.status === 403) {
      console.error('🚫 API Access Error (403):', {
        possibleCauses: [
          'API key is invalid or missing',
          'Custom Search Engine ID is invalid',
          'API key lacks Custom Search API permissions',
          'Daily quota exceeded',
          'Billing not enabled on Google Cloud project'
        ],
        diagnosticSteps: [
          'Verify GOOGLE_API_KEY and GOOGLE_CSE_ID in environment variables',
          'Check Google Cloud Console > APIs & Services > Credentials',
          'Verify Custom Search API is enabled',
          'Check quota usage in Google Cloud Console',
          'Ensure billing is enabled on the project'
        ],
        apiKeyStatus: GOOGLE_API_KEY ? 'Present' : 'MISSING',
        cseIdStatus: GOOGLE_CSE_ID ? 'Present' : 'MISSING',
      });
    } else if (isAxiosError(error) && error.response?.status === 429) {
      console.error('⏰ Rate Limit Error (429):', {
        possibleCauses: [
          'Too many requests per minute',
          'Daily quota exceeded',
          'Concurrent request limit exceeded'
        ],
        quotaInfo: error.response.data,
        retryAfter: error.response.headers?.['retry-after'],
      });
    } else if (isAxiosError(error) && error.response?.status === 400) {
      console.error('🔧 Bad Request Error (400):', {
        possibleCauses: [
          'Search query is too long',
          'Invalid search parameters',
          'Malformed request'
        ],
        queryLength: finalQuery.length,
        queryPreview: finalQuery.substring(0, 200) + (finalQuery.length > 200 ? '...' : ''),
        errorDetails: error.response.data,
      });
    } else if (isAxiosError(error) && (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED')) {
      console.error('🌐 Network Error:', {
        possibleCauses: [
          'No internet connection',
          'DNS resolution failed',
          'Firewall blocking requests',
          'Google API temporarily unavailable'
        ],
        errorCode: error.code,
      });
    } else if (isAxiosError(error) && error.code === 'ETIMEDOUT') {
      console.error('⏱️ Timeout Error:', {
        possibleCauses: [
          'Request took longer than 30 seconds',
          'Slow network connection',
          'Google API performance issues'
        ],
        timeout: '30000ms',
      });
    }
    
    // Record failed API metric
    const apiErrorMessage = error instanceof Error ? error.message : 'Unknown error';
    const statusCode = isAxiosError(error) ? error.response?.status : undefined;
    const errorType = isAxiosError(error) ? 
      (error.response?.status === 403 ? 'API Access Denied' :
       error.response?.status === 429 ? 'Rate Limit' :
       error.response?.status === 400 ? 'Bad Request' :
       error.code === 'ETIMEDOUT' ? 'Timeout' :
       error.code === 'ENOTFOUND' ? 'Network Error' : 'Unknown Error') : 'Unknown Error';
    
    recordApiMetric(
      'error',
      0, // No response time on error
      query,
      '0',
      {
        type: errorType,
        message: apiErrorMessage,
        statusCode
      }
    );
    
    // Re-throw with enhanced error context
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const enhancedError = new Error(`Google Search API failed: ${errorMessage}`) as EnhancedError;
    enhancedError.originalError = error;
    enhancedError.status = isAxiosError(error) ? error.response?.status : undefined;
    enhancedError.timestamp = new Date().toISOString();
    enhancedError.query = finalQuery;
    
    throw enhancedError;
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
