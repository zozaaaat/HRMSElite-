import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Workflow, 
  Plus, 
  Trash2, 
  Settings, 
  Play,
  Pause,
  RotateCcw,
  ArrowRight,
  CheckCircle,
  Clock,
  AlertCircle,
  Users,
  FileText,
  Mail
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface WorkflowStep {
  id: string;
  name: string;
  type: 'approval' | 'notification' | 'form' | 'condition' | 'automation';
  config: any;
  position: { x: number; y: number };
  connections: string[];
}

interface WorkflowBuilderProps {
  companyId: string;
  workflowId?: string;
}

export function WorkflowBuilder({ companyId, workflowId }: WorkflowBuilderProps) {
  const queryClient = useQueryClient();
  const [selectedStep, setSelectedStep] = useState<string | null>(null);
  const [workflowName, setWorkflowName] = useState("");
  const [workflowDescription, setWorkflowDescription] = useState("");
  const [department, setDepartment] = useState("");
  const [steps, setSteps] = useState<WorkflowStep[]>([]);
  const [draggedStep, setDraggedStep] = useState<string | null>(null);

  const { data: workflow } = useQuery({
    queryKey: ['/api/workflows', workflowId],
    enabled: !!workflowId,
  });

  const { data: departments } = useQuery({
    queryKey: ['/api/departments', companyId],
  });

  const saveWorkflowMutation = useMutation({
    mutationFn: async (workflowData: any) => {
      if (workflowId) {
        return await apiRequest(`/api/workflows/${workflowId}`, {
          method: 'PUT',
          body: JSON.stringify(workflowData)
        });
      } else {
        return await apiRequest('/api/workflows', {
          method: 'POST',
          body: JSON.stringify({ ...workflowData, companyId })
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/workflows'] });
    }
  });

  const addStep = (type: WorkflowStep['type']) => {
    const newStep: WorkflowStep = {
      id: `step-${Date.now()}`,
      name: `${getStepTypeName(type)} جديد`,
      type,
      config: getDefaultConfig(type),
      position: { x: 100 + steps.length * 200, y: 100 },
      connections: []
    };
    setSteps([...steps, newStep]);
  };

  const updateStep = (stepId: string, updates: Partial<WorkflowStep>) => {
    setSteps(steps.map(step => 
      step.id === stepId ? { ...step, ...updates } : step
    ));
  };

  const deleteStep = (stepId: string) => {
    setSteps(steps.filter(step => step.id !== stepId));
    // Remove connections to deleted step
    setSteps(prev => prev.map(step => ({
      ...step,
      connections: step.connections.filter(conn => conn !== stepId)
    })));
  };

  const connectSteps = (fromId: string, toId: string) => {
    setSteps(steps.map(step => 
      step.id === fromId 
        ? { ...step, connections: [...step.connections, toId] }
        : step
    ));
  };

  const handleSaveWorkflow = () => {
    const workflowData = {
      name: workflowName,
      description: workflowDescription,
      department,
      steps: steps,
      rules: generateWorkflowRules(steps),
      triggers: generateWorkflowTriggers(steps)
    };
    saveWorkflowMutation.mutate(workflowData);
  };

  const getStepTypeName = (type: WorkflowStep['type']) => {
    const names = {
      approval: 'موافقة',
      notification: 'إشعار',
      form: 'نموذج',
      condition: 'شرط',
      automation: 'أتمتة'
    };
    return names[type];
  };

  const getDefaultConfig = (type: WorkflowStep['type']) => {
    const configs = {
      approval: { approvers: [], required: 1 },
      notification: { recipients: [], template: '' },
      form: { fields: [], required: true },
      condition: { rules: [], operator: 'AND' },
      automation: { action: '', parameters: {} }
    };
    return configs[type];
  };

  const generateWorkflowRules = (steps: WorkflowStep[]) => {
    return steps.map(step => ({
      stepId: step.id,
      conditions: step.type === 'condition' ? step.config.rules : [],
      actions: step.type === 'automation' ? [step.config] : []
    }));
  };

  const generateWorkflowTriggers = (steps: WorkflowStep[]) => {
    return {
      manual: true,
      automatic: steps.some(step => step.type === 'automation'),
      events: ['employee_request', 'form_submission', 'approval_required']
    };
  };

  const getStepIcon = (type: WorkflowStep['type']) => {
    const icons = {
      approval: CheckCircle,
      notification: Mail,
      form: FileText,
      condition: AlertCircle,
      automation: Settings
    };
    const Icon = icons[type];
    return <Icon className="h-4 w-4" />;
  };

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Workflow Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Workflow className="h-5 w-5" />
            بناء سير العمل
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">اسم سير العمل</label>
              <Input
                value={workflowName}
                onChange={(e) => setWorkflowName(e.target.value)}
                placeholder="مثال: موافقة طلب الإجازة"
              />
            </div>
            <div>
              <label className="text-sm font-medium">القسم</label>
              <Select value={department} onValueChange={setDepartment}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر القسم" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hr">الموارد البشرية</SelectItem>
                  <SelectItem value="finance">المالية</SelectItem>
                  <SelectItem value="it">تقنية المعلومات</SelectItem>
                  <SelectItem value="operations">العمليات</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button 
                onClick={handleSaveWorkflow}
                disabled={!workflowName || steps.length === 0}
                className="w-full"
              >
                حفظ سير العمل
              </Button>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">الوصف</label>
            <Textarea
              value={workflowDescription}
              onChange={(e) => setWorkflowDescription(e.target.value)}
              placeholder="وصف مختصر لسير العمل..."
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex-1 flex gap-4">
        {/* Step Palette */}
        <Card className="w-64">
          <CardHeader>
            <CardTitle className="text-sm">مكونات سير العمل</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              { type: 'approval' as const, name: 'موافقة', desc: 'يتطلب موافقة من شخص معين' },
              { type: 'notification' as const, name: 'إشعار', desc: 'إرسال إشعار أو بريد إلكتروني' },
              { type: 'form' as const, name: 'نموذج', desc: 'تعبئة نموذج أو استمارة' },
              { type: 'condition' as const, name: 'شرط', desc: 'التحقق من شرط معين' },
              { type: 'automation' as const, name: 'أتمتة', desc: 'تنفيذ إجراء تلقائي' }
            ].map((stepType) => (
              <Button
                key={stepType.type}
                variant="outline"
                className="w-full justify-start h-auto p-3"
                onClick={() => addStep(stepType.type)}
              >
                <div className="flex items-start gap-2">
                  {getStepIcon(stepType.type)}
                  <div className="text-left">
                    <div className="font-medium text-sm">{stepType.name}</div>
                    <div className="text-xs text-muted-foreground">{stepType.desc}</div>
                  </div>
                </div>
              </Button>
            ))}
          </CardContent>
        </Card>

        {/* Workflow Canvas */}
        <Card className="flex-1">
          <CardHeader>
            <CardTitle className="text-sm flex items-center justify-between">
              <span>لوحة سير العمل</span>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{steps.length} خطوة</Badge>
                <Button size="sm" variant="outline">
                  <Play className="h-3 w-3 ml-1" />
                  اختبار
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="h-96 relative overflow-hidden bg-muted/20 rounded-lg">
            {/* Workflow Steps */}
            {steps.map((step) => (
              <div
                key={step.id}
                className={`absolute w-40 cursor-pointer ${
                  selectedStep === step.id ? 'ring-2 ring-primary' : ''
                }`}
                style={{
                  left: step.position.x,
                  top: step.position.y,
                }}
                onClick={() => setSelectedStep(step.id)}
              >
                <Card className="shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      {getStepIcon(step.type)}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteStep(step.id);
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="text-xs font-medium">{step.name}</div>
                    <Badge variant="outline" className="text-xs mt-1">
                      {getStepTypeName(step.type)}
                    </Badge>
                  </CardContent>
                </Card>
                
                {/* Connection Points */}
                {step.connections.map((connId) => {
                  const targetStep = steps.find(s => s.id === connId);
                  if (!targetStep) return null;
                  
                  return (
                    <svg
                      key={connId}
                      className="absolute pointer-events-none"
                      style={{
                        left: 160,
                        top: 20,
                        width: targetStep.position.x - step.position.x - 160,
                        height: targetStep.position.y - step.position.y,
                      }}
                    >
                      <path
                        d={`M 0 0 L ${targetStep.position.x - step.position.x - 160} ${targetStep.position.y - step.position.y}`}
                        stroke="hsl(var(--primary))"
                        strokeWidth="2"
                        fill="none"
                        markerEnd="url(#arrowhead)"
                      />
                    </svg>
                  );
                })}
              </div>
            ))}
            
            {/* SVG Definitions */}
            <svg className="absolute inset-0 pointer-events-none">
              <defs>
                <marker
                  id="arrowhead"
                  markerWidth="10"
                  markerHeight="7"
                  refX="9"
                  refY="3.5"
                  orient="auto"
                >
                  <polygon
                    points="0 0, 10 3.5, 0 7"
                    fill="hsl(var(--primary))"
                  />
                </marker>
              </defs>
            </svg>

            {/* Empty State */}
            {steps.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <Workflow className="h-12 w-12 mx-auto mb-2 opacity-20" />
                  <p className="text-sm">اسحب المكونات من اليسار لبناء سير العمل</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Step Configuration Panel */}
        {selectedStep && (
          <Card className="w-80">
            <CardHeader>
              <CardTitle className="text-sm">إعدادات الخطوة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {(() => {
                const step = steps.find(s => s.id === selectedStep);
                if (!step) return null;

                return (
                  <>
                    <div>
                      <label className="text-sm font-medium">اسم الخطوة</label>
                      <Input
                        value={step.name}
                        onChange={(e) => updateStep(step.id, { name: e.target.value })}
                      />
                    </div>

                    {step.type === 'approval' && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium">المعتمدون</label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر المعتمد" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="manager">المدير المباشر</SelectItem>
                            <SelectItem value="hr">الموارد البشرية</SelectItem>
                            <SelectItem value="finance">المالية</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {step.type === 'notification' && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium">المستلمون</label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر المستلم" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="employee">الموظف</SelectItem>
                            <SelectItem value="manager">المدير</SelectItem>
                            <SelectItem value="hr">الموارد البشرية</SelectItem>
                          </SelectContent>
                        </Select>
                        <div>
                          <label className="text-sm font-medium">نص الرسالة</label>
                          <Textarea
                            placeholder="اكتب نص الإشعار..."
                            rows={3}
                          />
                        </div>
                      </div>
                    )}

                    {step.type === 'form' && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium">حقول النموذج</label>
                        <Button variant="outline" size="sm" className="w-full">
                          <Plus className="h-3 w-3 ml-1" />
                          إضافة حقل
                        </Button>
                      </div>
                    )}

                    {step.type === 'condition' && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium">الشروط</label>
                        <Button variant="outline" size="sm" className="w-full">
                          <Plus className="h-3 w-3 ml-1" />
                          إضافة شرط
                        </Button>
                      </div>
                    )}
                  </>
                );
              })()}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}