import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Lock, 
  User, 
  ArrowRight, 
  Building2, 
  Shield, 
  Eye, 
  EyeOff,
  ArrowLeft 
} from "lucide-react";

const loginSchema = z.object({
  username: z.string().min(3, "اسم المستخدم يجب أن يكون على الأقل 3 أحرف"),
  password: z.string().min(6, "كلمة المرور يجب أن تكون على الأقل 6 أحرف")
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginProps {
  companyId?: string;
  companyName?: string;
}

export default function Login({ companyId, companyName }: LoginProps) {
  const [location, setLocation] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();

  // Extract company info from URL if not provided as props
  const urlParams = new URLSearchParams(location.split('?')[1] || '');
  const selectedCompanyId = companyId || urlParams.get('company') || '';
  const selectedCompanyName = companyName || urlParams.get('name') || 'الشركة المحددة';

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: ""
    }
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginFormData) => {
      const response = await fetch(`/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          companyId: selectedCompanyId
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "فشل في تسجيل الدخول");
      }
      
      return response.json();
    },
    onSuccess: (response: any) => {
      toast({
        title: "تم تسجيل الدخول بنجاح",
        description: `مرحباً ${response.user.name}`,
      });

      // توجيه المستخدم حسب الدور
      const userRole = response.user.role;
      switch (userRole) {
        case 'super_admin':
          setLocation('/dashboard?view=super-admin');
          break;
        case 'company_manager':
          setLocation(`/company-dashboard?company=${selectedCompanyId}`);
          break;
        case 'employee':
          setLocation(`/employee-dashboard?company=${selectedCompanyId}`);
          break;
        case 'supervisor':
          setLocation(`/supervisor-dashboard?company=${selectedCompanyId}`);
          break;
        case 'worker':
          setLocation(`/worker-dashboard?company=${selectedCompanyId}`);
          break;
        default:
          setLocation(`/dashboard?company=${selectedCompanyId}`);
      }
    },
    onError: (error: any) => {
      const errorMessage = error?.message || "تحقق من اسم المستخدم وكلمة المرور";
      toast({
        title: "فشل في تسجيل الدخول",
        description: errorMessage,
        variant: "destructive",
      });
    }
  });

  const onSubmit = (data: LoginFormData) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-8" 
         style={{ direction: 'rtl' }}>
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">تسجيل الدخول</h1>
            <p className="text-gray-600 mt-2">ادخل بياناتك للوصول إلى النظام</p>
          </div>
        </div>

        {/* Company Info */}
        <Card className="border-blue-200 bg-blue-50/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Building2 className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium text-blue-900">{selectedCompanyName}</p>
                <p className="text-sm text-blue-600">الشركة المحددة للدخول</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Login Form */}
        <Card className="shadow-lg border-0">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl text-center">بيانات الدخول</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-right">اسم المستخدم</Label>
                <div className="relative">
                  <User className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="username"
                    {...form.register("username")}
                    placeholder="أدخل اسم المستخدم"
                    className="pr-10"
                    disabled={loginMutation.isPending}
                  />
                </div>
                {form.formState.errors.username && (
                  <p className="text-sm text-red-500 text-right">
                    {form.formState.errors.username.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-right">كلمة المرور</Label>
                <div className="relative">
                  <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    {...form.register("password")}
                    placeholder="أدخل كلمة المرور"
                    className="pr-10 pl-10"
                    disabled={loginMutation.isPending}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {form.formState.errors.password && (
                  <p className="text-sm text-red-500 text-right">
                    {form.formState.errors.password.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-lg gap-2"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? (
                  "جاري تسجيل الدخول..."
                ) : (
                  <>
                    دخول
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Demo Users */}
        <Card className="border-amber-200 bg-amber-50/50">
          <CardContent className="p-4">
            <h3 className="font-medium text-amber-900 mb-3">مستخدمين تجريبيين:</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-amber-700">سوبر أدمن:</span>
                <span className="text-amber-800 font-mono">admin / admin123</span>
              </div>
              <div className="flex justify-between">
                <span className="text-amber-700">مدير شركة:</span>
                <span className="text-amber-800 font-mono">manager / manager123</span>
              </div>
              <div className="flex justify-between">
                <span className="text-amber-700">موظف:</span>
                <span className="text-amber-800 font-mono">employee / emp123</span>
              </div>
              <div className="flex justify-between">
                <span className="text-amber-700">مشرف:</span>
                <span className="text-amber-800 font-mono">supervisor / super123</span>
              </div>
              <div className="flex justify-between">
                <span className="text-amber-700">عامل:</span>
                <span className="text-amber-800 font-mono">worker / work123</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Back to Company Selection */}
        <div className="text-center">
          <Button 
            variant="outline" 
            onClick={() => setLocation('/')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            العودة لاختيار الشركة
          </Button>
        </div>
      </div>
    </div>
  );
}