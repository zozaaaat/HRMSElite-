import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Workflow, 
  Play, 
  Pause, 
  Settings, 
  Plus,
  ArrowRight,
  Clock,
  CheckCircle,
  AlertCircle,
  Users,
  FileText,
  Mail,
  Calendar
} from "lucide-react";

interface WorkflowBuilderProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WorkflowBuilder({ isOpen, onClose }: WorkflowBuilderProps) {
  const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(null);

  const workflows = [
    {
      id: '1',
      name: 'عملية التوظيف الجديد',
      description: 'سير عمل متكامل لتوظيف الموظفين الجدد',
      status: 'active',
      steps: 6,
      completedRuns: 24,
      icon: Users,
      category: 'hr'
    },
    {
      id: '2',
      name: 'طلب الإجازات',
      description: 'معالجة طلبات الإجازات وإقرارها',
      status: 'active',
      steps: 4,
      completedRuns: 156,
      icon: Calendar,
      category: 'leave'
    },
    {
      id: '3',
      name: 'تقييم الأداء السنوي',
      description: 'عملية التقييم السنوي للموظفين',
      status: 'draft',
      steps: 8,
      completedRuns: 0,
      icon: FileText,
      category: 'performance'
    },
    {
      id: '4',
      name: 'إشعارات الانتهاء',
      description: 'تنبيهات للعقود والتراخيص المنتهية',
      status: 'active',
      steps: 3,
      completedRuns: 12,
      icon: Mail,
      category: 'notifications'
    }
  ];

  const workflowSteps = [
    {
      id: 1,
      title: 'استلام الطلب',
      description: 'تلقي طلب التوظيف من المدير',
      status: 'completed',
      icon: FileText
    },
    {
      id: 2,
      title: 'مراجعة أولية',
      description: 'فحص المتطلبات والميزانية',
      status: 'completed',
      icon: CheckCircle
    },
    {
      id: 3,
      title: 'نشر الإعلان',
      description: 'إعداد ونشر إعلان الوظيفة',
      status: 'in-progress',
      icon: Mail
    },
    {
      id: 4,
      title: 'فرز الطلبات',
      description: 'مراجعة وفرز طلبات المتقدمين',
      status: 'pending',
      icon: Users
    },
    {
      id: 5,
      title: 'المقابلات',
      description: 'إجراء المقابلات والاختبارات',
      status: 'pending',
      icon: Calendar
    },
    {
      id: 6,
      title: 'الموافقة النهائية',
      description: 'اتخاذ القرار النهائي للتوظيف',
      status: 'pending',
      icon: CheckCircle
    }
  ];

  const templates = [
    {
      id: 't1',
      name: 'سير عمل بسيط',
      description: 'خطوتين مع موافقة واحدة',
      steps: 2,
      category: 'basic'
    },
    {
      id: 't2',
      name: 'سير عمل متقدم',
      description: 'عدة خطوات مع موافقات متعددة',
      steps: 5,
      category: 'advanced'
    },
    {
      id: 't3',
      name: 'سير عمل تشعبي',
      description: 'مسارات متعددة حسب الشروط',
      steps: 7,
      category: 'conditional'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'draft': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      case 'paused': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getStepStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in-progress': return 'bg-blue-500';
      case 'pending': return 'bg-gray-300';
      default: return 'bg-gray-300';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl h-[700px] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Workflow className="h-5 w-5 text-primary" />
            منشئ سير العمل الذكي
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="workflows" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="workflows">سير العمل</TabsTrigger>
            <TabsTrigger value="builder">المنشئ</TabsTrigger>
            <TabsTrigger value="templates">القوالب</TabsTrigger>
          </TabsList>

          <TabsContent value="workflows" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">سير العمل الحالي</h3>
              <Button onClick={() => console.log('إنشاء سير عمل جديد')}>
                <Plus className="h-4 w-4 ml-2" />
                إنشاء جديد
              </Button>
            </div>

            <div className="grid gap-4">
              {workflows.map((workflow) => (
                <Card key={workflow.id} className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => setSelectedWorkflow(workflow.id)}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary/10 rounded-lg">
                          <workflow.icon className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-semibold">{workflow.name}</h4>
                          <p className="text-sm text-muted-foreground">{workflow.description}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge className={getStatusColor(workflow.status)}>
                              {workflow.status === 'active' ? 'نشط' : 
                               workflow.status === 'draft' ? 'مسودة' : 'متوقف'}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {workflow.steps} خطوات • {workflow.completedRuns} تشغيل مكتمل
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={(e) => {e.stopPropagation(); console.log('إعدادات سير العمل:', workflow.name);}}>
                          <Settings className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={(e) => {e.stopPropagation(); console.log(workflow.status === 'active' ? 'إيقاف سير العمل:' : 'تشغيل سير العمل:', workflow.name);}}>
                          {workflow.status === 'active' ? 
                            <Pause className="h-4 w-4" /> : 
                            <Play className="h-4 w-4" />
                          }
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {selectedWorkflow && (
              <Card>
                <CardHeader>
                  <CardTitle>تفاصيل سير العمل: عملية التوظيف الجديد</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {workflowSteps.map((step, index) => (
                      <div key={step.id} className="flex items-center gap-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getStepStatusColor(step.status)}`}>
                          <step.icon className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <h5 className="font-medium">{step.title}</h5>
                          <p className="text-sm text-muted-foreground">{step.description}</p>
                        </div>
                        {index < workflowSteps.length - 1 && (
                          <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="builder" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>منشئ سير العمل المرئي</CardTitle>
                <p className="text-sm text-muted-foreground">
                  اسحب وأفلت المكونات لإنشاء سير عمل مخصص
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-96">
                  {/* Toolbox */}
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-4">صندوق الأدوات</h4>
                    <div className="space-y-2">
                      <div className="p-3 border rounded-lg cursor-pointer hover:bg-muted">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4" />
                          <span className="text-sm">خطوة موافقة</span>
                        </div>
                      </div>
                      <div className="p-3 border rounded-lg cursor-pointer hover:bg-muted">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          <span className="text-sm">إرسال إشعار</span>
                        </div>
                      </div>
                      <div className="p-3 border rounded-lg cursor-pointer hover:bg-muted">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span className="text-sm">انتظار مؤقت</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Canvas */}
                  <div className="lg:col-span-3 border-2 border-dashed rounded-lg p-6 flex items-center justify-center bg-muted/20">
                    <div className="text-center">
                      <Workflow className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">اسحب المكونات هنا لبناء سير العمل</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((template) => (
                <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-6 text-center">
                    <Workflow className="h-12 w-12 text-primary mx-auto mb-4" />
                    <h4 className="font-semibold mb-2">{template.name}</h4>
                    <p className="text-sm text-muted-foreground mb-4">{template.description}</p>
                    <Badge variant="outline">{template.steps} خطوات</Badge>
                    <Button className="w-full mt-4" variant="outline" onClick={() => console.log('استخدام قالب:', template.name)}>
                      استخدام القالب
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}