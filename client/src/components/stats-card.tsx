import { Card, CardContent } from "@/components/ui/card";
import { 
  Building, 
  Users, 
  FileText, 
  AlertTriangle, 
  UserCheck, 
  Calendar,
  CheckCircle,
} from "lucide-react";

interface StatsCardProps {
  title: string;
  value: number;
  icon: string;
  color: "blue" | "green" | "orange" | "red" | "yellow";
}

export function StatsCard({ title, value, icon, color }: StatsCardProps) {
  const getIcon = (iconName: string) => {
    const iconMap = {
      building: Building,
      users: Users,
      certificate: FileText,
      alert: AlertTriangle,
      "user-check": UserCheck,
      calendar: Calendar,
      check: CheckCircle,
    };
    
    const IconComponent = iconMap[iconName as keyof typeof iconMap] || Building;
    return IconComponent;
  };

  const getColorClasses = (colorName: string) => {
    const colorMap = {
      blue: {
        bg: "bg-blue-100 dark:bg-blue-900",
        text: "text-blue-600",
      },
      green: {
        bg: "bg-green-100 dark:bg-green-900",
        text: "text-green-600",
      },
      orange: {
        bg: "bg-orange-100 dark:bg-orange-900",
        text: "text-orange-600",
      },
      red: {
        bg: "bg-red-100 dark:bg-red-900",
        text: "text-red-600",
      },
      yellow: {
        bg: "bg-yellow-100 dark:bg-yellow-900",
        text: "text-yellow-600",
      },
    };
    
    return colorMap[colorName as keyof typeof colorMap] || colorMap.blue;
  };

  const Icon = getIcon(icon);
  const colors = getColorClasses(color);

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center">
          <div className={`w-12 h-12 ${colors.bg} rounded-lg flex items-center justify-center`}>
            <Icon className={`${colors.text} text-xl h-6 w-6`} />
          </div>
          <div className="mr-4">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold text-foreground">{value.toLocaleString()}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
