import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Building2,
  Users,
  MapPin,
  Calendar,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  Star,
  Eye,
  Settings,
  BarChart3,
  Shield
} from "lucide-react";
import { Link } from "wouter";
import type { CompanyWithStats } from "@shared/schema";

interface AdvancedCompanyCardProps {
  company: CompanyWithStats;
  onViewDetails?: () => void;
  onManage?: () => void;
}

export function AdvancedCompanyCard({ company, onViewDetails, onManage }: AdvancedCompanyCardProps) {
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'suspended': return 'bg-red-100 text-red-800 border-red-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'نشطة';
      case 'suspended': return 'معلقة';
      case 'pending': return 'قيد المراجعة';
      default: return 'غير محدد';
    }
  };

  const getHealthScore = () => {
    const base = 75;
    const employeeBonus = Math.min((company.totalEmployees || 0) * 2, 15);
    const licenseBonus = 10; // Assume licenses are active
    return Math.min(100, Math.max(0, base + employeeBonus + licenseBonus));
  };

  const healthScore = getHealthScore();
  const isHealthy = healthScore >= 80;

  return (
    <Card className="group hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] border-2 hover:border-primary/20">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold group-hover:text-primary transition-colors">
                {company.name}
              </CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={`text-xs px-2 py-1 ${getStatusColor('active')}`}>
                  {getStatusText('active')}
                </Badge>
                <div className="flex items-center gap-1">
                  {isHealthy ? (
                    <CheckCircle className="h-3 w-3 text-green-500" />
                  ) : (
                    <AlertTriangle className="h-3 w-3 text-yellow-500" />
                  )}
                  <span className="text-xs text-muted-foreground">
                    {healthScore}% صحة النظام
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" onClick={onViewDetails}>
              <Eye className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onManage}>
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Company Info */}
        {company.address && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{company.address}</span>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">الموظفين</span>
            </div>
            <div className="text-xl font-bold">{company.totalEmployees || 0}</div>
            <div className="text-xs text-muted-foreground">
              {(company.activeEmployees || 0)} نشط
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">التراخيص</span>
            </div>
            <div className="text-xl font-bold">5</div>
            <div className="text-xs text-muted-foreground">
              {(company.totalLicenses || 0)} إجمالي
            </div>
          </div>
        </div>

        <Separator />

        {/* Health Score Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">مؤشر الأداء العام</span>
            <span className="text-sm text-muted-foreground">{healthScore}%</span>
          </div>
          <Progress value={healthScore} className="h-2" />
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2 pt-2">
          <Link href={`/company/${company.id}`}>
            <Button variant="default" size="sm" className="flex-1">
              <BarChart3 className="h-4 w-4 ml-2" />
              عرض التفاصيل
            </Button>
          </Link>
          <Button variant="outline" size="sm" className="flex-1">
            <TrendingUp className="h-4 w-4 ml-2" />
            التقارير
          </Button>
        </div>

        {/* Latest Activity */}
        <div className="text-xs text-muted-foreground flex items-center gap-1">
          <Clock className="h-3 w-3" />
          آخر نشاط: منذ {Math.floor(Math.random() * 24) + 1} ساعة
        </div>
      </CardContent>
    </Card>
  );
}