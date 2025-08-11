import {useState, useEffect} from 'react';
import type {FormEvent} from 'react';
import {Button} from './ui/button';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from './ui/card';
import {Input} from './ui/input';
import {Label} from './ui/label';
import {Textarea} from './ui/textarea';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from './ui/select';
import {Badge} from './ui/badge';
import {Alert, AlertDescription} from './ui/alert';
import {useToast} from '../hooks/use-toast';
import {useMutation, useQueryClient} from '@tanstack/react-query';
import {apiPost} from '@/lib/apiRequest';
import {addDays, isWeekend} from 'date-fns';
import SignatureCapture from './signature-capture';
import {SignatureData} from '../types/documents';
import {
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Info,
  Calculator,
  User,
  PenTool,
  Edit,
  X
} from 'lucide-react';

interface LeaveBalance {
  annual: number;
  used: number;
  remaining: number;
  sick: number;
  emergency: number;
  maternity?: number;
  paternity?: number;
  study?: number;
  unpaid?: number;
}

interface LeaveRequestFormProps {
  employeeId?: string;
  employeeName?: string;
  leaveBalance?: LeaveBalance;
  onSuccess?: () => void;
  onCancel?: () => void;
  isOpen?: boolean;
}

interface LeaveRequest {
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
  days: number;
  employeeId: string;
}

