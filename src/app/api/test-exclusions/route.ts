import { NextRequest, NextResponse } from 'next/server';
import { searchJobs } from '@/lib/googleSearch';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, filters, testWithoutExclusions } = body;

    console.log('🧪 Test API called with:', { query, filters, testWithoutExclusions });

    // Run search with exclusions (default)
    const withExclusions = await searchJobs(query, filters, {
      userTier: 'free',
      useExclusions: true
    });

    let withoutExclusions = null;
    
    // If requested, also run without exclusions for comparison
    if (testWithoutExclusions) {
      withoutExclusions = await searchJobs(query, filters, {
        userTier: 'free',
        useExclusions: false
      });
    }

    return NextResponse.json({
      withExclusions: {
        totalResults: withExclusions.searchInformation?.totalResults || '0',
        resultsCount: withExclusions.items?.length || 0,
        searchQuery: withExclusions.searchQuery,
        originalCount: withExclusions.config?.originalCount || 0,
        filteredCount: withExclusions.config?.filteredCount || 0
      },
      ...(withoutExclusions && {
        withoutExclusions: {
          totalResults: withoutExclusions.searchInformation?.totalResults || '0',
          resultsCount: withoutExclusions.items?.length || 0,
          searchQuery: withoutExclusions.searchQuery,
          originalCount: withoutExclusions.config?.originalCount || 0,
          filteredCount: withoutExclusions.config?.filteredCount || 0
        }
      }),
      comparison: withoutExclusions ? {
        resultsDifference: (withoutExclusions.items?.length || 0) - (withExclusions.items?.length || 0),
        totalResultsDifference: parseInt(withoutExclusions.searchInformation?.totalResults || '0') - parseInt(withExclusions.searchInformation?.totalResults || '0')
      } : null
    });

  } catch (error) {
    console.error('Test API error:', error);
    return NextResponse.json(
      { error: 'Search test failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
