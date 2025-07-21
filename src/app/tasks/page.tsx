"use client";

import { Navigation } from '@/components/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckSquare, Calendar, Target, TrendingUp, Zap, Clock, Bell } from 'lucide-react';

export default function TasksPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <CheckSquare className="h-8 w-8 text-purple-600" />
            Daily Tasks
          </h1>
          <p className="mt-2 text-gray-600">
            Stay organized with smart task suggestions and daily goal tracking
          </p>
        </div>

        {/* Coming Soon Card */}
        <Card className="max-w-4xl">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto mb-4 p-3 bg-purple-100 rounded-full w-fit">
              <Zap className="h-8 w-8 text-purple-600" />
            </div>
            <CardTitle className="text-2xl text-gray-900">Coming Soon!</CardTitle>
            <CardDescription className="text-lg">
              The Daily Task System is currently in development and will be available soon.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Planned Features */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Planned Features:</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  <Target className="h-5 w-5 text-purple-600 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-gray-900">Smart Suggestions</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      AI-powered task suggestions based on your application status and timeline
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  <CheckSquare className="h-5 w-5 text-purple-600 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-gray-900">Custom Tasks</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Create and manage your own custom tasks and reminders
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-purple-600 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-gray-900">Progress Tracking</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Track completion rates and maintain momentum in your job search
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  <Calendar className="h-5 w-5 text-purple-600 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-gray-900">Goal Setting</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Set daily and weekly goals to stay focused and motivated
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Task Examples */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Example Task Suggestions:</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg">
                  <Clock className="h-4 w-4 text-orange-500" />
                  <span className="text-sm text-gray-700">Follow up on applications sent over a week ago</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg">
                  <Bell className="h-4 w-4 text-blue-500" />
                  <span className="text-sm text-gray-700">Prepare for upcoming interview with Company X</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg">
                  <Target className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-gray-700">Apply to 3 new positions today</span>
                </div>
              </div>
            </div>

            {/* Current Status */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-4 w-4 text-purple-600" />
                <span className="font-medium text-purple-900">Development Status</span>
              </div>
              <p className="text-purple-800 text-sm">
                Part of Phase 3 Enhanced Features. Will integrate seamlessly with your existing applications and interview data.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button disabled className="flex-1">
                View Today&apos;s Tasks (Coming Soon)
              </Button>
              <Button variant="outline" disabled className="flex-1">
                Set Goals (Coming Soon)
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
