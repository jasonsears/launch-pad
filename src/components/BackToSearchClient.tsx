'use client';

import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function BackToSearchButton() {
  const router = useRouter();

  const handleBack = () => {
    // Try to get the stored job search URL
    const stored = sessionStorage.getItem('lastJobSearchUrl');
    if (stored && stored !== '/job-search?') {
      router.push(stored);
    } else {
      router.push('/job-search');
    }
  };

  return (
    <Button variant="outline" className="mb-6" onClick={handleBack}>
      <ArrowLeft className="w-4 h-4 mr-2" />
      Back to Job Search
    </Button>
  );
}
