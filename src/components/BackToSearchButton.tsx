'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export function BackToSearchButton() {
  const [searchUrl, setSearchUrl] = useState('/job-search');

  useEffect(() => {
    // Get the last job search URL from sessionStorage
    const stored = sessionStorage.getItem('lastJobSearchUrl');
    if (stored && stored !== '/job-search?') {
      setSearchUrl(stored);
    }
  }, []);

  return (
    <Link href={searchUrl}>
      <Button variant="outline" className="mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Job Search
      </Button>
    </Link>
  );
}
