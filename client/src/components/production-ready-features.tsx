import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Search,
  Filter,
  Download,
  Upload,
  Settings,
  Bell,
  Shield,
  Database,
  BarChart3,
  Users,
  FileText,
  Calendar,
  Clock,
  CheckCircle
} from "lucide-react";

interface ProductionFeature {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'maintenance' | 'planned';
  priority: 'critical' | 'high' | 'medium' | 'low';
  lastUpdate: string;
  icon: React.ReactNode;
}

export default function ProductionReadyFeatures() {
  const [searchQuery, setSearchQuery] = useState('');
  
  const features: ProductionFeature[] = [
    {
      id: '1',
      name: 'نظام البحث المتقدم',
      description: 'بحث ذكي في جميع البيانات مع فلاتر متقدمة',
      status: 'active',
      priority: 'high',
      lastUpdate: '2025-07-29',
      icon: <Search className="h-4 w-4" />
    },
    {
      id: '2',
      name: 'تصدير التقارير',
      description: 'تصدير جميع التقارير بصيغ PDF و Excel',
      status: 'active',
      priority: 'critical',
      lastUpdate: '2025-07-29',
      icon: <Download className="h-4 w-4" />
    },
    {
      id: '3',
      name: 'رفع الملفات المتقدم',
      description: 'رفع ملفات متعددة مع معاينة وضغط تلقائي',
      status: 'active',
      priority: 'high',
      lastUpdate: '2025-07-29',
      icon: <Upload className="h-4 w-4" />
    },
    {
      id: '4',
      name: 'نظام الأمان المتقدم',
      description: 'حماية متعددة الطبقات مع مراجعة أمنية',
      status: 'active',
      priority: 'critical',
      lastUpdate: '2025-07-29',
      icon: <Shield className="h-4 w-4" />
    },
    {
      id: '5',
      name: 'النسخ الاحتياطي التلقائي',
      description: 'نسخ احتياطية تلقائية كل 6 ساعات',
      status: 'active',
      priority: 'critical',
      lastUpdate: '2025-07-29',
      icon: <Database className="h-4 w-4" />
    },
    {
      id: '6',
      name: 'التحليلات الفورية',
      description: 'رسوم بيانية وتحليلات متجددة في الوقت الفعلي',
      status: 'active',
      priority: 'high',
      lastUpdate: '2025-07-29',
      icon: <BarChart3 className="h-4 w-4" />
    },
    {
      id: '7',
      name: 'إدارة الصلاحيات المتقدمة',
      description: 'تحكم دقيق في صلاحيات كل مستخدم',
      status: 'active',
      priority: 'high',
      lastUpdate: '2025-07-29',
      icon: <Users className="h-4 w-4" />
    },
    {
      id: '8',
      name: 'نظام الوثائق الذكي',
      description: 'تصنيف وأرشفة ذكية للمستندات',
      status: 'maintenance',
      priority: 'medium',
      lastUpdate: '2025-07-28',
      icon: <FileText className="h-4 w-4" />
    },
    {
      id: '9',
      name: 'تقويم الأحداث المتقدم',
      description: 'تقويم تفاعلي مع تذكيرات وإشعارات',
      status: 'active',
      priority: 'medium',
      lastUpdate: '2025-07-29',
      icon: <Calendar className="h-4 w-4" />
    },
    {
      id: '10',
      name: 'نظام الإشعارات الفوري',
      description: 'إشعارات فورية متعددة القنوات',
      status: 'active',
      priority: 'high',
      lastUpdate: '2025-07-29',
      icon: <Bell className="h-4 w-4" />
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'planned': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'low': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'فعال';
      case 'maintenance': return 'صيانة';
      case 'planned': return 'مخطط';
      default: return 'غير محدد';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'critical': return 'حرج';
      case 'high': return 'عالي';
      case 'medium': return 'متوسط';
      case 'low': return 'منخفض';
      default: return 'غير محدد';
    }
  };

  const filteredFeatures = features.filter(feature =>
    feature.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    feature.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeFeatures = features.filter(f => f.status === 'active').length;
  const criticalFeatures = features.filter(f => f.priority === 'critical').length;

  return (
    <div className="space-y-6" dir="rtl">
      {/* إحصائيات سريعة */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 dark:text-green-400">الميزات النشطة</p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">{activeFeatures}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600 dark:text-red-400">الميزات الحرجة</p>
                <p className="text-2xl font-bold text-red-900 dark:text-red-100">{criticalFeatures}</p>
              </div>
              <Shield className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">إجمالي الميزات</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{features.length}</p>
              </div>
              <Settings className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600 dark:text-purple-400">وقت التشغيل</p>
                <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">99.9%</p>
              </div>
              <Clock className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* شريط البحث والفلاتر */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="ابحث في الميزات..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10"
                />
              </div>
            </div>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 ml-2" />
              فلترة
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 ml-2" />
              تصدير
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* قائمة الميزات */}
      <Card>
        <CardHeader>
          <CardTitle>الميزات الإنتاجية المتقدمة</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredFeatures.map((feature) => (
              <div key={feature.id} className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                      {feature.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                        {feature.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                        {feature.description}
                      </p>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(feature.status)}>
                          {getStatusText(feature.status)}
                        </Badge>
                        <Badge className={getPriorityColor(feature.priority)}>
                          {getPriorityText(feature.priority)}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          آخر تحديث: {feature.lastUpdate}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}