// Configuration for job search sites and settings
export interface JobSiteConfig {
  domain: string;
  name: string;
  category: 'general' | 'tech' | 'remote' | 'startup' | 'executive';
  description: string;
  enabled: boolean;
  priority: number; // 1-5, higher = more priority in search results
}

// Default job sites configuration
export const DEFAULT_JOB_SITES: JobSiteConfig[] = [
  {
    domain: 'linkedin.com',
    name: 'LinkedIn',
    category: 'general',
    description: 'Professional networking and job search platform',
    enabled: true,
    priority: 5,
  },
  {
    domain: 'indeed.com',
    name: 'Indeed',
    category: 'general',
    description: 'One of the largest job search engines',
    enabled: true,
    priority: 5,
  },
  {
    domain: 'glassdoor.com',
    name: 'Glassdoor',
    category: 'general',
    description: 'Job search with company reviews and salary info',
    enabled: true,
    priority: 4,
  },
  {
    domain: 'monster.com',
    name: 'Monster',
    category: 'general',
    description: 'Global employment website',
    enabled: true,
    priority: 3,
  },
  {
    domain: 'ziprecruiter.com',
    name: 'ZipRecruiter',
    category: 'general',
    description: 'Online employment marketplace',
    enabled: true,
    priority: 4,
  },
  {
    domain: 'dice.com',
    name: 'Dice',
    category: 'tech',
    description: 'Technology professionals job board',
    enabled: true,
    priority: 5,
  },
  {
    domain: 'stackoverflow.com/jobs',
    name: 'Stack Overflow Jobs',
    category: 'tech',
    description: 'Developer-focused job board',
    enabled: true,
    priority: 4,
  },
  {
    domain: 'angel.co',
    name: 'AngelList',
    category: 'startup',
    description: 'Startup jobs and investment platform',
    enabled: true,
    priority: 4,
  },
  {
    domain: 'remote.co',
    name: 'Remote.co',
    category: 'remote',
    description: 'Remote work job board',
    enabled: true,
    priority: 4,
  },
  {
    domain: 'weworkremotely.com',
    name: 'We Work Remotely',
    category: 'remote',
    description: 'Remote-only job board',
    enabled: true,
    priority: 4,
  },
  {
    domain: 'flexjobs.com',
    name: 'FlexJobs',
    category: 'remote',
    description: 'Flexible and remote job opportunities',
    enabled: true,
    priority: 3,
  },
  {
    domain: 'simplyhired.com',
    name: 'SimplyHired',
    category: 'general',
    description: 'Job search engine aggregator',
    enabled: true,
    priority: 3,
  },
  {
    domain: 'careerbuilder.com',
    name: 'CareerBuilder',
    category: 'general',
    description: 'Job search and career advice platform',
    enabled: true,
    priority: 3,
  },
  {
    domain: 'themuse.com',
    name: 'The Muse',
    category: 'general',
    description: 'Career advice and job search platform',
    enabled: true,
    priority: 3,
  },
  {
    domain: 'jobs.lever.co',
    name: 'Lever Jobs',
    category: 'startup',
    description: 'Modern companies using Lever ATS',
    enabled: true,
    priority: 3,
  },
];

// Search settings configuration
export interface SearchSettings {
  maxResults: number;
  defaultFilters: {
    entryLevelFriendly: boolean;
    includeRemote: boolean;
    preferredSites: string[];
  };
  searchModifiers: {
    addJobKeyword: boolean;
    enhanceQuery: boolean;
    filterDuplicates: boolean;
  };
}

export const DEFAULT_SEARCH_SETTINGS: SearchSettings = {
  maxResults: 10,
  defaultFilters: {
    entryLevelFriendly: false,
    includeRemote: true,
    preferredSites: [],
  },
  searchModifiers: {
    addJobKeyword: true,
    enhanceQuery: true,
    filterDuplicates: true,
  },
};

// Helper functions for job site management
export const getEnabledJobSites = (sites: JobSiteConfig[] = DEFAULT_JOB_SITES): JobSiteConfig[] => {
  return sites
    .filter(site => site.enabled)
    .sort((a, b) => b.priority - a.priority);
};

export const getJobSitesByCategory = (
  category: JobSiteConfig['category'],
  sites: JobSiteConfig[] = DEFAULT_JOB_SITES
): JobSiteConfig[] => {
  return sites.filter(site => site.category === category && site.enabled);
};

export const getJobSiteByDomain = (
  domain: string,
  sites: JobSiteConfig[] = DEFAULT_JOB_SITES
): JobSiteConfig | undefined => {
  return sites.find(site => site.domain === domain);
};

// Function to build site restriction query for Google Custom Search
export const buildSiteRestriction = (sites: JobSiteConfig[]): string => {
  const enabledDomains = getEnabledJobSites(sites).map(site => `site:${site.domain}`);
  return enabledDomains.length > 0 ? `(${enabledDomains.join(' OR ')})` : '';
};
