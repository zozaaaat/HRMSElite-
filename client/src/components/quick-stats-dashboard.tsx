import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { 
  Users, 
  UserCheck, 
  Calendar, 
  Clock,
  FolderOpen,
  CheckCircle
} from "lucide-react";

interface QuickStats {
  totalEmployees: number;
  presentToday: number;
  onLeave: number;
  pendingRequests: number;
  activeProjects: number;
  completedTasks: number;
}

export function QuickStatsDashboard() {
  const { data: stats } = useQuery<QuickStats>({
    queryKey: ["/api/quick-stats"],
    refetchInterval: 60000, // Refresh every minute
  });

  if (!stats) return null;

  const statCards = [
    {
      title: "إجمالي الموظفين",
      value: stats.totalEmployees,
      icon: Users,
      color: "text-blue-600"
    },
    {
      title: "الحضور اليوم",
      value: stats.presentToday,
      icon: UserCheck,
      color: "text-green-600"
    },
    {
      title: "في إجازة",
      value: stats.onLeave,
      icon: Calendar,
      color: "text-orange-600"
    },
    {
      title: "طلبات معلقة",
      value: stats.pendingRequests,
      icon: Clock,
      color: "text-red-600"
    },
    {
      title: "مشاريع نشطة",
      value: stats.activeProjects,
      icon: FolderOpen,
      color: "text-purple-600"
    },
    {
      title: "مهام مكتملة",
      value: stats.completedTasks,
      icon: CheckCircle,
      color: "text-teal-600"
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <Icon className={`h-8 w-8 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}