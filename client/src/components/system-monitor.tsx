import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Activity,
  Server,
  Database,
  HardDrive,
  Cpu,
  MemoryStick,
  Wifi,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  RefreshCw
} from "lucide-react";

interface SystemMetric {
  name: string;
  value: number;
  max: number;
  unit: string;
  status: 'healthy' | 'warning' | 'critical';
  icon: React.ComponentType<any>;
  color: string;
  description: string;
}

interface SystemAlert {
  id: string;
  type: 'info' | 'warning' | 'error';
  message: string;
  timestamp: Date;
  resolved: boolean;
}

export default function SystemMonitor() {
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [systemMetrics, setSystemMetrics] = useState<SystemMetric[]>([
    {
      name: 'استخدام المعالج',
      value: 23,
      max: 100,
      unit: '%',
      status: 'healthy',
      icon: Cpu,
      color: 'text-blue-500',
      description: 'استخدام المعالج الحالي'
    },
    {
      name: 'استخدام الذاكرة',
      value: 58,
      max: 100,
      unit: '%',
      status: 'healthy',
      icon: MemoryStick,
      color: 'text-green-500',
      description: 'استخدام ذاكرة النظام'
    },
    {
      name: 'مساحة التخزين',
      value: 34,
      max: 100,
      unit: '%',
      status: 'healthy',
      icon: HardDrive,
      color: 'text-purple-500',
      description: 'مساحة القرص المستخدمة'
    },
    {
      name: 'اتصال قاعدة البيانات',
      value: 12,
      max: 50,
      unit: 'ms',
      status: 'healthy',
      icon: Database,
      color: 'text-orange-500',
      description: 'زمن الاستجابة لقاعدة البيانات'
    },
    {
      name: 'سرعة الشبكة',
      value: 95,
      max: 100,
      unit: '%',
      status: 'healthy',
      icon: Wifi,
      color: 'text-cyan-500',
      description: 'كفاءة الشبكة'
    },
    {
      name: 'مستوى الأمان',
      value: 98,
      max: 100,
      unit: '%',
      status: 'healthy',
      icon: Shield,
      color: 'text-red-500',
      description: 'نقاط الأمان المفعلة'
    }
  ]);

  const [systemAlerts, setSystemAlerts] = useState<SystemAlert[]>([
    {
      id: '1',
      type: 'info',
      message: 'تم بدء تشغيل النظام بنجاح',
      timestamp: new Date(Date.now() - 10000),
      resolved: true
    },
    {
      id: '2',
      type: 'warning',
      message: 'استخدام الذاكرة يقترب من الحد الأقصى',
      timestamp: new Date(Date.now() - 300000),
      resolved: false
    },
    {
      id: '3',
      type: 'info',
      message: 'تم تحديث قاعدة البيانات بنجاح',
      timestamp: new Date(Date.now() - 600000),
      resolved: true
    }
  ]);

  useEffect(() => {
    if (!isMonitoring) return;

    const interval = setInterval(() => {
      // Simulate real-time metrics updates
      setSystemMetrics(prev => prev.map(metric => {
        let newValue = metric.value + (Math.random() - 0.5) * 10;
        
        // Keep values within reasonable bounds
        if (metric.name === 'اتصال قاعدة البيانات') {
          newValue = Math.max(5, Math.min(50, newValue));
        } else if (metric.name === 'سرعة الشبكة' || metric.name === 'مستوى الأمان') {
          newValue = Math.max(80, Math.min(100, newValue));
        } else {
          newValue = Math.max(0, Math.min(100, newValue));
        }

        // Determine status based on value
        let status: 'healthy' | 'warning' | 'critical' = 'healthy';
        if (metric.name === 'اتصال قاعدة البيانات') {
          status = newValue > 30 ? 'critical' : newValue > 20 ? 'warning' : 'healthy';
        } else {
          status = newValue > 80 ? 'warning' : newValue > 95 ? 'critical' : 'healthy';
        }

        return { ...metric, value: newValue, status };
      }));

      setLastUpdate(new Date());
    }, 3000);

    return () => clearInterval(interval);
  }, [isMonitoring]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'info': return <CheckCircle className="h-4 w-4 text-blue-500" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const refreshMetrics = () => {
    setSystemMetrics(prev => prev.map(metric => ({
      ...metric,
      value: Math.random() * (metric.max * 0.8),
      status: 'healthy'
    })));
    setLastUpdate(new Date());
  };

  const resolveAlert = (alertId: string) => {
    setSystemAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, resolved: true } : alert
    ));
  };

  const overallHealth = systemMetrics.filter(m => m.status === 'healthy').length / systemMetrics.length * 100;

  return (
    <div className="space-y-6" dir="rtl">
      {/* نظرة عامة على حالة النظام */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5 text-blue-600" />
              مراقب النظام
              {isMonitoring && (
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              )}
            </CardTitle>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">
                آخر تحديث: {lastUpdate.toLocaleTimeString('ar-SA')}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={refreshMetrics}
              >
                <RefreshCw className="h-4 w-4 ml-2" />
                تحديث
              </Button>
              <Button
                variant={isMonitoring ? "default" : "outline"}
                size="sm"
                onClick={() => setIsMonitoring(!isMonitoring)}
              >
                <Activity className="h-4 w-4 ml-2" />
                {isMonitoring ? 'إيقاف المراقبة' : 'بدء المراقبة'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold mb-2 text-green-600">
                {overallHealth.toFixed(0)}%
              </div>
              <div className="text-sm text-gray-600">صحة النظام العامة</div>
              <Progress value={overallHealth} className="mt-2" />
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold mb-2 text-blue-600">
                {systemAlerts.filter(a => !a.resolved).length}
              </div>
              <div className="text-sm text-gray-600">تنبيهات نشطة</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold mb-2 text-purple-600">
                {Math.floor(Math.random() * 24) + 1}h
              </div>
              <div className="text-sm text-gray-600">مدة التشغيل</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* مؤشرات النظام */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-green-500" />
            مؤشرات الأداء
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {systemMetrics.map((metric, index) => {
              const Icon = metric.icon;
              const progressValue = metric.name === 'اتصال قاعدة البيانات' 
                ? ((50 - metric.value) / 50) * 100 
                : (metric.value / metric.max) * 100;
              
              return (
                <div key={index} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Icon className={`h-5 w-5 ${metric.color}`} />
                      <span className="font-medium">{metric.name}</span>
                    </div>
                    <Badge className={getStatusColor(metric.status)}>
                      {metric.status === 'healthy' ? 'طبيعي' :
                       metric.status === 'warning' ? 'تحذير' : 'حرج'}
                    </Badge>
                  </div>
                  
                  <div className="text-2xl font-bold mb-1">
                    {metric.value.toFixed(1)} {metric.unit}
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3">
                    {metric.description}
                  </p>
                  
                  <Progress value={progressValue} className="h-2" />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* التنبيهات */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            تنبيهات النظام
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {systemAlerts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>لا توجد تنبيهات حالياً</p>
              </div>
            ) : (
              systemAlerts.map((alert) => (
                <div 
                  key={alert.id} 
                  className={`p-3 border rounded-lg flex items-start gap-3 ${
                    alert.resolved ? 'opacity-60' : ''
                  }`}
                >
                  {getAlertIcon(alert.type)}
                  <div className="flex-1">
                    <p className="font-medium">{alert.message}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-gray-500">
                        {alert.timestamp.toLocaleString('ar-SA')}
                      </span>
                      {!alert.resolved && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => resolveAlert(alert.id)}
                        >
                          <CheckCircle className="h-3 w-3 ml-1" />
                          حل
                        </Button>
                      )}
                    </div>
                  </div>
                  {alert.resolved && (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}