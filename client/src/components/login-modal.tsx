import React, {useState, useCallback} from 'react';
import {Button} from './ui/button';
import {Input} from './ui/input';
import {Label} from './ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from './ui/dialog';
import {useAuth} from '@/hooks/useAuth';
import type {Company} from '@shared/schema';

interface LoginModalProps {
  company: Company;
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({company, isOpen, onClose}) => {
  const {login, loading, error} = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const handleLogin = useCallback(async () => {
    setLocalError(null);
    if (!username || !password) {
      setLocalError('يرجى إدخال اسم المستخدم وكلمة المرور');
      return;
    }
    const result = await login({username, password, 'companyId': company.id});
    if (result.success) {
      onClose();
    } else {
      setLocalError(result.error ?? 'فشل تسجيل الدخول');
    }
  }, [username, password, login, company.id, onClose]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>تسجيل الدخول</DialogTitle>
          <DialogDescription>
            الرجاء تسجيل الدخول للدخول إلى شركة: {company.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">اسم المستخدم</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="example@company.com"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">كلمة المرور</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          {(localError || error) && (
            <p className="text-sm text-destructive">
              {localError || error}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            إلغاء
          </Button>
          <Button onClick={handleLogin} disabled={loading}>
            {loading ? 'جارٍ الدخول...' : 'تسجيل الدخول'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};


