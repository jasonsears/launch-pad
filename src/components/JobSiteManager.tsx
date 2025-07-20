"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DEFAULT_JOB_SITES, JobSiteConfig } from '@/lib/jobSites.config';
import { Settings, Plus, Trash2, Check, X } from 'lucide-react';

interface JobSiteManagerProps {
  userTier: 'free' | 'premium' | 'enterprise';
  onSitesChange?: (sites: JobSiteConfig[]) => void;
}

export function JobSiteManager({ userTier, onSitesChange }: JobSiteManagerProps) {
  const [sites, setSites] = useState<JobSiteConfig[]>(DEFAULT_JOB_SITES);
  const [newSite, setNewSite] = useState({
    domain: '',
    name: '',
    category: 'general' as JobSiteConfig['category'],
    description: '',
    enabled: true,
    priority: 3,
  });
  const [isAddingNew, setIsAddingNew] = useState(false);

  const canManageSites = userTier === 'enterprise';
  const maxSites = userTier === 'free' ? 5 : userTier === 'premium' ? 10 : Infinity;

  useEffect(() => {
    onSitesChange?.(sites);
  }, [sites, onSitesChange]);

  const handleToggleSite = (index: number) => {
    if (!canManageSites) return;
    
    const newSites = [...sites];
    newSites[index] = { ...newSites[index], enabled: !newSites[index].enabled };
    setSites(newSites);
  };

  const handleAddSite = () => {
    if (!canManageSites || !newSite.domain || !newSite.name) return;
    
    const newSiteConfig: JobSiteConfig = {
      ...newSite,
      domain: newSite.domain.replace(/^https?:\/\//, ''), // Remove protocol if present
    };
    
    setSites([...sites, newSiteConfig]);
    setNewSite({
      domain: '',
      name: '',
      category: 'general',
      description: '',
      enabled: true,
      priority: 3,
    });
    setIsAddingNew(false);
  };

  const handleRemoveSite = (index: number) => {
    if (!canManageSites) return;
    
    const newSites = sites.filter((_, i) => i !== index);
    setSites(newSites);
  };

  const enabledSites = sites.filter(site => site.enabled);
  const isWithinLimit = enabledSites.length <= maxSites;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Settings className="w-5 h-5 mr-2" />
          Job Site Configuration
          <span className="ml-auto text-sm font-normal">
            {enabledSites.length}/{maxSites === Infinity ? '∞' : maxSites} sites enabled
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!isWithinLimit && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-yellow-700 text-sm">
              You have {enabledSites.length} sites enabled, but your {userTier} plan allows only {maxSites}. 
              Please disable some sites or upgrade your plan.
            </p>
          </div>
        )}

        <div className="space-y-3">
          {sites.map((site, index) => (
            <div 
              key={index} 
              className={`flex items-center justify-between p-3 border rounded-md ${
                site.enabled ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h3 className="font-medium">{site.name}</h3>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    site.category === 'tech' ? 'bg-blue-100 text-blue-700' :
                    site.category === 'remote' ? 'bg-green-100 text-green-700' :
                    site.category === 'startup' ? 'bg-purple-100 text-purple-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {site.category}
                  </span>
                  <span className="text-xs text-gray-500">
                    Priority: {site.priority}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{site.domain}</p>
                {site.description && (
                  <p className="text-xs text-gray-500 mt-1">{site.description}</p>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  variant={site.enabled ? "outline" : "default"}
                  onClick={() => handleToggleSite(index)}
                  disabled={!canManageSites}
                  className="flex items-center"
                >
                  {site.enabled ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                  {site.enabled ? 'Disable' : 'Enable'}
                </Button>
                
                {canManageSites && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRemoveSite(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        {canManageSites && (
          <div className="mt-6">
            {!isAddingNew ? (
              <Button 
                onClick={() => setIsAddingNew(true)}
                className="flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Custom Job Site
              </Button>
            ) : (
              <div className="border rounded-md p-4 bg-gray-50">
                <h3 className="font-medium mb-3">Add New Job Site</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  <Input
                    placeholder="Domain (e.g., example.com)"
                    value={newSite.domain}
                    onChange={(e) => setNewSite({...newSite, domain: e.target.value})}
                  />
                  <Input
                    placeholder="Display Name"
                    value={newSite.name}
                    onChange={(e) => setNewSite({...newSite, name: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  <select
                    value={newSite.category}
                    onChange={(e) => setNewSite({...newSite, category: e.target.value as JobSiteConfig['category']})}
                    className="w-full p-2 border border-gray-200 rounded-md"
                  >
                    <option value="general">General</option>
                    <option value="tech">Technology</option>
                    <option value="remote">Remote</option>
                    <option value="startup">Startup</option>
                    <option value="executive">Executive</option>
                  </select>
                  <select
                    value={newSite.priority}
                    onChange={(e) => setNewSite({...newSite, priority: parseInt(e.target.value)})}
                    className="w-full p-2 border border-gray-200 rounded-md"
                  >
                    <option value={1}>Priority 1 (Lowest)</option>
                    <option value={2}>Priority 2</option>
                    <option value={3}>Priority 3 (Medium)</option>
                    <option value={4}>Priority 4</option>
                    <option value={5}>Priority 5 (Highest)</option>
                  </select>
                </div>
                <Input
                  placeholder="Description (optional)"
                  value={newSite.description}
                  onChange={(e) => setNewSite({...newSite, description: e.target.value})}
                  className="mb-3"
                />
                <div className="flex space-x-2">
                  <Button onClick={handleAddSite} disabled={!newSite.domain || !newSite.name}>
                    Add Site
                  </Button>
                  <Button variant="outline" onClick={() => setIsAddingNew(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {!canManageSites && (
          <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-blue-700 text-sm">
              <strong>Want to customize job sites?</strong> Upgrade to Enterprise plan to add custom job sites, 
              adjust priorities, and get unlimited searches.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
