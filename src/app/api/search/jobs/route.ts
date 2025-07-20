import { NextRequest, NextResponse } from 'next/server';
import { searchJobs, JobSearchFilters, JobSearchConfig } from '@/lib/googleSearch';

// This would typically come from your database based on user authentication
interface UserPlan {
  tier: 'free' | 'premium' | 'enterprise';
  customSites?: string[];
  searchLimits: {
    daily: number;
    concurrent: number;
  };
}

// Mock user plan lookup (replace with real database lookup)
const getUserPlan = async (userId: string): Promise<UserPlan> => {
  // This would be a database query in a real application
  const mockPlans: Record<string, UserPlan> = {
    'free-user': {
      tier: 'free',
      searchLimits: { daily: 50, concurrent: 1 }
    },
    'premium-user': {
      tier: 'premium',
      searchLimits: { daily: 500, concurrent: 3 }
    },
    'enterprise-user': {
      tier: 'enterprise',
      customSites: ['linkedin.com', 'indeed.com', 'company-careers-site.com'],
      searchLimits: { daily: 5000, concurrent: 10 }
    }
  };
  
  return mockPlans[userId] || mockPlans['free-user'];
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      query, 
      filters = {}, 
      userId = 'free-user', // In real app, get from auth token
      requestedSites = []
    }: {
      query: string;
      filters?: JobSearchFilters;
      userId?: string;
      requestedSites?: string[];
    } = body;

    // Input validation
    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      );
    }

    // Get user plan and validate permissions
    const userPlan = await getUserPlan(userId);
    
    // Check if user has exceeded their daily search limit
    // (In a real app, you'd track this in a database)
    
    // Configure search based on user plan
    const searchConfig: JobSearchConfig = {
      userTier: userPlan.tier,
      maxResults: 10,
      useSiteOperator: true, // Always use programmatic approach for SaaS
    };

    // Handle custom sites for enterprise users
    if (userPlan.tier === 'enterprise' && userPlan.customSites) {
      searchConfig.customSites = userPlan.customSites;
    }

    // Apply user-requested site filtering with tier validation
    if (requestedSites.length > 0) {
      // For SaaS, you might want to validate that user can access these sites
      const allowedSites = requestedSites; // Add validation logic here
      filters.sites = allowedSites;
    }

    // Perform the search
    const results = await searchJobs(query, filters, searchConfig);

    // Add SaaS-specific metadata
    const response = {
      ...results,
      meta: {
        userTier: userPlan.tier,
        searchesRemaining: userPlan.searchLimits.daily - 1, // Mock calculation
        plan: {
          tier: userPlan.tier,
          features: {
            maxSites: userPlan.tier === 'enterprise' ? 'unlimited' : 
                     userPlan.tier === 'premium' ? 10 : 5,
            customSites: userPlan.tier === 'enterprise',
            advancedFilters: userPlan.tier !== 'free',
            exportResults: userPlan.tier === 'enterprise',
          }
        }
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Job search API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint for getting available sites based on user tier
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId') || 'free-user';
  
  try {
    const userPlan = await getUserPlan(userId);
    
    // Import here to avoid circular dependencies
    const { getAvailableSitesForTier } = await import('@/lib/googleSearch');
    const availableSites = getAvailableSitesForTier(userPlan.tier);
    
    return NextResponse.json({
      sites: availableSites,
      userTier: userPlan.tier,
      limits: userPlan.searchLimits,
      customSitesAllowed: userPlan.tier === 'enterprise'
    });
    
  } catch (error) {
    console.error('Error fetching available sites:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
