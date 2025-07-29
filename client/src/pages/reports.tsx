import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PDFReports } from "@/components/pdf-reports";
import { DocumentManagement } from "@/components/document-management";
import { RoleBasedDashboard } from "@/components/role-based-dashboard";
import {
  FileText,
  FolderOpen,
  BarChart3,
  Download,
  Upload,
  Eye
} from "lucide-react";

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState("reports");
  
  // محاكاة دور المستخدم - في التطبيق الفعلي سيأتي من السياق
  const userRole = 'company-manager'; // أو أي دور آخر
  const companyId = 'company-1';
  const userId = 'user-1';

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* العنوان */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">التقارير والمستندات</h1>
        <p className="text-muted-foreground mt-2">
          إدارة شاملة للتقارير والمستندات ولوحات التحكم المتخصصة
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            تقارير PDF
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex items-center gap-2">
            <FolderOpen className="h-4 w-4" />
            إدارة المستندات
          </TabsTrigger>
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            لوحة التحكم
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            التحليلات
          </TabsTrigger>
        </TabsList>

        <TabsContent value="reports" className="space-y-6">
          <PDFReports companyId={companyId} />
        </TabsContent>

        <TabsContent value="documents" className="space-y-6">
          <DocumentManagement companyId={companyId} />
        </TabsContent>

        <TabsContent value="dashboard" className="space-y-6">
          <RoleBasedDashboard 
            userRole={userRole as any}
            companyId={companyId}
            userId={userId}
          />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* إحصائيات التقارير */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  التقارير الأكثر تحميلاً
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { name: 'قائمة الموظفين', downloads: 45 },
                    { name: 'كشف المرتبات', downloads: 38 },
                    { name: 'تقرير الحضور', downloads: 32 },
                    { name: 'التقرير المالي', downloads: 28 },
                  ].map((report, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm">{report.name}</span>
                      <span className="text-sm font-medium">{report.downloads} مرة</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* أنواع المستندات */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  أنواع المستندات المرفوعة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { type: 'وثائق الموظفين', count: 156 },
                    { type: 'العقود', count: 89 },
                    { type: 'التراخيص', count: 45 },
                    { type: 'النماذج الحكومية', count: 34 },
                  ].map((doc, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm">{doc.type}</span>
                      <span className="text-sm font-medium">{doc.count} مستند</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* استخدام النظام */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  نشاط النظام
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">1,234</p>
                    <p className="text-sm text-muted-foreground">إجمالي العمليات</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">89%</p>
                    <p className="text-sm text-muted-foreground">معدل النجاح</p>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <p className="text-2xl font-bold text-orange-600">456</p>
                    <p className="text-sm text-muted-foreground">المستخدمون النشطون</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* رسم بياني لاستخدام النظام */}
          <Card>
            <CardHeader>
              <CardTitle>استخدام النظام خلال الأسبوع</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-end justify-between gap-2 p-4">
                {['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'].map((day, index) => {
                  const height = Math.random() * 80 + 20;
                  return (
                    <div key={day} className="flex flex-col items-center gap-2">
                      <div 
                        className={`w-8 bg-primary rounded-t-sm transition-all hover:bg-primary/80`}
                        style={{ height: `${height}%` }}
                      />
                      <span className="text-xs text-muted-foreground">{day}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}