"use client";

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Save, FolderOpen } from 'lucide-react';

interface JobSearchFormProps {
  query: string;
  onQueryChange: (query: string) => void;
  onSearch: () => void;
  loading: boolean;
  onSaveSearch: () => void;
  onLoadSearch: () => void;
  loadedSearchId?: string;
  onClearLoadedSearch?: () => void;
}

export function JobSearchForm({
  query,
  onQueryChange,
  onSearch,
  loading,
  onSaveSearch,
  onLoadSearch,
  loadedSearchId,
  onClearLoadedSearch
}: JobSearchFormProps) {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSearch();
    }
  };

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="flex space-x-4 mb-4">
        <Input
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Search for jobs... (e.g., Software Engineer, Data Scientist)"
          className="flex-1"
        />
        <Button
          onClick={onSearch}
          disabled={loading || !query.trim()}
          className="px-6"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          ) : (
            <Search className="w-4 h-4" />
          )}
        </Button>
        <Button
          variant="outline"
          onClick={onSaveSearch}
          disabled={!query.trim()}
          title="Save current search"
        >
          <Save className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          onClick={onLoadSearch}
          title="Load saved search"
        >
          <FolderOpen className="w-4 h-4" />
        </Button>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center">
        {loadedSearchId && onClearLoadedSearch && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearLoadedSearch}
            className="text-blue-600 hover:text-blue-800"
          >
            Clear Loaded Search
          </Button>
        )}
      </div>
    </div>
  );
}
