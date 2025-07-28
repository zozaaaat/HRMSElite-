import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import {
  Bell,
  AlertTriangle,
  CheckCircle,
  Info,
  Calendar,
  Users,
  Clock,
  X,
  MoreHorizontal,
  Settings,
  Filter,
  Search
} from "lucide-react";

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationCenter({ isOpen, onClose }: NotificationCenterProps) {
  const [activeTab, setActiveTab] = useState("all");

  // Mock notifications data
  const notifications = [
    {
      id: 1,
      type: "urgent",
      title: "تنبيه: انتهاء صلاحية رخصة الشركة",
      message: "ستنتهي صلاحية رخصة شركة التقنية المتقدمة خلال 7 أيام",
      timestamp: "منذ 10 دقائق",
      read: false,
      company: "التقنية المتقدمة",
      category: "licenses"
    },
    {
      id: 2,
      type: "info",
      title: "طلب إجازة جديد",
      message: "تم تقديم طلب إجازة من أحمد محمد للمراجعة",
      timestamp: "منذ 30 دقيقة",
      read: false,
      company: "الشركة التجارية",
      category: "leave"
    },
    {
      id: 3,
      type: "success",
      title: "تم تسجيل موظف جديد",
      message: "تم تسجيل فاطمة علي بنجاح في قسم الموارد البشرية",
      timestamp: "منذ ساعة",
      read: true,
      company: "المؤسسة الصناعية",
      category: "employee"
    },
    {
      id: 4,
      type: "warning",
      title: "تحديث نظام الحضور",
      message: "يتطلب نظام الحضور تحديث لضمان الأمان",
      timestamp: "منذ 2 ساعة",
      read: false,
      company: "جميع الشركات",
      category: "system"
    },
    {
      id: 5,
      type: "info",
      title: "تقرير الأداء الشهري",
      message: "تقرير أداء شهر يناير جاهز للمراجعة",
      timestamp: "منذ 3 ساعات",
      read: true,
      company: "الشركة التجارية",
      category: "reports"
    }
  ];

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'urgent':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'info':
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'urgent':
        return 'border-red-200 bg-red-50';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'info':
      default:
        return 'border-blue-200 bg-blue-50';
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'urgent': return 'عاجل';
      case 'warning': return 'تحذير';
      case 'success': return 'نجح';
      case 'info': return 'معلومة';
      default: return 'عام';
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    switch (activeTab) {
      case 'unread':
        return !notification.read;
      case 'urgent':
        return notification.type === 'urgent' || notification.type === 'warning';
      case 'all':
      default:
        return true;
    }
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-blue-600" />
              مركز الإشعارات
              {unreadCount > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {unreadCount}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => console.log('إعدادات الإشعارات')}>
                <Settings className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => console.log('فلترة الإشعارات')}>
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </DialogTitle>
          <DialogDescription>
            عرض وإدارة جميع الإشعارات والتنبيهات الخاصة بالنظام
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">
              الكل ({notifications.length})
            </TabsTrigger>
            <TabsTrigger value="unread">
              غير مقروءة ({unreadCount})
            </TabsTrigger>
            <TabsTrigger value="urgent">
              عاجل ({notifications.filter(n => n.type === 'urgent' || n.type === 'warning').length})
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 mt-4">
            <TabsContent value={activeTab} className="m-0 h-full">
              <ScrollArea className="h-[500px] pr-4">
                {filteredNotifications.length === 0 ? (
                  <div className="text-center py-12">
                    <Bell className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
                    <h3 className="text-lg font-medium mb-2">لا توجد إشعارات</h3>
                    <p className="text-sm text-muted-foreground">
                      {activeTab === 'unread' ? 'جميع الإشعارات مقروءة' : 'لا توجد إشعارات في هذا القسم'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredNotifications.map((notification) => (
                      <Card 
                        key={notification.id} 
                        className={`cursor-pointer transition-all hover:shadow-md ${
                          notification.read ? 'opacity-70' : ''
                        } ${getNotificationColor(notification.type)}`}
                        onClick={() => console.log('فتح إشعار:', notification.title)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="mt-1">
                              {getNotificationIcon(notification.type)}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1">
                                  <h4 className="font-medium text-sm text-foreground line-clamp-1">
                                    {notification.title}
                                  </h4>
                                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                    {notification.message}
                                  </p>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="text-xs">
                                    {getTypeText(notification.type)}
                                  </Badge>
                                  {!notification.read && (
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                  )}
                                </div>
                              </div>
                              
                              <div className="flex items-center justify-between mt-3">
                                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {notification.timestamp}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Users className="h-3 w-3" />
                                    {notification.company}
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-1">
                                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={(e) => {e.stopPropagation(); console.log('خيارات إضافية:', notification.title);}}>
                                    <MoreHorizontal className="h-3 w-3" />
                                  </Button>
                                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={(e) => {e.stopPropagation(); console.log('حذف إشعار:', notification.title);}}>
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          </div>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => console.log('تسجيل الكل كمقروء')}>
              <CheckCircle className="h-4 w-4 ml-2" />
              تسجيل الكل كمقروء
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => console.log('فتح إعدادات الإشعارات')}>
              <Settings className="h-4 w-4 ml-2" />
              إعدادات الإشعارات
            </Button>
            <Button onClick={onClose}>
              إغلاق
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}