export function LeaveRequestForm ({
  employeeId = 'current-user',
  employeeName = 'أحمد محمد علي',
  leaveBalance,
  onSuccess,
  onCancel,
  isOpen = true
}: LeaveRequestFormProps) {

  const {toast} = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<LeaveRequest>({
    'leaveType': '',
    'startDate': '',
    'endDate': '',
    'reason': '',
    'days': 0,
    employeeId
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [calculatedDays, setCalculatedDays] = useState(0);
  const [showSignatureCapture, setShowSignatureCapture] = useState(false);
  const [employeeSignature, setEmployeeSignature] = useState<SignatureData | undefined>();

  // حساب عدد أيام الإجازة
  useEffect(() => {

    if (formData.startDate && formData.endDate) {

      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);

      if (startDate <= endDate) {

        let days = 0;
        let currentDate = new Date(startDate);

        while (currentDate <= endDate) {

          // لا نحسب أيام العطل الأسبوعية
          if (!isWeekend(currentDate)) {

            days++;

          }
          currentDate = addDays(currentDate, 1);

        }

        setCalculatedDays(days);
        setFormData(prev => ({...prev, days}));

      } else {

        setCalculatedDays(0);
        setErrors(prev => ({...prev, 'endDate': 'تاريخ النهاية يجب أن يكون بعد تاريخ البداية'}));

      }

    }

  }, [formData.startDate, formData.endDate]);

  // التحقق من صحة البيانات
  const validateForm = (): boolean => {

    const newErrors: Record<string, string> = {};

    if (!formData.leaveType) {

      newErrors.leaveType = 'يرجى اختيار نوع الإجازة';

    }

    if (!formData.startDate) {

      newErrors.startDate = 'يرجى تحديد تاريخ البداية';

    }

    if (!formData.endDate) {

      newErrors.endDate = 'يرجى تحديد تاريخ النهاية';

    }

    if (formData.startDate && formData.endDate) {

      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);

      if (startDate > endDate) {

        newErrors.endDate = 'تاريخ النهاية يجب أن يكون بعد تاريخ البداية';

      }

      if (startDate < new Date()) {

        newErrors.startDate = 'لا يمكن طلب إجازة في الماضي';

      }

    }

    if (!formData.reason.trim()) {

      newErrors.reason = 'يرجى كتابة سبب الإجازة';

    }

    if (calculatedDays <= 0) {

      newErrors.days = 'عدد أيام الإجازة يجب أن يكون أكبر من صفر';

    }

    // التحقق من الرصيد المتاح
    if (leaveBalance && formData.leaveType) {

      const balanceKey = formData.leaveType as keyof LeaveBalance;
      const availableBalance = leaveBalance[balanceKey] ?? 0;

      if (calculatedDays > availableBalance) {

        newErrors.balance = `الرصيد المتاح (${
  availableBalance
} يوم) أقل من المطلوب (${
  calculatedDays
} يوم)`;

      }

    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;

  };

  // إرسال طلب الإجازة
  const submitRequestMutation = useMutation({
    'mutationFn': (requestData: LeaveRequest) =>
      apiPost<{id: string}>('/api/leaves', requestData),
    'onSuccess': (data: {id: string}) => {

      toast({
        'title': 'تم إرسال الطلب بنجاح',
        'description': `تم إرسال طلب الإجازة وهو قيد المراجعة. رقم الطلب: ${data.id}`
      });

      // إعادة تعيين النموذج
      setFormData({
        'leaveType': '',
        'startDate': '',
        'endDate': '',
        'reason': '',
        'days': 0,
        employeeId
      });
      setErrors({});
      setCalculatedDays(0);

      // تحديث البيانات
      queryClient.invalidateQueries({'queryKey': ['/api/leaves']});
      queryClient.invalidateQueries({'queryKey': ['/api/leave-balance']});

      onSuccess?.();

    },
    'onError': (error: unknown) => {

      const description = error instanceof Error
        ? error.message
        : 'حدث خطأ أثناء إرسال طلب الإجازة';

      toast({
        'title': 'خطأ في إرسال الطلب',
        description,
        'variant': 'destructive'
      });

    }
  });

  const handleSubmit = (e: FormEvent) => {

    e.preventDefault();

    if (!validateForm()) {

      return;

    }

    submitRequestMutation.mutate(formData);

  };

  const handleSignatureSave = (signatureData: SignatureData) => {

    setEmployeeSignature(signatureData);
    setShowSignatureCapture(false);

  };

  const getLeaveTypeLabel = (type: string) => {

    const typeMap: Record<string, string> = {
      'annual': 'إجازة سنوية',
      'sick': 'إجازة مرضية',
      'emergency': 'إجازة طارئة',
      'maternity': 'إجازة أمومة',
      'paternity': 'إجازة أبوة',
      'study': 'إجازة دراسية',
      'unpaid': 'إجازة بدون راتب'
    };
    return typeMap[type] ?? type;

  };

  const getBalanceForType = (type: string) => {

    if (!leaveBalance) {

      return null;

    }

    const balanceKey = type as keyof LeaveBalance;
    const balance = leaveBalance[balanceKey];

    if (balance === undefined) {

      return null;

    }

    return {
      'total': balance,
      'remaining': type === 'annual' ? leaveBalance.remaining : balance,
      'used': type === 'annual' ? leaveBalance.used : 0
    };

  };

  if (!isOpen) {

    return null;

  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          طلب إجازة جديد
        </CardTitle>
        <CardDescription>
          قم بتعبئة تفاصيل طلب الإجازة. سيتم مراجعة الطلب من قبل المدير المباشر.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* معلومات الموظف */}
          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">{employeeName}</span>
          </div>

          {/* نوع الإجازة */}
          <div className="space-y-2">
            <Label htmlFor="leave-type">نوع الإجازة *</Label>
            <Select
              value={formData.leaveType}
              onValueChange={(value) => {

                setFormData({...formData, 'leaveType': value});
                setErrors(prev => ({...prev, 'leaveType': ''}));

              }}
            >
              <SelectTrigger className={errors.leaveType ? 'border-red-500' : ''}>
                <SelectValue placeholder="اختر نوع الإجازة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="annual">إجازة سنوية</SelectItem>
                <SelectItem value="sick">إجازة مرضية</SelectItem>
                <SelectItem value="emergency">إجازة طارئة</SelectItem>
                <SelectItem value="maternity">إجازة أمومة</SelectItem>
                <SelectItem value="paternity">إجازة أبوة</SelectItem>
                <SelectItem value="study">إجازة دراسية</SelectItem>
                <SelectItem value="unpaid">إجازة بدون راتب</SelectItem>
              </SelectContent>
            </Select>
            {errors.leaveType && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <XCircle className="h-3 w-3" />
                {errors.leaveType}
              </p>
            )}
          </div>

          {/* عرض الرصيد المتاح */}
          {formData.leaveType && leaveBalance && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Info className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">
                  رصيد {getLeaveTypeLabel(formData.leaveType)}
                </span>
              </div>
              {(() => {

                const balance = getBalanceForType(formData.leaveType);
                if (!balance) {

                  return null;

                }

                return (
                  <div className="flex gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <span className="text-muted-foreground">المتاح:</span>
                      <Badge variant="outline" className="text-green-600">
                        {balance.remaining} يوم
                      </Badge>
                    </div>
                    {balance.used > 0 && (
                      <div className="flex items-center gap-1">
                        <span className="text-muted-foreground">المستخدم:</span>
                        <Badge variant="outline" className="text-orange-600">
                          {balance.used} يوم
                        </Badge>
                      </div>
                    )}
                  </div>
                );

              })()}
            </div>
          )}

          {/* تواريخ الإجازة */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-date">تاريخ البداية *</Label>
              <Input
                id="start-date"
                type="date"
                value={formData.startDate}
                onChange={(e) => {

                  setFormData({...formData, 'startDate': e.target.value});
                  setErrors(prev => ({...prev, 'startDate': ''}));

                }}
                className={errors.startDate ? 'border-red-500' : ''}
                min={new Date().toISOString().split('T')[0]}
              />
              {errors.startDate && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <XCircle className="h-3 w-3" />
                  {errors.startDate}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="end-date">تاريخ النهاية *</Label>
              <Input
                id="end-date"
                type="date"
                value={formData.endDate}
                onChange={(e) => {

                  setFormData({...formData, 'endDate': e.target.value});
                  setErrors(prev => ({...prev, 'endDate': ''}));

                }}
                className={errors.endDate ? 'border-red-500' : ''}
                min={formData.startDate ?? new Date().toISOString().split('T')[0]}
              />
              {errors.endDate && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <XCircle className="h-3 w-3" />
                  {errors.endDate}
                </p>
              )}
            </div>
          </div>

          {/* عدد الأيام المحسوبة */}
          {calculatedDays > 0 && (
            <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
              <Calculator className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-900">
                عدد أيام الإجازة: {calculatedDays} يوم
              </span>
              <Badge variant="outline" className="text-green-600">
                {calculatedDays} يوم
              </Badge>
            </div>
          )}

          {/* سبب الإجازة */}
          <div className="space-y-2">
            <Label htmlFor="reason">سبب الإجازة *</Label>
            <Textarea
              id="reason"
              placeholder="اذكر سبب طلب الإجازة بالتفصيل..."
              rows={4}
              value={formData.reason}
              onChange={(e) => {

                setFormData({...formData, 'reason': e.target.value});
                setErrors(prev => ({...prev, 'reason': ''}));

              }}
              className={errors.reason ? 'border-red-500' : ''}
            />
            {errors.reason && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <XCircle className="h-3 w-3" />
                {errors.reason}
              </p>
            )}
          </div>

          {/* تحذيرات وإشعارات */}
          {errors.balance && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errors.balance}</AlertDescription>
            </Alert>
          )}

          {calculatedDays > 0 && formData.leaveType && leaveBalance && (() => {

            const balance = getBalanceForType(formData.leaveType);
            if (!balance) {

              return null;

            }

            if (calculatedDays > balance.remaining) {

              return (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    عدد أيام الإجازة المطلوبة ({
  calculatedDays
} يوم) يتجاوز الرصيد المتاح ({
  balance.remaining
} يوم)
                  </AlertDescription>
                </Alert>
              );

            }

            if (calculatedDays > balance.remaining * 0.8) {

              return (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    تحذير: هذا الطلب سيستنفذ {
  (calculatedDays / balance.remaining * 100).toFixed(0)
}% من رصيدك المتبقي
                  </AlertDescription>
                </Alert>
              );

            }

            return null;

          })()}

          {/* قسم التوقيع */}
          <div className="space-y-2">
            <Label>توقيع الموظف</Label>
            <div className="space-y-2">
              {employeeSignature ? (
                <div className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <PenTool className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium">تم إضافة التوقيع</span>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowSignatureCapture(true)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        تعديل
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setEmployeeSignature(undefined)}
                      >
                        <X className="h-4 w-4 mr-1" />
                        حذف
                      </Button>
                    </div>
                  </div>
                  <div className="mt-2">
                    <img
                      src={employeeSignature.imageData}
                      alt="توقيع الموظف"
                      className="w-full h-24 object-contain border rounded"
                    />
                  </div>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowSignatureCapture(true)}
                  className="w-full"
                >
                  <PenTool className="h-4 w-4 mr-1" />
                  إضافة توقيع الموظف
                </Button>
              )}
            </div>
          </div>

          {/* أزرار الإجراءات */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={submitRequestMutation.isPending ?? calculatedDays <= 0}
              className="flex-1"
            >
              {submitRequestMutation.isPending ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  جاري الإرسال...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  إرسال الطلب
                </>
              )}
            </Button>

            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={submitRequestMutation.isPending}
              >
                إلغاء
              </Button>
            )}
          </div>

          {/* معلومات إضافية */}
          <div className="text-xs text-muted-foreground space-y-1">
            <p>• سيتم مراجعة الطلب من قبل المدير المباشر خلال 24-48 ساعة</p>
            <p>• يمكن تتبع حالة الطلب من صفحة طلبات الإجازات</p>
            <p>• الإجازات الطارئة تتطلب إشعار فوري للمدير</p>
          </div>
        </form>

        {/* نافذة التقاط التوقيع */}
        {showSignatureCapture && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <SignatureCapture
                entityId={employeeId}
                entityType="leave"
                onSave={handleSignatureSave}
                onCancel={() => setShowSignatureCapture(false)}
                title="توقيع الموظف"
                description="قم بالتوقيع على طلب الإجازة"
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

}
