import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { 
  Building, 
  Users, 
  FileText, 
  AlertTriangle, 
  UserCheck, 
  Calendar,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  DollarSign,
  Award
} from "lucide-react";

interface StatsCardProps {
  title: string;
  value: number;
  icon: string;
  color: "blue" | "green" | "orange" | "red" | "yellow" | "purple";
  trend?: {
    value: number;
    isPositive: boolean;
  };
  onClick?: () => void;
  subtitle?: string;
  change?: string;
}

export function StatsCard({ title, value, icon, color, trend, onClick, subtitle, change }: StatsCardProps) {
  const getIcon = (iconName: string) => {
    const iconMap = {
      building: Building,
      users: Users,
      certificate: FileText,
      alert: AlertTriangle,
      "user-check": UserCheck,
      calendar: Calendar,
      check: CheckCircle,
      dollar: DollarSign,
      award: Award,
    };
    
    const IconComponent = iconMap[iconName as keyof typeof iconMap] || Building;
    return IconComponent;
  };

  const getColorClasses = (colorName: string) => {
    const colorMap = {
      blue: {
        bg: "bg-blue-50 dark:bg-blue-950",
        iconBg: "bg-blue-100 dark:bg-blue-900",
        text: "text-blue-600 dark:text-blue-400",
        border: "border-blue-200 dark:border-blue-800",
      },
      green: {
        bg: "bg-green-50 dark:bg-green-950",
        iconBg: "bg-green-100 dark:bg-green-900",
        text: "text-green-600 dark:text-green-400",
        border: "border-green-200 dark:border-green-800",
      },
      orange: {
        bg: "bg-orange-50 dark:bg-orange-950",
        iconBg: "bg-orange-100 dark:bg-orange-900",
        text: "text-orange-600 dark:text-orange-400",
        border: "border-orange-200 dark:border-orange-800",
      },
      red: {
        bg: "bg-red-50 dark:bg-red-950",
        iconBg: "bg-red-100 dark:bg-red-900",
        text: "text-red-600 dark:text-red-400",
        border: "border-red-200 dark:border-red-800",
      },
      yellow: {
        bg: "bg-yellow-50 dark:bg-yellow-950",
        iconBg: "bg-yellow-100 dark:bg-yellow-900",
        text: "text-yellow-600 dark:text-yellow-400",
        border: "border-yellow-200 dark:border-yellow-800",
      },
      purple: {
        bg: "bg-purple-50 dark:bg-purple-950",
        iconBg: "bg-purple-100 dark:bg-purple-900",
        text: "text-purple-600 dark:text-purple-400",
        border: "border-purple-200 dark:border-purple-800",
      },
    };
    
    return colorMap[colorName as keyof typeof colorMap] || colorMap.blue;
  };

  const IconComponent = getIcon(icon);
  const colorClasses = getColorClasses(color);
  const TrendIcon = trend?.isPositive ? TrendingUp : TrendingDown;
  const ArrowIcon = trend?.isPositive ? ArrowUpRight : ArrowDownRight;

  return (
    <Card 
      className={`
        relative overflow-hidden transition-all duration-300
        ${onClick ? 'cursor-pointer hover:scale-105 hover:shadow-xl' : 'hover:shadow-lg'}
        ${colorClasses.border} border-2
        ${colorClasses.bg}
      `}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {/* Header */}
            <div className="flex items-center gap-2 mb-3">
              <h3 className="text-sm font-semibold text-muted-foreground">{title}</h3>
              {onClick && <Eye className="h-3 w-3 text-muted-foreground opacity-60" />}
            </div>
            
            {/* Main Value */}
            <div className="text-3xl font-bold text-foreground mb-3">
              {value.toLocaleString('ar-SA')}
            </div>
            
            {/* Trend and Additional Info */}
            <div className="flex items-center gap-3">
              {trend && (
                <Badge 
                  variant={trend.isPositive ? "default" : "destructive"}
                  className="text-xs px-2 py-1 flex items-center gap-1"
                >
                  <ArrowIcon className="h-3 w-3" />
                  {Math.abs(trend.value)}%
                </Badge>
              )}
              {change && (
                <span className="text-xs text-muted-foreground font-medium">
                  {change}
                </span>
              )}
            </div>
            
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>
          
          {/* Icon with Animation */}
          <div className={`
            relative p-4 rounded-2xl ${colorClasses.iconBg}
            transition-transform duration-300 hover:rotate-12
          `}>
            <IconComponent className={`h-8 w-8 ${colorClasses.text}`} />
            
            {/* Trend Indicator */}
            {trend && (
              <div className={`
                absolute -top-1 -right-1 p-1.5 rounded-full shadow-lg
                ${trend.isPositive ? 'bg-green-500' : 'bg-red-500'}
                animate-pulse
              `}>
                <TrendIcon className="h-3 w-3 text-white" />
              </div>
            )}
          </div>
        </div>
        
        {/* Gradient Overlay */}
        <div className={`
          absolute inset-0 opacity-5 pointer-events-none
          bg-gradient-to-br from-transparent via-transparent to-current
        `} />
      </CardContent>
    </Card>
  );
}