import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { Activity, Database, Shield, Server } from "lucide-react";

interface HealthData {
  status: string;
  uptime: number;
  timestamp: string;
  services: {
    database: string;
    api: string;
    auth: string;
  };
}

export function SystemHealth() {
  const { data: health } = useQuery<HealthData>({
    queryKey: ["/api/system/health"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (!health) return null;

  const getStatusColor = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case "healthy":
      case "connected":
      case "operational":
      case "active":
        return "default";
      case "warning":
        return "secondary";
      case "error":
        return "destructive";
      default:
        return "outline";
    }
  };

  const formatUptime = (uptime: number) => {
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          حالة النظام
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span>الحالة العامة</span>
          <Badge variant={getStatusColor(health.status)}>
            {health.status === "healthy" ? "صحي" : health.status}
          </Badge>
        </div>
        
        <div className="flex items-center justify-between">
          <span>وقت التشغيل</span>
          <span className="text-sm text-muted-foreground">
            {formatUptime(health.uptime)}
          </span>
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-medium">الخدمات</h4>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              <span className="text-sm">قاعدة البيانات</span>
            </div>
            <Badge variant={getStatusColor(health.services.database)}>
              {health.services.database === "connected" ? "متصلة" : health.services.database}
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Server className="h-4 w-4" />
              <span className="text-sm">واجهة البرمجة</span>
            </div>
            <Badge variant={getStatusColor(health.services.api)}>
              {health.services.api === "operational" ? "تعمل" : health.services.api}
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span className="text-sm">المصادقة</span>
            </div>
            <Badge variant={getStatusColor(health.services.auth)}>
              {health.services.auth === "active" ? "نشطة" : health.services.auth}
            </Badge>
          </div>
        </div>

        <div className="text-xs text-muted-foreground">
          آخر تحديث: {new Date(health.timestamp).toLocaleTimeString('ar-EG')}
        </div>
      </CardContent>
    </Card>
  );
}