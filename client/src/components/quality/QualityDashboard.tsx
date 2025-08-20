import React, {useState, useEffect} from 'react';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Badge} from '@/components/ui/badge';
import {Progress} from '@/components/ui/progress';
import {Alert, AlertDescription} from '@/components/ui/alert';
import {Button} from '@/components/ui/button';
import {RefreshCw, CheckCircle, XCircle, AlertTriangle, Info} from 'lucide-react';
import {useToast} from '@/hooks/use-toast';
import logger from '../../lib/logger';


interface QualityMetrics {
  eslint: {
    errors: number;
    warnings: number;
    status: 'pass' | 'fail' | 'error' | 'pending';
  };
  typescript: {
    errors: number;
    warnings: number;
    status: 'pass' | 'fail' | 'error' | 'pending';
  };
  lighthouse: {
    performance: number;
    accessibility: number;
    bestPractices: number;
    seo: number;
    status: 'pass' | 'fail' | 'error' | 'pending';
  };
  coverage: {
    lines: number;
    functions: number;
    branches: number;
    statements: number;
    status: 'pass' | 'fail' | 'error' | 'pending';
  };
  overall: {
    score: number;
    status: 'excellent' | 'good' | 'fair' | 'poor' | 'pending';
  };
}

interface QualityDashboardProps {
  className?: string;
}

