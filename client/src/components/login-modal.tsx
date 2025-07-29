import { useState } from "react";
import { useLocation } from "wouter";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Checkbox } from "./ui/checkbox";
import { X } from "lucide-react";
import type { CompanyWithStats } from "@shared/schema";

interface LoginModalProps {
  company: CompanyWithStats;
  isOpen: boolean;
  onClose: () => void;
}

export function LoginModal({ company, isOpen, onClose }: LoginModalProps) {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const getCompanyInitials = (name: string) => {
    const words = name.split(' ');
    return words.slice(0, 2).map(word => word.charAt(0)).join(' ');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // For now, simulate login success and redirect to company dashboard
    // In a real app, this would validate credentials first
    onClose();
    setLocation(`/company/${company.id}`);
  };

  const handleForgotPassword = () => {
    // TODO: Implement forgot password functionality
    console.log("Forgot password clicked");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>تسجيل الدخول</DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mx-auto mb-3">
            <span className="text-white font-bold text-xl">
              {getCompanyInitials(company.name)}
            </span>
          </div>
          <h4 className="text-lg font-medium text-foreground">{company.name}</h4>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email" className="block text-sm font-medium mb-2">
              البريد الإلكتروني
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full"
            />
          </div>
          
          <div>
            <Label htmlFor="password" className="block text-sm font-medium mb-2">
              كلمة المرور
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-reverse space-x-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
              />
              <Label htmlFor="remember" className="text-sm">
                تذكرني
              </Label>
            </div>
            <Button
              type="button"
              variant="link"
              className="text-sm text-primary p-0"
              onClick={handleForgotPassword}
            >
              نسيت كلمة المرور؟
            </Button>
          </div>
          
          <Button type="submit" className="w-full">
            تسجيل الدخول
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
