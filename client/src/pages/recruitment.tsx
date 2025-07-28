import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  UserPlus, 
  Search, 
  Briefcase,
  Users,
  Calendar,
  FileText,
  Eye,
  Download,
  Mail,
  Phone,
  MapPin,
  DollarSign
} from "lucide-react";
import { SharedLayout } from "@/components/shared-layout";

interface JobPosting {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  experience: string;
  salary: string;
  postedDate: string;
  status: string;
  applicants: number;
}

interface Applicant {
  id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  experience: string;
  education: string;
  applicationDate: string;
  status: string;
  rating: number;
  cv?: string;
}

export default function RecruitmentPage() {
  return (
    <SharedLayout 
      userRole="company_manager" 
      userName="مدير الشركة" 
      companyName="شركة النيل الأزرق للمجوهرات"
    >
      <RecruitmentContent />
    </SharedLayout>
  );
}

function RecruitmentContent() {
  const { toast } = useToast();
  const [showNewJobDialog, setShowNewJobDialog] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);
  const [jobFormData, setJobFormData] = useState({
    title: "",
    department: "",
    location: "",
    type: "",
    experience: "",
    salary: "",
    description: "",
    requirements: ""
  });

  const jobPostings: JobPosting[] = [
    {
      id: "1",
      title: "مطور واجهات أمامية",
      department: "تقنية المعلومات",
      location: "الرياض",
      type: "دوام كامل",
      experience: "3-5 سنوات",
      salary: "15,000 - 20,000 ريال",
      postedDate: "2025-01-20",
      status: "active",
      applicants: 12
    },
    {
      id: "2",
      title: "محاسب أول",
      department: "المالية",
      location: "جدة",
      type: "دوام كامل",
      experience: "5+ سنوات",
      salary: "12,000 - 18,000 ريال",
      postedDate: "2025-01-15",
      status: "active",
      applicants: 8
    },
    {
      id: "3",
      title: "أخصائي موارد بشرية",
      department: "الموارد البشرية",
      location: "الدمام",
      type: "دوام جزئي",
      experience: "2-3 سنوات",
      salary: "8,000 - 12,000 ريال",
      postedDate: "2025-01-10",
      status: "closed",
      applicants: 25
    }
  ];

  const applicants: Applicant[] = [
    {
      id: "1",
      name: "عبدالله محمد السعيد",
      email: "abdullah@example.com",
      phone: "+966 55 123 4567",
      position: "مطور واجهات أمامية",
      experience: "4 سنوات",
      education: "بكالوريوس علوم الحاسب",
      applicationDate: "2025-01-22",
      status: "screening",
      rating: 4.5
    },
    {
      id: "2",
      name: "نورا أحمد الشمري",
      email: "nora@example.com",
      phone: "+966 50 987 6543",
      position: "محاسب أول",
      experience: "6 سنوات",
      education: "بكالوريوس محاسبة",
      applicationDate: "2025-01-18",
      status: "interview",
      rating: 4.8
    },
    {
      id: "3",
      name: "فيصل عبدالرحمن القرني",
      email: "faisal@example.com",
      phone: "+966 54 555 1234",
      position: "أخصائي موارد بشرية",
      experience: "3 سنوات",
      education: "بكالوريوس إدارة أعمال",
      applicationDate: "2025-01-12",
      status: "rejected",
      rating: 3.2
    }
  ];

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      active: { label: "نشط", variant: "default" },
      closed: { label: "مغلق", variant: "secondary" },
      screening: { label: "قيد المراجعة", variant: "outline" },
      interview: { label: "مقابلة", variant: "default" },
      rejected: { label: "مرفوض", variant: "destructive" },
      hired: { label: "تم التوظيف", variant: "default" }
    };
    
    const statusInfo = statusMap[status] || { label: status, variant: "outline" };
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  const handlePostJob = () => {
    toast({
      title: "تم نشر الوظيفة",
      description: "تم نشر الوظيفة بنجاح وستظهر في البوابة",
    });
    setShowNewJobDialog(false);
    setJobFormData({
      title: "",
      department: "",
      location: "",
      type: "",
      experience: "",
      salary: "",
      description: "",
      requirements: ""
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">التوظيف والاستقطاب</h1>
          <p className="text-muted-foreground mt-2">
            إدارة الوظائف الشاغرة وطلبات التوظيف
          </p>
        </div>
        
        <Dialog open={showNewJobDialog} onOpenChange={setShowNewJobDialog}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <UserPlus className="h-4 w-4" />
              نشر وظيفة جديدة
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>نشر وظيفة جديدة</DialogTitle>
              <DialogDescription>
                املأ تفاصيل الوظيفة المطلوبة
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">المسمى الوظيفي</Label>
                  <Input
                    id="title"
                    value={jobFormData.title}
                    onChange={(e) => setJobFormData({ ...jobFormData, title: e.target.value })}
                    placeholder="مثال: مطور برمجيات"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="department">القسم</Label>
                  <Select value={jobFormData.department} onValueChange={(v) => setJobFormData({ ...jobFormData, department: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر القسم" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="it">تقنية المعلومات</SelectItem>
                      <SelectItem value="hr">الموارد البشرية</SelectItem>
                      <SelectItem value="finance">المالية</SelectItem>
                      <SelectItem value="marketing">التسويق</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location">الموقع</Label>
                  <Input
                    id="location"
                    value={jobFormData.location}
                    onChange={(e) => setJobFormData({ ...jobFormData, location: e.target.value })}
                    placeholder="مثال: الرياض"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="type">نوع الوظيفة</Label>
                  <Select value={jobFormData.type} onValueChange={(v) => setJobFormData({ ...jobFormData, type: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر النوع" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full">دوام كامل</SelectItem>
                      <SelectItem value="part">دوام جزئي</SelectItem>
                      <SelectItem value="contract">عقد مؤقت</SelectItem>
                      <SelectItem value="remote">عن بعد</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="experience">سنوات الخبرة</Label>
                  <Input
                    id="experience"
                    value={jobFormData.experience}
                    onChange={(e) => setJobFormData({ ...jobFormData, experience: e.target.value })}
                    placeholder="مثال: 3-5 سنوات"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="salary">نطاق الراتب</Label>
                  <Input
                    id="salary"
                    value={jobFormData.salary}
                    onChange={(e) => setJobFormData({ ...jobFormData, salary: e.target.value })}
                    placeholder="مثال: 10,000 - 15,000 ريال"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">وصف الوظيفة</Label>
                <Textarea
                  id="description"
                  value={jobFormData.description}
                  onChange={(e) => setJobFormData({ ...jobFormData, description: e.target.value })}
                  placeholder="اكتب وصف تفصيلي للوظيفة..."
                  rows={4}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="requirements">المتطلبات</Label>
                <Textarea
                  id="requirements"
                  value={jobFormData.requirements}
                  onChange={(e) => setJobFormData({ ...jobFormData, requirements: e.target.value })}
                  placeholder="اكتب متطلبات الوظيفة..."
                  rows={4}
                />
              </div>
              
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowNewJobDialog(false)}>
                  إلغاء
                </Button>
                <Button onClick={handlePostJob}>
                  نشر الوظيفة
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* إحصائيات التوظيف */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              الوظائف النشطة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">من أصل 3 وظائف</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              إجمالي المتقدمين
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45</div>
            <p className="text-xs text-muted-foreground">هذا الشهر</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              المقابلات المجدولة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">هذا الأسبوع</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              تم التوظيف
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">هذا الشهر</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="jobs" className="space-y-4">
        <TabsList>
          <TabsTrigger value="jobs">الوظائف الشاغرة</TabsTrigger>
          <TabsTrigger value="applicants">المتقدمون</TabsTrigger>
          <TabsTrigger value="interviews">المقابلات</TabsTrigger>
        </TabsList>

        <TabsContent value="jobs">
          <Card>
            <CardHeader>
              <CardTitle>الوظائف الشاغرة</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">المسمى الوظيفي</TableHead>
                    <TableHead className="text-right">القسم</TableHead>
                    <TableHead className="text-right">الموقع</TableHead>
                    <TableHead className="text-right">النوع</TableHead>
                    <TableHead className="text-right">الخبرة</TableHead>
                    <TableHead className="text-right">المتقدمون</TableHead>
                    <TableHead className="text-right">الحالة</TableHead>
                    <TableHead className="text-right">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {jobPostings.map((job) => (
                    <TableRow key={job.id}>
                      <TableCell className="font-medium">{job.title}</TableCell>
                      <TableCell>{job.department}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {job.location}
                        </div>
                      </TableCell>
                      <TableCell>{job.type}</TableCell>
                      <TableCell>{job.experience}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{job.applicants} متقدم</Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(job.status)}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="applicants">
          <Card>
            <CardHeader>
              <CardTitle>المتقدمون للوظائف</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">الاسم</TableHead>
                    <TableHead className="text-right">الوظيفة</TableHead>
                    <TableHead className="text-right">الخبرة</TableHead>
                    <TableHead className="text-right">التعليم</TableHead>
                    <TableHead className="text-right">تاريخ التقديم</TableHead>
                    <TableHead className="text-right">الحالة</TableHead>
                    <TableHead className="text-right">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {applicants.map((applicant) => (
                    <TableRow key={applicant.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{applicant.name}</div>
                          <div className="text-sm text-muted-foreground">{applicant.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>{applicant.position}</TableCell>
                      <TableCell>{applicant.experience}</TableCell>
                      <TableCell>{applicant.education}</TableCell>
                      <TableCell>{applicant.applicationDate}</TableCell>
                      <TableCell>{getStatusBadge(applicant.status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="interviews">
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">جدول المقابلات قيد التطوير...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}