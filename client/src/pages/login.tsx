import {useState, type FormEvent} from 'react';
import {useLocation} from 'wouter';
import {Button} from '../components/ui/button';
import {Input} from '../components/ui/input';
import {Label} from '../components/ui/label';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '../components/ui/card';
import {Alert, AlertDescription} from '../components/ui/alert';
import {Loader2, User, Lock, AlertCircle} from 'lucide-react';
import {useToast} from '../hooks/use-toast';
import {getDashboardRouteWithCompany} from '../lib/routes';
import {useAppStore} from '../stores/useAppStore';

export default function Login () {

  const [, setLocation] = useLocation();
  const {toast} = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    'username': '',
    'password': ''
  });

  // استخراج معلومات الشركة من URL
  const urlParams = new window.URLSearchParams(window.location.search);
  const companyId = urlParams.get('company');
  const companyName = urlParams.get('name');

  const handleSubmit = async (e: FormEvent) => {

    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {

      // محاكاة تسجيل الدخول مع تحسين التوجيه
      if (formData.username && formData.password) {

        let userRole = 'worker';

        // تحديد الدور حسب اسم المستخدم
        if (formData.username.includes('admin')) {

          userRole = 'super_admin';

        } else if (formData.username.includes('gu_2') || formData.username.includes('manager')) {

          userRole = 'company_manager';

        
} else if (formData.username.includes('gu_4') || formData.username.includes('gu_6') || formData.username.includes('employee')) {
  

          userRole = 'employee';

        } else if (formData.username.includes('supervisor')) {

          userRole = 'supervisor';

        } else if (formData.username.includes('worker') || formData.username.includes('gu_3')) {

          userRole = 'worker';

        }

        // بناء مسار لوحة التحكم الموحد باستخدام الدوال المساعدة
        const dashboard = getDashboardRouteWithCompany(userRole,
   companyId ?? undefined,
   companyName ?? undefined);

        toast({
          'title': 'تسجيل دخول ناجح',
          'description': `مرحباً بك في نظام Zeylab HRMS - ${
  userRole === 'super_admin' ? 'المسؤول العام' : companyName ?? "الشركة"
}`
        });

        // تحديث حالة المستخدم في المتجر
        const mockUser = {
          'id': '1',
          'email': `${formData.username || 'demo'}@example.com`,
          'firstName': userRole === 'super_admin' ? 'المسؤول' : 'المستخدم',
          'lastName': 'النظام',
          'password': 'mock-password',
          'profileImageUrl': null,
          'role': userRole,
          'companyId': companyId ?? null,
          'permissions': '[]',
          'isActive': true,
          'emailVerified': true,
          'emailVerificationToken': null,
          'emailVerificationExpires': null,
          'passwordResetToken': null,
          'passwordResetExpires': null,
          'lastPasswordChange': null,
          'lastLoginAt': Date.now(),
          'sub': 'mock-sub',
          'claims': null,
          'createdAt': new Date(),
          'updatedAt': new Date()
        };

        // تحديث المتجر مباشرة
        const {login} = useAppStore.getState();
        login(mockUser);

        // توجيه فوري إلى لوحة التحكم
        setLocation(dashboard);

      } else {

        setError('يرجى إدخال اسم المستخدم وكلمة المرور');

      }

    } catch {

      setError('خطأ في تسجيل الدخول. يرجى المحاولة مرة أخرى.');

    } finally {

      setIsLoading(false);

    }

  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
            <User className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-2xl">تسجيل الدخول</CardTitle>
          <CardDescription>
            نظام إدارة الموارد البشرية - Zeylab HRMS
            {companyName && (
              <div className="mt-2 text-sm font-medium text-primary">
                {companyName}
              </div>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="username">اسم المستخدم</Label>
              <div className="relative">
                <User className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="username"
                  type="text"
                  placeholder="أدخل اسم المستخدم"
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, 'username': e.target.value})}
                  className="pr-10"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">كلمة المرور</Label>
              <div className="relative">
                <Lock className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="أدخل كلمة المرور"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, 'password': e.target.value})}
                  className="pr-10"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  جاري تسجيل الدخول...
                </>
              ) : (
                'تسجيل الدخول'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p className="mb-2">أمثلة على حسابات تجريبية:</p>
            <div className="space-y-1 text-xs">
              <p>المسؤول العام: admin | Zeylab@2025</p>
              <p>مدير شركة: gu_2 | Zeylab@2025</p>
              <p>موظف إداري: gu_4 | Zeylab@2025</p>
              <p>مشرف: supervisor | Zeylab@2025</p>
              <p>عامل: gu_3 | Zeylab@2025</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

}
