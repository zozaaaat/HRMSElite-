import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Rocket,
  Download,
  Package,
  Server,
  Database,
  Shield,
  CheckCircle,
  AlertTriangle,
  Clock,
  Settings,
  FileDown,
  Monitor,
  Zap
} from "lucide-react";

interface DeploymentStep {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  required: boolean;
}

interface DeploymentConfig {
  environment: 'development' | 'staging' | 'production';
  platform: 'replit' | 'standalone' | 'docker';
  features: string[];
  security: boolean;
  database: boolean;
}

export default function DeploymentAssistant() {
  const [deploymentSteps, setDeploymentSteps] = useState<DeploymentStep[]>([
    {
      id: '1',
      name: 'فحص التبعيات',
      description: 'التحقق من وجود جميع المكتبات المطلوبة',
      status: 'completed',
      progress: 100,
      required: true
    },
    {
      id: '2',
      name: 'بناء المشروع',
      description: 'تجميع ملفات React و TypeScript',
      status: 'completed',
      progress: 100,
      required: true
    },
    {
      id: '3',
      name: 'تحسين الأمان',
      description: 'تطبيق إعدادات الأمان المتقدمة',
      status: 'completed',
      progress: 100,
      required: true
    },
    {
      id: '4',
      name: 'اختبار APIs',
      description: 'التحقق من عمل جميع نقاط النهاية',
      status: 'completed',
      progress: 100,
      required: true
    },
    {
      id: '5',
      name: 'تحضير قاعدة البيانات',
      description: 'إعداد بيانات الإنتاج',
      status: 'running',
      progress: 75,
      required: true
    },
    {
      id: '6',
      name: 'إنشاء النسخة القابلة للتنفيذ',
      description: 'تحويل النظام إلى ملف .exe',
      status: 'pending',
      progress: 0,
      required: false
    }
  ]);

  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentConfig, setDeploymentConfig] = useState<DeploymentConfig>({
    environment: 'production',
    platform: 'replit',
    features: ['security', 'analytics', 'monitoring'],
    security: true,
    database: true
  });

  const startDeployment = async () => {
    setIsDeploying(true);
    
    const pendingSteps = deploymentSteps.filter(step => step.status === 'pending');
    
    for (const step of pendingSteps) {
      // Update step to running
      setDeploymentSteps(prev => prev.map(s => 
        s.id === step.id ? { ...s, status: 'running', progress: 0 } : s
      ));

      // Simulate step progress
      for (let progress = 0; progress <= 100; progress += 20) {
        await new Promise(resolve => setTimeout(resolve, 500));
        setDeploymentSteps(prev => prev.map(s => 
          s.id === step.id ? { ...s, progress } : s
        ));
      }

      // Mark step as completed
      setDeploymentSteps(prev => prev.map(s => 
        s.id === step.id ? { ...s, status: 'completed', progress: 100 } : s
      ));
    }
    
    setIsDeploying(false);
  };

  const createExecutable = async () => {
    setDeploymentSteps(prev => prev.map(s => 
      s.id === '6' ? { ...s, status: 'running', progress: 0 } : s
    ));

    // Simulate executable creation
    for (let progress = 0; progress <= 100; progress += 10) {
      await new Promise(resolve => setTimeout(resolve, 300));
      setDeploymentSteps(prev => prev.map(s => 
        s.id === '6' ? { ...s, progress } : s
      ));
    }

    setDeploymentSteps(prev => prev.map(s => 
      s.id === '6' ? { ...s, status: 'completed', progress: 100 } : s
    ));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'running': return <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>;
      case 'failed': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'running': return 'text-blue-600 bg-blue-100';
      case 'failed': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const completedSteps = deploymentSteps.filter(s => s.status === 'completed').length;
  const totalSteps = deploymentSteps.length;
  const overallProgress = (completedSteps / totalSteps) * 100;

  return (
    <div className="space-y-6" dir="rtl">
      {/* نظرة عامة على النشر */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Rocket className="h-5 w-5 text-purple-600" />
            مساعد النشر
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold mb-2 text-purple-600">
                {overallProgress.toFixed(0)}%
              </div>
              <div className="text-sm text-gray-600">جاهزية النشر</div>
              <Progress value={overallProgress} className="mt-2" />
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold mb-2 text-green-600">
                {completedSteps}/{totalSteps}
              </div>
              <div className="text-sm text-gray-600">الخطوات المكتملة</div>
            </div>
            
            <div className="text-center">
              <div className="text-xl font-bold mb-2 text-blue-600">
                {deploymentConfig.environment}
              </div>
              <div className="text-sm text-gray-600">البيئة المستهدفة</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* خطوات النشر */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-blue-500" />
              خطوات النشر
            </CardTitle>
            <Button 
              onClick={startDeployment}
              disabled={isDeploying || overallProgress === 100}
              className="flex items-center gap-2"
            >
              {isDeploying ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  جاري النشر...
                </>
              ) : (
                <>
                  <Rocket className="h-4 w-4" />
                  بدء النشر
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {deploymentSteps.map((step) => (
              <div key={step.id} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-start gap-3">
                    {getStatusIcon(step.status)}
                    <div>
                      <h4 className="font-medium">{step.name}</h4>
                      <p className="text-sm text-gray-600">{step.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {step.required && (
                      <Badge variant="outline" className="text-xs">
                        مطلوب
                      </Badge>
                    )}
                    <Badge className={getStatusColor(step.status)}>
                      {step.status === 'completed' ? 'مكتمل' :
                       step.status === 'running' ? 'قيد التشغيل' :
                       step.status === 'failed' ? 'فشل' : 'في الانتظار'}
                    </Badge>
                  </div>
                </div>
                
                {(step.status === 'running' || step.status === 'completed') && (
                  <div className="mt-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span>التقدم</span>
                      <span>{step.progress}%</span>
                    </div>
                    <Progress value={step.progress} className="h-2" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* إعدادات النشر */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5 text-green-500" />
              إعدادات النشر
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">البيئة</label>
              <div className="grid grid-cols-3 gap-2">
                {['development', 'staging', 'production'].map(env => (
                  <Button
                    key={env}
                    variant={deploymentConfig.environment === env ? "default" : "outline"}
                    size="sm"
                    onClick={() => setDeploymentConfig(prev => ({ ...prev, environment: env as any }))}
                  >
                    {env === 'development' ? 'تطوير' :
                     env === 'staging' ? 'اختبار' : 'إنتاج'}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">المنصة</label>
              <div className="grid grid-cols-3 gap-2">
                {['replit', 'standalone', 'docker'].map(platform => (
                  <Button
                    key={platform}
                    variant={deploymentConfig.platform === platform ? "default" : "outline"}
                    size="sm"
                    onClick={() => setDeploymentConfig(prev => ({ ...prev, platform: platform as any }))}
                  >
                    {platform === 'replit' ? 'Replit' :
                     platform === 'standalone' ? 'مستقل' : 'Docker'}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">الميزات المفعلة</label>
              {[
                { key: 'security', label: 'الأمان المتقدم', icon: Shield },
                { key: 'analytics', label: 'التحليلات', icon: Monitor },
                { key: 'monitoring', label: 'المراقبة', icon: Zap }
              ].map(feature => {
                const Icon = feature.icon;
                return (
                  <div key={feature.key} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={deploymentConfig.features.includes(feature.key)}
                      onChange={(e) => {
                        setDeploymentConfig(prev => ({
                          ...prev,
                          features: e.target.checked 
                            ? [...prev.features, feature.key]
                            : prev.features.filter(f => f !== feature.key)
                        }));
                      }}
                      className="rounded border-gray-300"
                    />
                    <Icon className="h-4 w-4" />
                    <span className="text-sm">{feature.label}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-orange-500" />
              النسخة القابلة للتنفيذ
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center p-6 border-2 border-dashed rounded-lg">
              <FileDown className="h-8 w-8 mx-auto mb-3 text-gray-400" />
              <h3 className="font-medium mb-2">إنشاء نسخة .exe</h3>
              <p className="text-sm text-gray-600 mb-4">
                قم بإنشاء ملف تنفيذي مستقل يعمل على Windows
              </p>
              <Button 
                onClick={createExecutable}
                disabled={deploymentSteps.find(s => s.id === '6')?.status === 'running'}
                className="w-full"
              >
                {deploymentSteps.find(s => s.id === '6')?.status === 'running' ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-2"></div>
                    جاري الإنشاء...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 ml-2" />
                    إنشاء EXE
                  </>
                )}
              </Button>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">ملفات التحميل المتاحة:</h4>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <FileDown className="h-4 w-4 ml-2" />
                  ZeylabHRMS-Setup.exe (15.2 MB)
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <FileDown className="h-4 w-4 ml-2" />
                  ZeylabHRMS-Portable.zip (8.5 MB)
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <FileDown className="h-4 w-4 ml-2" />
                  SourceCode.zip (2.1 MB)
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* معلومات النشر */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-cyan-500" />
            معلومات النشر
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="font-medium">الإصدار:</span>
              <p className="text-gray-600">v2.1.0</p>
            </div>
            <div>
              <span className="font-medium">تاريخ البناء:</span>
              <p className="text-gray-600">{new Date().toLocaleDateString('ar-SA')}</p>
            </div>
            <div>
              <span className="font-medium">حجم المشروع:</span>
              <p className="text-gray-600">12.8 MB</p>
            </div>
            <div>
              <span className="font-medium">Node.js:</span>
              <p className="text-gray-600">v18.17.0</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}