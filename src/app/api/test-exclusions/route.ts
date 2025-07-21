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
        totalResults: (withExclusions.data as any)?.searchInformation?.totalResults || '0',
        resultsCount: (withExclusions.data as any)?.items?.length || 0,
        searchQuery: (withExclusions.data as any)?.context?.finalQuery,
        originalCount: (withExclusions.data as any)?.context?.config?.originalCount || 0,
        filteredCount: (withExclusions.data as any)?.context?.resultsFiltered || 0
      },
      ...(withoutExclusions && {
        withoutExclusions: {
          totalResults: (withoutExclusions.data as any)?.searchInformation?.totalResults || '0',
          resultsCount: (withoutExclusions.data as any)?.items?.length || 0,
          searchQuery: (withoutExclusions.data as any)?.context?.finalQuery,
          originalCount: (withoutExclusions.data as any)?.context?.config?.originalCount || 0,
          filteredCount: (withoutExclusions.data as any)?.context?.resultsFiltered || 0
        }
      }),
      ...(withoutExclusions && {
        comparison: {
          resultsDifference: ((withoutExclusions.data as any)?.items?.length || 0) - ((withExclusions.data as any)?.items?.length || 0),
          totalResultsDifference: parseInt((withoutExclusions.data as any)?.searchInformation?.totalResults || '0') - parseInt((withExclusions.data as any)?.searchInformation?.totalResults || '0')
        }
      })
    });

  } catch (error) {
    console.error('Test API error:', error);
    return NextResponse.json(
      { error: 'Search test failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
