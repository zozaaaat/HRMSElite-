import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { 
  Bell,
  Check,
  X,
  Clock,
  User,
  AlertTriangle,
  Info,
  CheckCircle,
  Calendar,
  DollarSign,
  FileText,
  Settings,
  MoreVertical
} from "lucide-react";

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error' | 'system';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  read: boolean;
  createdAt: string;
  category: 'attendance' | 'leave' | 'payroll' | 'system' | 'training' | 'general';
  actionUrl?: string;
  metadata?: any;
}

interface NotificationCenterProps {
  className?: string;
}

export function NotificationCenter({ className }: NotificationCenterProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);

  // جلب الإشعارات
  const { data: notifications = [], isLoading } = useQuery<Notification[]>({
    queryKey: ["/api/notifications"],
  });

  // تحديث حالة الإشعارات
  const markAsReadMutation = useMutation({
    mutationFn: (notificationId: string) => 
      apiRequest(`/api/notifications/${notificationId}/read`, "PATCH"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
  });

  // حذف الإشعار
  const deleteNotificationMutation = useMutation({
    mutationFn: (notificationId: string) => 
      apiRequest(`/api/notifications/${notificationId}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      toast({
        title: "تم حذف الإشعار",
        description: "تم حذف الإشعار بنجاح",
      });
    },
  });

  // إشعارات تجريبية
  const mockNotifications: Notification[] = [
    {
      id: "1",
      title: "طلب إجازة جديد",
      message: "محمد عبدالله الحربي قدم طلب إجازة سنوية لمدة 5 أيام",
      type: "info",
      priority: "medium",
      read: false,
      createdAt: "2025-01-28T10:30:00Z",
      category: "leave",
      actionUrl: "/leave-requests"
    },
    {
      id: "2",
      title: "تأخير في الحضور",
      message: "5 موظفين سجلوا حضورهم متأخرين اليوم",
      type: "warning",
      priority: "medium",
      read: false,
      createdAt: "2025-01-28T08:45:00Z",
      category: "attendance",
      actionUrl: "/attendance"
    },
    {
      id: "3",
      title: "تم معالجة الرواتب",
      message: "تم إنهاء معالجة رواتب شهر يناير لجميع الموظفين",
      type: "success",
      priority: "high",
      read: true,
      createdAt: "2025-01-27T16:20:00Z",
      category: "payroll",
      actionUrl: "/payroll"
    },
    {
      id: "4",
      title: "انتهاء صلاحية ترخيص",
      message: "ترخيص العمل الخاص بشركة النيل الأزرق سينتهي خلال 30 يوم",
      type: "warning",
      priority: "high",
      read: false,
      createdAt: "2025-01-27T14:15:00Z",
      category: "system",
      actionUrl: "/license-management"
    },
    {
      id: "5",
      title: "تحديث النظام",
      message: "تم تحديث نظام إدارة الموارد البشرية إلى الإصدار 2.1.0",
      type: "system",
      priority: "low",
      read: true,
      createdAt: "2025-01-26T12:00:00Z",
      category: "system"
    },
    {
      id: "6",
      title: "دورة تدريبية جديدة",
      message: "تم إضافة دورة 'إدارة الوقت والإنتاجية' لبرنامج التدريب",
      type: "info",
      priority: "low",
      read: false,
      createdAt: "2025-01-26T09:30:00Z",
      category: "training",
      actionUrl: "/training"
    }
  ];

  const allNotifications = [...notifications, ...mockNotifications];
  const unreadCount = allNotifications.filter(n => !n.read).length;

  const getNotificationIcon = (type: string) => {
    const iconMap = {
      info: Info,
      warning: AlertTriangle,
      success: CheckCircle,
      error: X,
      system: Settings
    };
    const IconComponent = iconMap[type as keyof typeof iconMap] || Info;
    return IconComponent;
  };

  const getNotificationColor = (type: string, priority: string) => {
    if (priority === 'urgent') return 'text-red-600 bg-red-50';
    
    const colorMap = {
      info: 'text-blue-600 bg-blue-50',
      warning: 'text-orange-600 bg-orange-50',
      success: 'text-green-600 bg-green-50',
      error: 'text-red-600 bg-red-50',
      system: 'text-purple-600 bg-purple-50'
    };
    return colorMap[type as keyof typeof colorMap] || 'text-gray-600 bg-gray-50';
  };

  const getCategoryLabel = (category: string) => {
    const categoryMap = {
      attendance: 'الحضور',
      leave: 'الإجازات',
      payroll: 'الرواتب',
      system: 'النظام',
      training: 'التدريب',
      general: 'عام'
    };
    return categoryMap[category as keyof typeof categoryMap] || 'عام';
  };

  const handleMarkAsRead = (notificationId: string) => {
    markAsReadMutation.mutate(notificationId);
  };

  const handleDeleteNotification = (notificationId: string) => {
    deleteNotificationMutation.mutate(notificationId);
  };

  const handleMarkAllAsRead = () => {
    allNotifications
      .filter(n => !n.read)
      .forEach(n => markAsReadMutation.mutate(n.id));
  };

  const filterNotificationsByCategory = (category: string) => {
    if (category === 'all') return allNotifications;
    return allNotifications.filter(n => n.category === category);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs p-0"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-96 p-0" align="end">
        <Card className="border-0 shadow-lg">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">الإشعارات</CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{unreadCount} جديد</Badge>
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleMarkAllAsRead}
                    className="text-xs"
                  >
                    قراءة الكل
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-0">
            <Tabs defaultValue="all" className="w-full">
              <div className="border-b">
                <TabsList className="grid w-full grid-cols-4 rounded-none h-auto">
                  <TabsTrigger value="all" className="text-xs">الكل</TabsTrigger>
                  <TabsTrigger value="leave" className="text-xs">الإجازات</TabsTrigger>
                  <TabsTrigger value="attendance" className="text-xs">الحضور</TabsTrigger>
                  <TabsTrigger value="payroll" className="text-xs">الرواتب</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="all" className="mt-0">
                <ScrollArea className="h-96">
                  <div className="space-y-1 p-2">
                    {allNotifications.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>لا توجد إشعارات</p>
                      </div>
                    ) : (
                      allNotifications.map((notification) => {
                        const IconComponent = getNotificationIcon(notification.type);
                        const colorClasses = getNotificationColor(notification.type, notification.priority);
                        
                        return (
                          <div
                            key={notification.id}
                            className={`p-3 rounded-lg border transition-colors hover:bg-gray-50 ${
                              !notification.read ? 'bg-blue-50/50 border-blue-200' : 'bg-white'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`p-2 rounded-full ${colorClasses}`}>
                                <IconComponent className="h-4 w-4" />
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                  <h4 className={`text-sm font-medium ${!notification.read ? 'font-semibold' : ''}`}>
                                    {notification.title}
                                  </h4>
                                  <div className="flex items-center gap-1">
                                    <Badge variant="outline" className="text-xs">
                                      {getCategoryLabel(notification.category)}
                                    </Badge>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6"
                                      onClick={() => handleDeleteNotification(notification.id)}
                                    >
                                      <X className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                                
                                <p className="text-sm text-muted-foreground mb-2">
                                  {notification.message}
                                </p>
                                
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-muted-foreground">
                                    {format(new Date(notification.createdAt), "dd/MM/yyyy - HH:mm", { locale: ar })}
                                  </span>
                                  
                                  <div className="flex items-center gap-1">
                                    {!notification.read && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 px-2 text-xs"
                                        onClick={() => handleMarkAsRead(notification.id)}
                                      >
                                        <Check className="h-3 w-3 mr-1" />
                                        قراءة
                                      </Button>
                                    )}
                                    
                                    {notification.actionUrl && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 px-2 text-xs"
                                        onClick={() => {
                                          window.location.href = notification.actionUrl!;
                                          setIsOpen(false);
                                        }}
                                      >
                                        عرض
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>

              {['leave', 'attendance', 'payroll'].map(category => (
                <TabsContent key={category} value={category} className="mt-0">
                  <ScrollArea className="h-96">
                    <div className="space-y-1 p-2">
                      {filterNotificationsByCategory(category).map((notification) => {
                        const IconComponent = getNotificationIcon(notification.type);
                        const colorClasses = getNotificationColor(notification.type, notification.priority);
                        
                        return (
                          <div
                            key={notification.id}
                            className={`p-3 rounded-lg border transition-colors hover:bg-gray-50 ${
                              !notification.read ? 'bg-blue-50/50 border-blue-200' : 'bg-white'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`p-2 rounded-full ${colorClasses}`}>
                                <IconComponent className="h-4 w-4" />
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <h4 className={`text-sm font-medium mb-1 ${!notification.read ? 'font-semibold' : ''}`}>
                                  {notification.title}
                                </h4>
                                <p className="text-sm text-muted-foreground mb-2">
                                  {notification.message}
                                </p>
                                <span className="text-xs text-muted-foreground">
                                  {format(new Date(notification.createdAt), "dd/MM/yyyy - HH:mm", { locale: ar })}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
}

export default NotificationCenter;