export default function QualityDashboard ({className}: QualityDashboardProps) {

  const [metrics, setMetrics] = useState<QualityMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const {toast} = useToast();

  const fetchQualityMetrics = async () => {

    setLoading(true);
    try {

      const response = await fetch('/api/quality-metrics', { 'credentials': 'include' });
      if (response.ok) {

        const rawData = await response.json() as unknown;
        // Validate and type the response data
        if (rawData && typeof rawData === 'object' && 'overall' in rawData) {
          const data = rawData as QualityMetrics;
          setMetrics(data);
          setLastUpdated(new Date());
          toast({
            'title': 'Quality metrics updated',
            'description': 'Latest quality data has been loaded successfully.'
          });
        } else {
          throw new Error('Invalid quality metrics data structure');
        }

      } else {

        throw new Error('Failed to fetch quality metrics');

      }

    } catch (error) {

      logger.error('Error fetching quality metrics:', error);
      toast({
        'title': 'Error',
        'description': 'Failed to load quality metrics. Please try again.',
        'variant': 'destructive'
      });

    } finally {

      setLoading(false);

    }

  };

  useEffect(() => {

    fetchQualityMetrics();

  }, []);

  const getStatusIcon = (status: string) => {

    switch (status) {

    case 'pass':
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case 'fail':
      return <XCircle className="h-4 w-4 text-red-500" />;
    case 'error':
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    default:
      return <Info className="h-4 w-4 text-gray-500" />;

    }

  };

  const getStatusColor = (status: string) => {

    switch (status) {

    case 'pass':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'fail':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'error':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';

    }

  };

  const getScoreColor = (score: number) => {

    if (score >= 80) {

      return 'text-green-600';

    }
    if (score >= 60) {

      return 'text-yellow-600';

    }
    if (score >= 40) {

      return 'text-orange-600';

    }
    return 'text-red-600';

  };

  if (!metrics) {

    return (
      <div className={`space-y-4 ${className}`}>
        <Card>
          <CardContent className="flex items-center justify-center h-32">
            <div className="text-center">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-gray-400" />
              <p className="text-gray-500">Loading quality metrics...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );

  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Quality Monitor</h2>
          <p className="text-muted-foreground">
            Comprehensive code quality and performance metrics
          </p>
        </div>
        <div className="flex items-center gap-2">
          {lastUpdated && (
            <p className="text-sm text-muted-foreground">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
          <Button
            onClick={fetchQualityMetrics}
            disabled={loading}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Overall Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Overall Quality Score
            <Badge variant="outline" className={getStatusColor(metrics.overall.status)}>
              {metrics.overall.status}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Quality Score</span>
              <span className={`text-2xl font-bold ${getScoreColor(metrics.overall.score)}`}>
                {metrics.overall.score}%
              </span>
            </div>
            <Progress value={metrics.overall.score} className="h-2" />
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">ESLint:</span>
                <span className="ml-2 font-medium">
                  {metrics.eslint.errors} errors, {metrics.eslint.warnings} warnings
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">TypeScript:</span>
                <span className="ml-2 font-medium">
                  {metrics.typescript.errors} errors, {metrics.typescript.warnings} warnings
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quality Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ESLint */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              {getStatusIcon(metrics.eslint.status)}
              ESLint
              <Badge variant="outline" className={getStatusColor(metrics.eslint.status)}>
                {metrics.eslint.status}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Errors</span>
                <span className={
  `font-medium ${
  metrics.eslint.errors > 0 ? 'text-red-600' : 'text-green-600'
}`
}>
                  {metrics.eslint.errors}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Warnings</span>
                <span className={
  `font-medium ${
  metrics.eslint.warnings > 0 ? 'text-yellow-600' : 'text-green-600'
}`
}>
                  {metrics.eslint.warnings}
                </span>
              </div>
              {metrics.eslint.errors > 0 && (
                <Alert variant="destructive">
                  <AlertDescription>
                    ESLint found {metrics.eslint.errors} error(s) that need to be fixed.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>

        {/* TypeScript */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              {getStatusIcon(metrics.typescript.status)}
              TypeScript
              <Badge variant="outline" className={getStatusColor(metrics.typescript.status)}>
                {metrics.typescript.status}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Errors</span>
                <span className={
  `font-medium ${
  metrics.typescript.errors > 0 ? 'text-red-600' : 'text-green-600'
}`
}>
                  {metrics.typescript.errors}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Warnings</span>
                <span className={
  `font-medium ${
  metrics.typescript.warnings > 0 ? 'text-yellow-600' : 'text-green-600'
}`
}>
                  {metrics.typescript.warnings}
                </span>
              </div>
              {metrics.typescript.errors > 0 && (
                <Alert variant="destructive">
                  <AlertDescription>
                    TypeScript found {metrics.typescript.errors} error(s) that need to be fixed.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Lighthouse */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              {getStatusIcon(metrics.lighthouse.status)}
              Lighthouse
              <Badge variant="outline" className={getStatusColor(metrics.lighthouse.status)}>
                {metrics.lighthouse.status}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Performance</span>
                  <span className={
  `font-medium ${
  metrics.lighthouse.performance >= 90 ? 'text-green-600' : metrics.lighthouse.performance >= 70 ? 'text-yellow-600' : 'text-red-600'
}`
}>
                    {metrics.lighthouse.performance}%
                  </span>
                </div>
                <Progress value={metrics.lighthouse.performance} className="h-1" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Accessibility</span>
                  <span className={
  `font-medium ${
  metrics.lighthouse.accessibility >= 90 ? 'text-green-600' : metrics.lighthouse.accessibility >= 70 ? 'text-yellow-600' : 'text-red-600'
}`
}>
                    {metrics.lighthouse.accessibility}%
                  </span>
                </div>
                <Progress value={metrics.lighthouse.accessibility} className="h-1" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Best Practices</span>
                  <span className={
  `font-medium ${
  metrics.lighthouse.bestPractices >= 90 ? 'text-green-600' : metrics.lighthouse.bestPractices >= 70 ? 'text-yellow-600' : 'text-red-600'
}`
}>
                    {metrics.lighthouse.bestPractices}%
                  </span>
                </div>
                <Progress value={metrics.lighthouse.bestPractices} className="h-1" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">SEO</span>
                  <span className={
  `font-medium ${
  metrics.lighthouse.seo >= 90 ? 'text-green-600' : metrics.lighthouse.seo >= 70 ? 'text-yellow-600' : 'text-red-600'
}`
}>
                    {metrics.lighthouse.seo}%
                  </span>
                </div>
                <Progress value={metrics.lighthouse.seo} className="h-1" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Test Coverage */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              {getStatusIcon(metrics.coverage.status)}
              Test Coverage
              <Badge variant="outline" className={getStatusColor(metrics.coverage.status)}>
                {metrics.coverage.status}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Lines</span>
                  <span className={
  `font-medium ${
  metrics.coverage.lines >= 80 ? 'text-green-600' : metrics.coverage.lines >= 60 ? 'text-yellow-600' : 'text-red-600'
}`
}>
                    {metrics.coverage.lines}%
                  </span>
                </div>
                <Progress value={metrics.coverage.lines} className="h-1" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Functions</span>
                  <span className={
  `font-medium ${
  metrics.coverage.functions >= 80 ? 'text-green-600' : metrics.coverage.functions >= 60 ? 'text-yellow-600' : 'text-red-600'
}`
}>
                    {metrics.coverage.functions}%
                  </span>
                </div>
                <Progress value={metrics.coverage.functions} className="h-1" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Branches</span>
                  <span className={
  `font-medium ${
  metrics.coverage.branches >= 80 ? 'text-green-600' : metrics.coverage.branches >= 60 ? 'text-yellow-600' : 'text-red-600'
}`
}>
                    {metrics.coverage.branches}%
                  </span>
                </div>
                <Progress value={metrics.coverage.branches} className="h-1" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Statements</span>
                  <span className={
  `font-medium ${
  metrics.coverage.statements >= 80 ? 'text-green-600' : metrics.coverage.statements >= 60 ? 'text-yellow-600' : 'text-red-600'
}`
}>
                    {metrics.coverage.statements}%
                  </span>
                </div>
                <Progress value={metrics.coverage.statements} className="h-1" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Quality Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {metrics.eslint.errors > 0 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Fix {metrics.eslint.errors} ESLint error(s) to improve code quality.
                </AlertDescription>
              </Alert>
            )}
            {metrics.typescript.errors > 0 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Fix {metrics.typescript.errors} TypeScript error(s) to ensure type safety.
                </AlertDescription>
              </Alert>
            )}
            {metrics.lighthouse.performance < 90 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Optimize performance to reach 90%+ Lighthouse score.
                </AlertDescription>
              </Alert>
            )}
            {metrics.coverage.lines < 80 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Increase test coverage to reach 80%+ line coverage.
                </AlertDescription>
              </Alert>
            )}
            {metrics.overall.score >= 80 && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Excellent! Your code quality is in great shape. Keep up the good work!
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

}
