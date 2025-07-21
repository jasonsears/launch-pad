"use client";

import { Navigation } from '@/components/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, BookOpen, HelpCircle, Target, Zap, CheckCircle } from 'lucide-react';

export default function InterviewsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <MessageSquare className="h-8 w-8 text-green-600" />
            Interview Prep
          </h1>
          <p className="mt-2 text-gray-600">
            Prepare for interviews with organized notes, practice questions, and company research
          </p>
        </div>

        {/* Coming Soon Card */}
        <Card className="max-w-4xl">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto mb-4 p-3 bg-green-100 rounded-full w-fit">
              <Zap className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-gray-900">Coming Soon!</CardTitle>
            <CardDescription className="text-lg">
              The Interview Prep system is currently in development and will be available soon.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Planned Features */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Planned Features:</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  <BookOpen className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-gray-900">Interview Notes</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Organize notes for each interview with company research and key points
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  <HelpCircle className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-gray-900">Question Bank</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Practice with common interview questions and prepare your answers
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  <Target className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-gray-900">Job Description Storage</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Save and reference job descriptions during interview preparation
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-gray-900">Preparation Checklist</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Ensure you&apos;re fully prepared with customizable checklists
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Integration Note */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="h-4 w-4 text-green-600" />
                <span className="font-medium text-green-900">Integrated Workflow</span>
              </div>
              <p className="text-green-800 text-sm">
                Interview prep will be seamlessly integrated with your application tracker, automatically linking interviews to saved applications.
              </p>
            </div>

            {/* Current Status */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-900">Development Status</span>
              </div>
              <p className="text-blue-800 text-sm">
                The database schema is complete and ready. UI development is starting soon as part of Phase 3 enhancements.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button disabled className="flex-1">
                Create Interview Notes (Coming Soon)
              </Button>
              <Button variant="outline" disabled className="flex-1">
                Browse Questions (Coming Soon)
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
