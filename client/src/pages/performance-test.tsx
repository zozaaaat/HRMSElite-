import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  Activity, 
  Zap, 
  Clock, 
  HardDrive, 
  Network, 
  TrendingUp,
  Settings,
  Play,
  Pause,
  RotateCcw,
  Download,
  Upload,
  Cpu,
  MemoryStick
} from 'lucide-react';
import PerformanceMonitor from '@/components/optimized/PerformanceMonitor';
import AdvancedLazyLoader from '@/components/optimized/AdvancedLazyLoader';
import { useLazyLoading } from '@/hooks/useLazyLoading';

interface PerformanceTest {
  name: string;
  description: string;
  icon: React.ReactNode;
  status: 'idle' | 'running' | 'completed' | 'failed';
  result: number | undefined;
  unit?: string;
  threshold: number;
}

const PerformanceTestPage: React.FC = () => {
  const { t } = useTranslation();
  const [tests, setTests] = useState<PerformanceTest[]>([
    {
      name: 'Bundle Size Test',
      description: t('performanceTest.tests.bundleSize'),
      icon: <HardDrive className="h-4 w-4" />,
      status: 'idle',
      result: undefined,
      threshold: 1000,
      unit: 'KB'
    },
    {
      name: 'Load Time Test',
      description: t('performanceTest.tests.loadTime'),
      icon: <Clock className="h-4 w-4" />,
      status: 'idle',
      result: undefined,
      threshold: 3000,
      unit: 'ms'
    },
    {
      name: 'Memory Usage Test',
      description: t('performanceTest.tests.memoryUsage'),
      icon: <MemoryStick className="h-4 w-4" />,
      status: 'idle',
      result: undefined,
      threshold: 100,
      unit: 'MB'
    },
    {
      name: 'Network Requests Test',
      description: t('performanceTest.tests.networkRequests'),
      icon: <Network className="h-4 w-4" />,
      status: 'idle',
      result: undefined,
      threshold: 50,
      unit: 'requests'
    },
    {
      name: 'Render Performance Test',
      description: t('performanceTest.tests.render'),
      icon: <Cpu className="h-4 w-4" />,
      status: 'idle',
      result: undefined,
      threshold: 16,
      unit: 'ms'
    },
    {
      name: 'FPS Test',
      description: t('performanceTest.tests.fps'),
      icon: <Activity className="h-4 w-4" />,
      status: 'idle',
      result: undefined,
      threshold: 30,
      unit: 'FPS'
    }
  ]);

  const [isRunningAll, setIsRunningAll] = useState(false);
  const [overallScore, setOverallScore] = useState(0);
  const { preloadComponents } = useLazyLoading();

  // Simulate performance test
  const runTest = async (testIndex: number): Promise<number> => {
    const test = tests[testIndex];
    
    // Simulate different test scenarios
    switch (test?.name) {
      case 'Bundle Size Test':
        return Math.random() * 800 + 200; // 200-1000 KB
      case 'Load Time Test':
        return Math.random() * 2000 + 500; // 500-2500 ms
      case 'Memory Usage Test':
        return Math.random() * 80 + 20; // 20-100 MB
      case 'Network Requests Test':
        return Math.random() * 30 + 10; // 10-40 requests
      case 'Render Performance Test':
        return Math.random() * 10 + 8; // 8-18 ms
      case 'FPS Test':
        return Math.random() * 30 + 30; // 30-60 FPS
      default:
        return 0;
    }
  };

  // Run single test
  const runSingleTest = async (testIndex: number) => {
    setTests(prev => prev.map((test, index) => 
      index === testIndex ? { ...test, status: 'running' } : test
    ));

    try {
      const result = await runTest(testIndex);
      
      setTests(prev => prev.map((test, index) => 
        index === testIndex 
          ? { ...test, status: 'completed', result }
          : test
      ));
    } catch {
      setTests(prev => prev.map((test, index) => 
        index === testIndex ? { ...test, status: 'failed' } : test
      ));
    }
  };

  // Run all tests
  const runAllTests = async () => {
    setIsRunningAll(true);
    
    for (let i = 0; i < tests.length; i++) {
      await runSingleTest(i);
      // Add delay between tests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    setIsRunningAll(false);
    calculateOverallScore();
  };

  // Reset all tests
  const resetTests = () => {
    setTests(prev => prev.map(test => ({ ...test, status: 'idle', result: undefined })));
    setOverallScore(0);
  };

  // Calculate overall performance score
  const calculateOverallScore = () => {
    const completedTests = tests.filter(test => test.status === 'completed' && test.result !== undefined);
    
    if (completedTests.length === 0) return;

    let totalScore = 0;
    completedTests.forEach(test => {
      const percentage = (test.result! / test.threshold) * 100;
      const score = Math.max(0, 100 - percentage);
      totalScore += score;
    });

    const averageScore = totalScore / completedTests.length;
    setOverallScore(Math.round(averageScore));
  };

  // Get test status color
  const getTestStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'secondary';
      case 'completed':
        return 'default';
      case 'failed':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  // Get test status icon
  const getTestStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <Play className="h-4 w-4 animate-pulse" />;
      case 'completed':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <Settings className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  // Get performance grade
  const getPerformanceGrade = (score: number) => {
    if (score >= 90) return { grade: 'A+', color: 'text-green-500' };
    if (score >= 80) return { grade: 'A', color: 'text-green-600' };
    if (score >= 70) return { grade: 'B+', color: 'text-blue-500' };
    if (score >= 60) return { grade: 'B', color: 'text-blue-600' };
    if (score >= 50) return { grade: 'C+', color: 'text-yellow-500' };
    if (score >= 40) return { grade: 'C', color: 'text-yellow-600' };
    return { grade: 'D', color: 'text-red-500' };
  };

  // Preload components for better performance
  useEffect(() => {
    preloadComponents([
      { importFn: () => import('@/components/optimized/PerformanceMonitor'), name: 'PerformanceMonitor', priority: 'high' },
      { importFn: () => import('@/components/optimized/AdvancedLazyLoader'), name: 'AdvancedLazyLoader', priority: 'medium' }
    ]);
  }, [preloadComponents]);

  const { grade, color } = getPerformanceGrade(overallScore);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('performanceTest.title')}</h1>
          <p className="text-muted-foreground">
            {t('performanceTest.subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={runAllTests}
            disabled={isRunningAll}
            className="flex items-center gap-2"
          >
            {isRunningAll ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {isRunningAll ? t('performanceTest.running') : t('performanceTest.runAll')}
          </Button>
          <Button
            variant="outline"
            onClick={resetTests}
            className="flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            {t('performanceTest.reset')}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="tests" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tests">{t('performanceTest.tabs.tests')}</TabsTrigger>
          <TabsTrigger value="monitor">{t('performanceTest.tabs.monitor')}</TabsTrigger>
          <TabsTrigger value="optimizations">{t('performanceTest.tabs.optimizations')}</TabsTrigger>
        </TabsList>

        <TabsContent value="tests" className="space-y-6">
          {/* Overall Score */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                {t('performanceTest.overallScore')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-center">
                  <div className={`text-6xl font-bold ${color}`}>{grade}</div>
                  <div className="text-2xl font-semibold">{overallScore}/100</div>
                  <div className="text-muted-foreground">{t('performanceTest.scoreLabel')}</div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm">{t('performanceTest.score.excellent')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-sm">{t('performanceTest.score.good')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm">{t('performanceTest.score.average')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-sm">{t('performanceTest.score.poor')}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Performance Tests */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tests.map((test, index) => (
              <Card key={test.name} className="relative">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {test.icon}
                      <span className="text-sm">{test.name}</span>
                    </div>
                    <Badge variant={getTestStatusColor(test.status)}>
                      {getTestStatusIcon(test.status)}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    {test.description}
                  </p>
                  
                  {test.result !== undefined && (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">{t('performanceTest.result')}</span>
                        <span className="font-semibold">
                          {test.result.toFixed(1)} {test.unit}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">{t('performanceTest.max')}</span>
                        <span className="text-muted-foreground">
                          {test.threshold} {test.unit}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            test.result <= test.threshold ? 'bg-green-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${Math.min((test.result / test.threshold) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                  
                  <Button
                    onClick={() => runSingleTest(index)}
                    disabled={test.status === 'running' || isRunningAll}
                    variant="outline"
                    size="sm"
                    className="w-full mt-4"
                  >
                    {test.status === 'running' ? t('performanceTest.runningShort') : t('performanceTest.run')}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="monitor" className="space-y-6">
          <AdvancedLazyLoader
            type="card"
            message={t('performanceTest.monitorLoading')}
            priority="high"
          >
            <PerformanceMonitor
              componentName="PerformanceTestPage"
              enableLogging={true}
              threshold={16}
            >
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      {t('performanceTest.monitorTitle')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      {t('performanceTest.monitorDescription')}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </PerformanceMonitor>
          </AdvancedLazyLoader>
        </TabsContent>

        <TabsContent value="optimizations" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Lazy Loading Optimizations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  {t('performanceTest.lazyLoadingOptimization')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-semibold">{t('performanceTest.featuresTitle')}</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• {t('performanceTest.bulletPreloading')}</li>
                    <li>• {t('performanceTest.bulletIntersection')}</li>
                    <li>• {t('performanceTest.bulletHover')}</li>
                    <li>• {t('performanceTest.bulletProgress')}</li>
                    <li>• {t('performanceTest.bulletQueue')}</li>
                  </ul>
                </div>
                <Separator />
                <div className="space-y-2">
                  <h4 className="font-semibold">{t('performanceTest.benefitsTitle')}</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• {t('performanceTest.benefitLoadTime')}</li>
                    <li>• {t('performanceTest.benefitMemory')}</li>
                    <li>• {t('performanceTest.benefitUX')}</li>
                    <li>• {t('performanceTest.benefitSEO')}</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Code Splitting Optimizations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  {t('performanceTest.codeSplitting')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-semibold">{t('performanceTest.splitStrategies')}</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• {t('performanceTest.vendorChunks')}</li>
                    <li>• {t('performanceTest.featureChunks')}</li>
                    <li>• {t('performanceTest.routeSplitting')}</li>
                    <li>• {t('performanceTest.componentSplitting')}</li>
                    <li>• {t('performanceTest.dynamicImports')}</li>
                  </ul>
                </div>
                <Separator />
                <div className="space-y-2">
                  <h4 className="font-semibold">{t('performanceTest.improvementsTitle')}</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• {t('performanceTest.reduceInitialBundle')}</li>
                    <li>• {t('performanceTest.improveCaching')}</li>
                    <li>• {t('performanceTest.improveNetwork')}</li>
                    <li>• {t('performanceTest.improveLoading')}</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Bundle Size Optimizations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HardDrive className="h-5 w-5" />
                  {t('performanceTest.bundleSize')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-semibold">{t('performanceTest.compressionTechniques')}</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• {t('performanceTest.treeShaking')}</li>
                    <li>• {t('performanceTest.deadCode')}</li>
                    <li>• {t('performanceTest.minification')}</li>
                    <li>• {t('performanceTest.compressionOpt')}</li>
                    <li>• {t('performanceTest.assetOpt')}</li>
                  </ul>
                </div>
                <Separator />
                <div className="space-y-2">
                  <h4 className="font-semibold">{t('performanceTest.expectedResults')}</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• {t('performanceTest.resultSizeReduction')}</li>
                    <li>• {t('performanceTest.resultLoadTime')}</li>
                    <li>• {t('performanceTest.resultDataUsage')}</li>
                    <li>• {t('performanceTest.resultCoreWebVitals')}</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Performance Monitoring */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  {t('performanceTest.performanceMonitoring')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-semibold">{t('performanceTest.metricsTitle')}</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Bundle size monitoring</li>
                    <li>• Load time tracking</li>
                    <li>• Memory usage analysis</li>
                    <li>• Network requests count</li>
                    <li>• FPS monitoring</li>
                  </ul>
                </div>
                <Separator />
                <div className="space-y-2">
                  <h4 className="font-semibold">{t('performanceTest.featuresTitleShort')}</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Real-time monitoring</li>
                    <li>• Performance alerts</li>
                    <li>• Historical data</li>
                    <li>• Optimization suggestions</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PerformanceTestPage;
