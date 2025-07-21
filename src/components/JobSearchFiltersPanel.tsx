"use client";

import { JobSearchFilters, getAvailableJobSites } from '@/lib/googleSearch';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MapPin, Briefcase, Clock, Globe } from 'lucide-react';

interface JobSearchFiltersProps {
  filters: JobSearchFilters;
  onFiltersChange: (filters: JobSearchFilters) => void;
  onClearFilters: () => void;
}

export function JobSearchFiltersPanel({
  filters,
  onFiltersChange,
  onClearFilters
}: JobSearchFiltersProps) {
  const availableJobSites = getAvailableJobSites();

  const updateFilter = (key: keyof JobSearchFilters, value: unknown) => {
    const newFilters = { ...filters, [key]: value };
    onFiltersChange(newFilters);
  };

  const experienceLevels = [
    { value: 'entry', label: 'Entry Level' },
    { value: 'mid', label: 'Mid Level' },
    { value: 'senior', label: 'Senior Level' },
    { value: 'executive', label: 'Executive' }
  ];

  const jobTypes = [
    { value: 'full-time', label: 'Full Time' },
    { value: 'part-time', label: 'Part Time' },
    { value: 'contract', label: 'Contract' },
    { value: 'internship', label: 'Internship' }
  ];

  return (
    <div className="space-y-6">
      {/* Location Filter */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-gray-500" />
          <label className="text-sm font-medium text-gray-700">Location</label>
        </div>
        <Input
          type="text"
          value={filters.location || ''}
          onChange={(e) => updateFilter('location', e.target.value)}
          placeholder="e.g., San Francisco, CA"
          className="w-full"
        />
      </div>

      {/* Experience Level */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Briefcase className="h-4 w-4 text-gray-500" />
          <label className="text-sm font-medium text-gray-700">Experience Level</label>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {experienceLevels.map((level) => (
            <button
              key={level.value}
              onClick={() => updateFilter('experienceLevel', 
                filters.experienceLevel === level.value ? undefined : level.value
              )}
              className={`px-3 py-2 text-sm rounded-md border transition-colors ${
                filters.experienceLevel === level.value
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {level.label}
            </button>
          ))}
        </div>
      </div>

      {/* Job Type */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-gray-500" />
          <label className="text-sm font-medium text-gray-700">Job Type</label>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {jobTypes.map((type) => (
            <button
              key={type.value}
              onClick={() => updateFilter('jobType', 
                filters.jobType === type.value ? undefined : type.value
              )}
              className={`px-3 py-2 text-sm rounded-md border transition-colors ${
                filters.jobType === type.value
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Job Sites */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-gray-500" />
          <label className="text-sm font-medium text-gray-700">Job Boards</label>
        </div>
        <p className="text-xs text-gray-500">
          Select specific job boards to search
        </p>
        <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
          {availableJobSites.slice(0, 6).map((site, index) => {
            const isSelected = filters.selectedSites?.includes(site.domain) || false;
            return (
              <button
                key={index}
                onClick={() => {
                  const currentSites = filters.selectedSites || [];
                  const newSites = isSelected
                    ? currentSites.filter(s => s !== site.domain)
                    : [...currentSites, site.domain];
                  updateFilter('selectedSites', newSites);
                }}
                className={`flex items-center justify-between p-3 rounded-md border transition-colors ${
                  isSelected
                    ? 'bg-blue-50 border-blue-200 text-blue-700'
                    : 'bg-white border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    isSelected ? 'bg-blue-500' : 'bg-gray-300'
                  }`} />
                  <div className="text-left">
                    <div className="text-sm font-medium">{site.name}</div>
                    <div className="text-xs text-gray-500">{site.domain}</div>
                  </div>
                </div>
                {site.category && (
                  <Badge 
                    variant="secondary" 
                    className="text-xs"
                  >
                    {site.category}
                  </Badge>
                )}
              </button>
            );
          })}
        </div>
        {availableJobSites.length > 6 && (
          <p className="text-xs text-gray-500 text-center">
            {availableJobSites.length - 6} more sites available
          </p>
        )}
      </div>

      {/* Active Filters Summary */}
      {(filters.location || filters.experienceLevel || filters.jobType || 
        (filters.selectedSites && filters.selectedSites.length > 0)) && (
        <div className="space-y-3 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">Active Filters</label>
            <button
              onClick={onClearFilters}
              className="text-xs text-red-600 hover:text-red-800 underline"
            >
              Clear All
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {filters.location && (
              <Badge variant="outline" className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {filters.location}
              </Badge>
            )}
            {filters.experienceLevel && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Briefcase className="h-3 w-3" />
                {experienceLevels.find(l => l.value === filters.experienceLevel)?.label}
              </Badge>
            )}
            {filters.jobType && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {jobTypes.find(t => t.value === filters.jobType)?.label}
              </Badge>
            )}
            {filters.selectedSites && filters.selectedSites.length > 0 && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Globe className="h-3 w-3" />
                {filters.selectedSites.length} site{filters.selectedSites.length > 1 ? 's' : ''}
              </Badge>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
