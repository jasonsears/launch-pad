'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { X, Search, Star, Calendar, TrendingUp } from 'lucide-react';
import { JobSearchFilters } from '@/lib/googleSearch';
import { SavedSearch } from '@/types';

interface SavedSearchDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveSearch?: (name: string, query: string, filters: JobSearchFilters) => void;
  onUpdateSearch?: (id: string, name: string, query: string, filters: JobSearchFilters) => void;
  onLoadSearch?: (search: SavedSearch) => void;
  onEditSearch?: (search: SavedSearch) => void;
  currentQuery?: string;
  currentFilters?: JobSearchFilters;
  loadedSearchId?: string; // ID of the currently loaded search
  mode: 'save' | 'load';
}

export function SavedSearchDialog({
  isOpen,
  onClose,
  onSaveSearch,
  onUpdateSearch,
  onLoadSearch,
  onEditSearch,
  currentQuery = '',
  currentFilters = {},
  loadedSearchId,
  mode
}: SavedSearchDialogProps) {
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [searchName, setSearchName] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen && mode === 'load') {
      fetchSavedSearches();
    }
  }, [isOpen, mode]);

  useEffect(() => {
    if (isOpen && mode === 'save' && loadedSearchId && savedSearches.length > 0) {
      // Pre-populate the name field when updating an existing search
      const loadedSearch = savedSearches.find(s => s.id === loadedSearchId);
      if (loadedSearch) {
        setSearchName(loadedSearch.name);
      }
    }
  }, [isOpen, mode, loadedSearchId, savedSearches]);

  const fetchSavedSearches = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/saved-searches');
      if (response.ok) {
        const searches = await response.json();
        setSavedSearches(searches);
      }
    } catch (error) {
      console.error('Error fetching saved searches:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSearch = async () => {
    if (!searchName.trim() || !currentQuery.trim()) return;

    setSaving(true);
    try {
      if (loadedSearchId) {
        // Update existing search
        const response = await fetch('/api/saved-searches', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: loadedSearchId,
            name: searchName.trim(),
            query: currentQuery,
            filters: currentFilters,
            updateContent: true,
          }),
        });

        if (response.ok) {
          onUpdateSearch?.(loadedSearchId, searchName.trim(), currentQuery, currentFilters);
          setSearchName('');
          onClose();
        }
      } else {
        // Create new search
        const response = await fetch('/api/saved-searches', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: searchName.trim(),
            query: currentQuery,
            filters: currentFilters,
          }),
        });

        if (response.ok) {
          onSaveSearch?.(searchName.trim(), currentQuery, currentFilters);
          setSearchName('');
          onClose();
        }
      }
    } catch (error) {
      console.error('Error saving search:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleLoadSearch = async (search: SavedSearch) => {
    try {
      // Update usage stats
      await fetch('/api/saved-searches', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: search.id }),
      });

      onLoadSearch?.(search);
      onClose();
    } catch (error) {
      console.error('Error loading search:', error);
    }
  };

  const handleEditSearch = (search: SavedSearch) => {
    onEditSearch?.(search);
    onClose();
  };

  const handleDeleteSearch = async (searchId: string) => {
    try {
      const response = await fetch(`/api/saved-searches?id=${searchId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSavedSearches(prev => prev.filter(s => s.id !== searchId));
      }
    } catch (error) {
      console.error('Error deleting search:', error);
    }
  };

  const formatFilters = (filters: JobSearchFilters) => {
    const filterLabels = [];
    if (filters.jobType) {
      filterLabels.push(`${filters.jobType} jobs`);
    }
    if (filters.selectedSites?.length) {
      filterLabels.push(`${filters.selectedSites.length} site${filters.selectedSites.length > 1 ? 's' : ''}`);
    }
    if (filters.experienceLevel) {
      filterLabels.push(`${filters.experienceLevel} level`);
    }
    if (filters.location) {
      filterLabels.push(`in ${filters.location}`);
    }
    return filterLabels.join(', ');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">
            {mode === 'save' 
              ? (loadedSearchId ? 'Update Search' : 'Save Search') 
              : 'Load Search'
            }
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6">
          {mode === 'save' ? (
            <div className="space-y-4">
              <div>
                <label htmlFor="search-name" className="block text-sm font-medium mb-2">
                  Search Name
                </label>
                <Input
                  id="search-name"
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  placeholder="Enter a name for this search"
                  className="w-full"
                />
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Current Search</h4>
                <p className="text-sm text-gray-700 mb-2">
                  <strong>Query:</strong> {currentQuery}
                </p>
                {Object.keys(currentFilters).length > 0 && (
                  <p className="text-sm text-gray-700">
                    <strong>Filters:</strong> {formatFilters(currentFilters)}
                  </p>
                )}
              </div>

              <div className="flex justify-end space-x-3">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveSearch}
                  disabled={!searchName.trim() || !currentQuery.trim() || saving}
                >
                  {saving 
                    ? (loadedSearchId ? 'Updating...' : 'Saving...') 
                    : (loadedSearchId ? 'Update Search' : 'Save Search')
                  }
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading saved searches...</p>
                </div>
              ) : savedSearches.length === 0 ? (
                <div className="text-center py-8">
                  <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No saved searches yet</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Perform a search and save it to see it here
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[50vh] overflow-y-auto">
                  {savedSearches.map((search) => (
                    <Card key={search.id} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-base flex items-center gap-2">
                              {search.name}
                              {search.isDefault && (
                                <Badge variant="secondary" className="text-xs">
                                  <Star className="h-3 w-3 mr-1" />
                                  Default
                                </Badge>
                              )}
                            </CardTitle>
                            <CardDescription className="mt-1">
                              {search.query}
                            </CardDescription>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteSearch(search.id);
                            }}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {Object.keys(search.filters).length > 0 && (
                            <p className="text-sm text-gray-600">
                              <strong>Filters:</strong> {formatFilters(search.filters)}
                            </p>
                          )}
                          
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <div className="flex items-center gap-4">
                              <span className="flex items-center gap-1">
                                <TrendingUp className="h-3 w-3" />
                                Used {search.useCount} times
                              </span>
                              {search.lastUsedAt && (
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  Last used {new Date(search.lastUsedAt).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex gap-2 mt-3">
                          <Button
                            className="flex-1"
                            onClick={() => handleLoadSearch(search)}
                          >
                            Load Search
                          </Button>
                          <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() => handleEditSearch(search)}
                          >
                            Edit
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
