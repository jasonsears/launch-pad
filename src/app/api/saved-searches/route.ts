import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { JobSearchFilters } from '@/lib/googleSearch';

// GET - Retrieve all saved searches
export async function GET() {
  try {
    const savedSearches = await prisma.savedSearch.findMany({
      orderBy: [
        { isDefault: 'desc' },
        { lastUsedAt: 'desc' }
      ]
    });

    const searchesWithParsedFilters = savedSearches.map(search => ({
      ...search,
      filters: JSON.parse(search.filters) as JobSearchFilters
    }));

    return NextResponse.json(searchesWithParsedFilters);
  } catch (error) {
    console.error('Error fetching saved searches:', error);
    return NextResponse.json(
      { error: 'Failed to fetch saved searches' },
      { status: 500 }
    );
  }
}

// POST - Create a new saved search
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, query, filters }: {
      name: string;
      query: string;
      filters: JobSearchFilters;
    } = body;

    if (!name || !query) {
      return NextResponse.json(
        { error: 'Name and query are required' },
        { status: 400 }
      );
    }

    const savedSearch = await prisma.savedSearch.create({
      data: {
        name,
        query,
        filters: JSON.stringify(filters || {}),
      }
    });

    return NextResponse.json({
      ...savedSearch,
      filters: JSON.parse(savedSearch.filters) as JobSearchFilters
    });
  } catch (error) {
    console.error('Error creating saved search:', error);
    return NextResponse.json(
      { error: 'Failed to create saved search' },
      { status: 500 }
    );
  }
}

// PUT - Update saved search or increment usage
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, query, filters, updateContent }: {
      id: string;
      name?: string;
      query?: string;
      filters?: JobSearchFilters;
      updateContent?: boolean;
    } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Search ID is required' },
        { status: 400 }
      );
    }

    let updatedSearch;

    if (updateContent) {
      // Update the search content (name, query, filters)
      if (!name || !query) {
        return NextResponse.json(
          { error: 'Name and query are required for content updates' },
          { status: 400 }
        );
      }

      updatedSearch = await prisma.savedSearch.update({
        where: { id },
        data: {
          name,
          query,
          filters: JSON.stringify(filters || {}),
          lastUsedAt: new Date(),
          useCount: {
            increment: 1
          }
        }
      });
    } else {
      // Just update usage statistics
      updatedSearch = await prisma.savedSearch.update({
        where: { id },
        data: {
          lastUsedAt: new Date(),
          useCount: {
            increment: 1
          }
        }
      });
    }

    return NextResponse.json({
      ...updatedSearch,
      filters: JSON.parse(updatedSearch.filters) as JobSearchFilters
    });
  } catch (error) {
    console.error('Error updating saved search:', error);
    return NextResponse.json(
      { error: 'Failed to update saved search' },
      { status: 500 }
    );
  }
}

// DELETE - Remove a saved search
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Search ID is required' },
        { status: 400 }
      );
    }

    await prisma.savedSearch.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting saved search:', error);
    return NextResponse.json(
      { error: 'Failed to delete saved search' },
      { status: 500 }
    );
  }
}
