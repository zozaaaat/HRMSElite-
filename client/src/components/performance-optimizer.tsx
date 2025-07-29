import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Zap,
  Cpu,
  HardDrive,
  Wifi,
  Monitor,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  Activity
} from "lucide-react";

interface PerformanceMetric {
  name: string;
  value: number;
  target: number;
  unit: string;
  status: 'excellent' | 'good' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
  lastOptimized?: string;
}

interface OptimizationTask {
  id: string;
  name: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'easy' | 'medium' | 'hard';
  status: 'pending' | 'running' | 'completed';
  progress?: number;
}

export default function PerformanceOptimizer() {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationProgress, setOptimizationProgress] = useState(0);
  const [lastScan, setLastScan] = useState(new Date());
  
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([
    {
      name: 'سرعة التحميل',
      value: 2.3,
      target: 2.0,
      unit: 'ثانية',
      status: 'warning',
      trend: 'down',
      lastOptimized: '2025-07-28'
    },
    {
      name: 'استهلاك الذاكرة',
      value: 45,
      target: 60,
      unit: 'MB',
      status: 'excellent',
      trend: 'stable'
    },
    {
      name: 'معدل الاستجابة',
      value: 98.5,
      target: 95,
      unit: '%',
      status: 'excellent',
      trend: 'up'
    },
    {
      name: 'استهلاك المعالج',
      value: 23,
      target: 30,
      unit: '%',
      status: 'good',
      trend: 'stable'
    },
    {
      name: 'سرعة قاعدة البيانات',
      value: 150,
      target: 100,
      unit: 'ms',
      status: 'warning',
      trend: 'up'
    },
    {
      name: 'كفاءة الشبكة',
      value: 92,
      target: 90,
      unit: '%',
      status: 'good',
      trend: 'up'
    }
  ]);

  const [optimizationTasks, setOptimizationTasks] = useState<OptimizationTask[]>([
    {
      id: '1',
      name: 'ضغط الصور',
      description: 'تحسين وضغط الصور لتقليل وقت التحميل',
      impact: 'high',
      effort: 'easy',
      status: 'pending'
    },
    {
      id: '2',
      name: 'تحسين الاستعلامات',
      description: 'تحسين استعلامات قاعدة البيانات وإضافة فهارس',
      impact: 'high',
      effort: 'medium',
      status: 'pending'
    },
    {
      id: '3',
      name: 'تفعيل التخزين المؤقت',
      description: 'تفعيل نظام التخزين المؤقت للبيانات المستخدمة بكثرة',
      impact: 'medium',
      effort: 'medium',
      status: 'completed'
    },
    {
      id: '4',
      name: 'تحسين CSS و JS',
      description: 'ضغط وتحسين ملفات CSS و JavaScript',
      impact: 'medium',
      effort: 'easy',
      status: 'running',
      progress: 65
    },
    {
      id: '5',
      name: 'تحسين خادم البيانات',
      description: 'تحسين إعدادات الخادم وتوزيع الأحمال',
      impact: 'high',
      effort: 'hard',
      status: 'pending'
    }
  ]);

  const runOptimization = useCallback(async () => {
    setIsOptimizing(true);
    setOptimizationProgress(0);

    // Simulate optimization process
    const pendingTasks = optimizationTasks.filter(task => task.status === 'pending');
    
    for (let i = 0; i < pendingTasks.length; i++) {
      const task = pendingTasks[i];
      
      // Update task status to running
      setOptimizationTasks(prev => prev.map(t => 
        t.id === task.id ? { ...t, status: 'running', progress: 0 } : t
      ));

      // Simulate task progress
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise(resolve => setTimeout(resolve, 200));
        setOptimizationTasks(prev => prev.map(t => 
          t.id === task.id ? { ...t, progress } : t
        ));
        setOptimizationProgress(((i * 100) + progress) / (pendingTasks.length * 100) * 100);
      }

      // Mark task as completed
      setOptimizationTasks(prev => prev.map(t => 
        t.id === task.id ? { ...t, status: 'completed', progress: 100 } : t
      ));
    }

    // Update metrics after optimization
    setMetrics(prev => prev.map(metric => ({
      ...metric,
      value: Math.max(0, metric.value * (0.8 + Math.random() * 0.3)),
      status: Math.random() > 0.3 ? 'excellent' : metric.status,
      trend: Math.random() > 0.5 ? 'up' : 'stable',
      lastOptimized: new Date().toISOString().split('T')[0]
    })));

    setLastScan(new Date());
    setIsOptimizing(false);
    setOptimizationProgress(100);
  }, [optimizationTasks]);

  const scanPerformance = () => {
    setMetrics(prev => prev.map(metric => ({
      ...metric,
      value: metric.value * (0.9 + Math.random() * 0.2),
      trend: Math.random() > 0.5 ? 'up' : Math.random() > 0.5 ? 'down' : 'stable'
    })));
    setLastScan(new Date());
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600 bg-green-100';
      case 'good': return 'text-blue-600 bg-blue-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getEffortColor = (effort: string) => {
    switch (effort) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-500" />;
      default: return <Activity className="h-4 w-4 text-blue-500" />;
    }
  };

  const overallScore = Math.round(
    metrics.reduce((acc, metric) => {
      const score = metric.value <= metric.target ? 100 : 
                   Math.max(0, 100 - ((metric.value - metric.target) / metric.target) * 50);
      return acc + score;
    }, 0) / metrics.length
  );

  return (
    <div className="space-y-6" dir="rtl">
      {/* نظرة عامة على الأداء */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            محسن الأداء
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">{overallScore}%</div>
              <div className="text-sm text-gray-600">النتيجة الإجمالية</div>
              <Progress value={overallScore} className="mt-2" />
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold mb-2">
                {optimizationTasks.filter(t => t.status === 'completed').length}/
                {optimizationTasks.length}
              </div>
              <div className="text-sm text-gray-600">المهام المكتملة</div>
              <Progress 
                value={(optimizationTasks.filter(t => t.status === 'completed').length / optimizationTasks.length) * 100} 
                className="mt-2" 
              />
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold mb-2">
                {lastScan.toLocaleTimeString('ar-SA')}
              </div>
              <div className="text-sm text-gray-600">آخر فحص</div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={scanPerformance}
                className="mt-2"
              >
                <RefreshCw className="h-3 w-3 ml-1" />
                فحص جديد
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* مؤشرات الأداء */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5 text-blue-500" />
            مؤشرات الأداء
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {metrics.map((metric, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{metric.name}</span>
                  <div className="flex items-center gap-2">
                    {getTrendIcon(metric.trend)}
                    <Badge className={getStatusColor(metric.status)}>
                      {metric.status === 'excellent' ? 'ممتاز' :
                       metric.status === 'good' ? 'جيد' :
                       metric.status === 'warning' ? 'تحذير' : 'حرج'}
                    </Badge>
                  </div>
                </div>
                
                <div className="text-2xl font-bold mb-1">
                  {metric.value.toFixed(1)} {metric.unit}
                </div>
                
                <div className="text-sm text-gray-600 mb-2">
                  الهدف: {metric.target} {metric.unit}
                </div>
                
                <Progress 
                  value={metric.value <= metric.target ? 100 : Math.max(0, 100 - ((metric.value - metric.target) / metric.target) * 50)}
                  className="h-2"
                />
                
                {metric.lastOptimized && (
                  <div className="text-xs text-gray-500 mt-1">
                    آخر تحسين: {metric.lastOptimized}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* مهام التحسين */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Cpu className="h-5 w-5 text-purple-500" />
              مهام التحسين
            </CardTitle>
            <Button 
              onClick={runOptimization}
              disabled={isOptimizing}
              className="flex items-center gap-2"
            >
              {isOptimizing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  جاري التحسين...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4" />
                  تشغيل التحسين
                </>
              )}
            </Button>
          </div>
          {isOptimizing && (
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-2">
                <span>التقدم الإجمالي</span>
                <span>{optimizationProgress.toFixed(0)}%</span>
              </div>
              <Progress value={optimizationProgress} />
            </div>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {optimizationTasks.map((task) => (
              <div key={task.id} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-medium">{task.name}</h4>
                    <p className="text-sm text-gray-600">{task.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getImpactColor(task.impact)}>
                      {task.impact === 'high' ? 'تأثير عالي' :
                       task.impact === 'medium' ? 'تأثير متوسط' : 'تأثير منخفض'}
                    </Badge>
                    <Badge className={getEffortColor(task.effort)}>
                      {task.effort === 'easy' ? 'سهل' :
                       task.effort === 'medium' ? 'متوسط' : 'صعب'}
                    </Badge>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {task.status === 'completed' ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : task.status === 'running' ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                    ) : (
                      <Clock className="h-4 w-4 text-gray-400" />
                    )}
                    <span className="text-sm">
                      {task.status === 'completed' ? 'مكتمل' :
                       task.status === 'running' ? 'قيد التشغيل' : 'في الانتظار'}
                    </span>
                  </div>
                  
                  {task.status === 'running' && task.progress !== undefined && (
                    <div className="flex items-center gap-2 flex-1 max-w-xs">
                      <Progress value={task.progress} className="flex-1" />
                      <span className="text-sm">{task.progress}%</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}