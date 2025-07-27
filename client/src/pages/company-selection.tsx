import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

import {
  Building2,
  Users,
  MapPin,
  Search,
  ArrowRight,
  Star,
  Shield,
  Crown,
  Settings
} from "lucide-react";

export default function CompanySelection() {
  const [location, setLocation] = useLocation();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: companies = [] } = useQuery({
    queryKey: ["/api/companies"],
  });

  // Mock companies for demonstration
  const mockCompanies = [
    {
      id: "1",
      name: "شركة التقنية المتقدمة",
      description: "رائدة في حلول تقنية المعلومات والبرمجيات",
      address: "الرياض، المملكة العربية السعودية",
      employeeCount: 450,
      status: "active",
      role: "admin",
      logo: "",
      industry: "تقنية المعلومات"
    },
    {
      id: "2", 
      name: "الشركة التجارية الكبرى",
      description: "متخصصة في التجارة والاستيراد والتصدير",
      address: "جدة، المملكة العربية السعودية",
      employeeCount: 230,
      status: "active",
      role: "manager",
      logo: "",
      industry: "التجارة"
    },
    {
      id: "3",
      name: "المؤسسة الصناعية",
      description: "تصنيع وإنتاج المواد الصناعية والكيميائية",
      address: "الدمام، المملكة العربية السعودية", 
      employeeCount: 680,
      status: "active",
      role: "employee",
      logo: "",
      industry: "الصناعة"
    },
    {
      id: "4",
      name: "مؤسسة الخدمات المالية",
      description: "خدمات مصرفية ومالية متكاملة",
      address: "الرياض، المملكة العربية السعودية",
      employeeCount: 320,
      status: "pending",
      role: "viewer",
      logo: "",
      industry: "المالية"
    }
  ];

  const allCompanies = Array.isArray(companies) ? companies : mockCompanies;
  
  const filteredCompanies = allCompanies.filter(company =>
    company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    company.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin": return <Crown className="h-4 w-4 text-yellow-600" />;
      case "manager": return <Shield className="h-4 w-4 text-blue-600" />;
      case "employee": return <Users className="h-4 w-4 text-green-600" />;
      default: return <Star className="h-4 w-4 text-gray-600" />;
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case "admin": return "مدير عام";
      case "manager": return "مدير";
      case "employee": return "موظف";
      default: return "مشاهد";
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "manager": return "bg-blue-100 text-blue-800 border-blue-200";
      case "employee": return "bg-green-100 text-green-800 border-green-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "suspended": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const handleCompanySelect = (companyId: string, companyName: string) => {
    setLocation(`/login?company=${companyId}&name=${encodeURIComponent(companyName)}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50" dir="rtl">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center">
              <Building2 className="h-8 w-8 text-white" />
            </div>
          </div>
          
          <p className="text-xl text-gray-600 mb-2">اختر الشركة التي تريد إدارتها</p>
        </div>

        {/* Search Bar */}
        <div className="max-w-md mx-auto mb-10">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder="البحث في الشركات..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 py-3 text-lg border-2 border-gray-200 focus:border-blue-500 rounded-xl"
            />
          </div>
        </div>

        

        {/* Companies Grid */}
        <div className="max-w-6xl mx-auto">
          {filteredCompanies.length === 0 ? (
            <Card className="text-center py-16">
              <CardContent>
                <Building2 className="h-20 w-20 mx-auto mb-6 text-gray-300" />
                <h3 className="text-2xl font-semibold text-gray-700 mb-4">لا توجد شركات</h3>
                <p className="text-gray-500 mb-6">
                  {searchQuery ? "لا توجد شركات تطابق بحثك" : "لم يتم تسجيل أي شركات بعد"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredCompanies.map((company: any) => (
                <Card 
                  key={company.id} 
                  className="group hover:shadow-2xl transition-all duration-300 cursor-pointer border-2 hover:border-blue-300 hover:scale-105"
                  onClick={() => handleCompanySelect(company.id, company.name)}
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16">
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xl font-bold">
                            {company.name.split(' ').slice(0, 2).map((n: string) => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-xl line-clamp-2 group-hover:text-blue-600 transition-colors">
                            {company.name}
                          </CardTitle>
                          <p className="text-sm text-gray-500 mt-1">{company.industry}</p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Badge className={`text-xs ${getRoleColor(company.role)}`}>
                          <div className="flex items-center gap-1">
                            {getRoleIcon(company.role)}
                            {getRoleText(company.role)}
                          </div>
                        </Badge>
                        <Badge className={`text-xs ${getStatusColor(company.status)}`}>
                          {company.status === "active" ? "نشطة" : company.status === "pending" ? "قيد المراجعة" : "معلقة"}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {company.description}
                    </p>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <MapPin className="h-4 w-4" />
                        <span className="line-clamp-1">{company.address}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Users className="h-4 w-4" />
                        <span>{company.employeeCount} موظف</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="text-xs text-gray-400">
                        آخر نشاط: منذ {Math.floor(Math.random() * 24)} ساعة
                      </div>
                      <Button 
                        size="sm" 
                        className="gap-2 group-hover:bg-blue-600 group-hover:text-white transition-colors"
                        disabled={company.status !== "active"}
                        onClick={() => setLocation(`/login?company=${company.id}&name=${encodeURIComponent(company.name)}`)}
                      >
                        دخول
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="text-center mt-16 text-gray-500">
          <p className="text-sm">
            نظام إدارة الموارد البشرية • آخر تسجيل دخول: {new Date().toLocaleDateString('ar-SA')}
          </p>
        </div>
      </div>
    </div>
  );
}