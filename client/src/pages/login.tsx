import {useState, type FormEvent} from 'react';
import {useLocation} from 'wouter';
import {Button} from '../components/ui/button';
import {Input} from '../components/ui/input';
import {Label} from '../components/ui/label';
import {Card, CardContent, CardDescription, CardHeader} from '../components/ui/card';
import {Alert, AlertDescription} from '../components/ui/alert';
import {Loader2, User, Lock, AlertCircle} from 'lucide-react';
import {useToast} from '../hooks/use-toast';
import {getDashboardRouteWithCompany} from '../lib/routes';
import {useAuth} from '../hooks/auth/useAuth';
import {useTranslation} from 'react-i18next';

export default function Login () {

  const [, setLocation] = useLocation();
  const {toast} = useToast();
  const {t} = useTranslation();
  const { login } = useAuth();
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
      if (formData.username && formData.password) {
        const result = await login({
          username: formData.username,
          password: formData.password,
          companyId: companyId ?? undefined
        });

        if (result.success && result.user) {
          const userRole = result.user.role;
          const dashboard = getDashboardRouteWithCompany(
            userRole,
            companyId ?? undefined,
            companyName ?? undefined
          );

          toast({
            'title': t('auth.loginSuccess'),
            'description': t('auth.welcomeMessage', {
              company: userRole === 'super_admin'
                ? t('auth.admin')
                : companyName ?? t('common.companies')
            })
          });

          setLocation(dashboard);
        } else {
          setError(result.error ?? t('auth.loginError'));
        }
      } else {
        setError(t('validation.required'));
      }
    } catch {
      setError(t('auth.loginError'));
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <main role="main" className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
            <User className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-2xl font-semibold">{t('auth.login')}</h1>
          <CardDescription>
            {t('auth.loginDescription')}
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
              <Label htmlFor="username">{t('auth.username')}</Label>
              <div className="relative">
                <User className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="username"
                  type="text"
                  placeholder={t('auth.username')}
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, 'username': e.target.value})}
                  className="pr-10"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{t('auth.password')}</Label>
              <div className="relative">
                <Lock className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder={t('auth.password')}
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
                  {t('common.loading')}
                </>
              ) : (
                t('auth.login')
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );

}
