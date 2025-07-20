'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import { cn } from '@/lib/utils'
import { 
  Search, 
  FileText, 
  Briefcase, 
  MessageSquare, 
  CheckSquare,
  BarChart3
} from 'lucide-react'

export function Navigation() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Store current job search URL when on job search page
  useEffect(() => {
    if (pathname === '/job-search' && typeof window !== 'undefined') {
      const currentUrl = `${pathname}?${searchParams.toString()}`
      if (searchParams.toString()) {
        sessionStorage.setItem('lastJobSearchUrl', currentUrl)
      }
    }
  }, [pathname, searchParams])

  // Get the stored job search URL or default
  const getJobSearchHref = () => {
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('lastJobSearchUrl')
      if (stored && stored !== '/job-search?') {
        return stored
      }
    }
    return '/job-search'
  }

  const navigation = [
    { name: 'Dashboard', href: '/', icon: BarChart3 },
    { name: 'Job Search', href: getJobSearchHref(), icon: Search },
    { name: 'Applications', href: '/applications', icon: Briefcase },
    { name: 'Resumes', href: '/resumes', icon: FileText },
    { name: 'Interview Prep', href: '/interviews', icon: MessageSquare },
    { name: 'Daily Tasks', href: '/tasks', icon: CheckSquare },
  ]

  return (
    <nav className="bg-white shadow-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-xl font-bold text-slate-900">
                🚀 LaunchPad
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navigation.map((item) => {
                const Icon = item.icon
                const isJobSearch = item.name === 'Job Search'
                const isCurrentPage = pathname === (isJobSearch ? '/job-search' : item.href)
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium',
                      isCurrentPage
                        ? 'border-slate-500 text-slate-900'
                        : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
                    )}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {item.name}
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
