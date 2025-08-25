import React from 'react';
import {Helmet} from 'react-helmet-async';
import QualityDashboard from '@/components/quality/QualityDashboard';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Badge} from '@/components/ui/badge';
import {Button} from '@/components/ui/button';
import {Download, FileText, BarChart3, Settings} from 'lucide-react';

export default function QualityMonitorPage () {

  return (
    <>
      <Helmet>
        <title>Quality Monitor - HRMS Elite</title>
        <meta name="description" content="Comprehensive code quality and performance monitoring dashboard" />
      </Helmet>

      <main role="main" className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Quality Monitor</h1>
              <p className="text-muted-foreground mt-2">
                Comprehensive code quality and performance monitoring for HRMS Elite
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Code Quality</CardTitle>
              <Badge variant="outline" className="bg-green-100 text-green-800">
                Excellent
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">95%</div>
              <p className="text-xs text-muted-foreground">
                Based on ESLint & TypeScript
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Performance</CardTitle>
              <Badge variant="outline" className="bg-green-100 text-green-800">
                Fast
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">92%</div>
              <p className="text-xs text-muted-foreground">
                Lighthouse Score
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Test Coverage</CardTitle>
              <Badge variant="outline" className="bg-green-100 text-green-800">
                Good
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">87%</div>
              <p className="text-xs text-muted-foreground">
                Lines covered
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Accessibility</CardTitle>
              <Badge variant="outline" className="bg-green-100 text-green-800">
                Excellent
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">98%</div>
              <p className="text-xs text-muted-foreground">
                WCAG Compliance
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quality Dashboard */}
        <QualityDashboard />

        {/* Additional Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Quality Standards
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">ESLint Errors</span>
                  <Badge variant="outline" className="bg-green-100 text-green-800">
                    0 errors
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">TypeScript Errors</span>
                  <Badge variant="outline" className="bg-green-100 text-green-800">
                    0 errors
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Performance Score</span>
                  <Badge variant="outline" className="bg-green-100 text-green-800">
                    ≥ 90%
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Test Coverage</span>
                  <Badge variant="outline" className="bg-green-100 text-green-800">
                    ≥ 80%
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Quality Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Last Week</span>
                  <Badge variant="outline" className="bg-green-100 text-green-800">
                    94%
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Last Month</span>
                  <Badge variant="outline" className="bg-green-100 text-green-800">
                    91%
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Last Quarter</span>
                  <Badge variant="outline" className="bg-green-100 text-green-800">
                    89%
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Overall Trend</span>
                  <Badge variant="outline" className="bg-green-100 text-green-800">
                    ↗ Improving
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quality Guidelines */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Quality Guidelines</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-lg">Code Quality Standards</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Zero ESLint errors allowed in production</li>
                  <li>• Zero TypeScript errors allowed in production</li>
                  <li>• Maximum 5 warnings per file</li>
                  <li>• Consistent code formatting and style</li>
                  <li>• Proper error handling and logging</li>
                </ul>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-lg">Performance Standards</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Lighthouse Performance Score ≥ 90%</li>
                  <li>• Lighthouse Accessibility Score ≥ 90%</li>
                  <li>• Lighthouse Best Practices Score ≥ 90%</li>
                  <li>• Lighthouse SEO Score ≥ 90%</li>
                  <li>• Page load time ≤ 3 seconds</li>
                </ul>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-lg">Testing Standards</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Minimum 80% line coverage</li>
                  <li>• Minimum 80% function coverage</li>
                  <li>• Minimum 80% branch coverage</li>
                  <li>• All critical paths must be tested</li>
                  <li>• Unit tests for all utilities and helpers</li>
                </ul>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-lg">Security Standards</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• No security vulnerabilities in dependencies</li>
                  <li>• Proper authentication and authorization</li>
                  <li>• Input validation and sanitization</li>
                  <li>• Secure communication protocols</li>
                  <li>• Regular security audits</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </>
  );

}
