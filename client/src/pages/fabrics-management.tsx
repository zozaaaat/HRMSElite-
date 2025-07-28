import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Shirt, 
  Palette, 
  Ruler, 
  Package, 
  Calculator,
  TrendingUp,
  Users,
  Truck,
  DollarSign,
  Clock,
  AlertCircle,
  Scissors
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";

export default function FabricsManagement() {
  const [orderForm, setOrderForm] = useState({
    fabricType: "",
    meters: "",
    width: "",
    customerType: "تجزئة"
  });

  const { data: seasonalTrends } = useQuery({
    queryKey: ['/api/fabrics/seasonal-trends'],
  });

  const { data: fabricsInventory = [] } = useQuery({
    queryKey: ['/api/fabrics/inventory/1'], // Company ID 1 - الاتحاد الخليجي
  });

  const handleCalculateOrder = async () => {
    try {
      const response = await fetch('/api/fabrics/calculate-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderForm),
      });
      
      if (response.ok) {
        const calculation = await response.json();
        toast({
          title: "تم حساب الطلب",
          description: `التكلفة النهائية: ${calculation.finalCost} دينار كويتي`,
        });
      }
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل في حساب تكلفة الطلب",
        variant: "destructive"
      });
    }
  };

  const fabricTypes = [
    { value: "حرير طبيعي", label: "حرير طبيعي" },
    { value: "قطن مصري", label: "قطن مصري" },
    { value: "شيفون فرنسي", label: "شيفون فرنسي" },
    { value: "دانتيل إيطالي", label: "دانتيل إيطالي" }
  ];

  const customerTypes = [
    { value: "جملة", label: "جملة" },
    { value: "نصف جملة", label: "نصف جملة" },
    { value: "تجزئة", label: "تجزئة" }
  ];

  return (
    <div className="container mx-auto p-6 space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Shirt className="h-8 w-8 text-blue-500" />
            إدارة الأقمشة والمنسوجات
          </h1>
          <p className="text-muted-foreground">
            نظام شامل لإدارة تجارة الأقمشة مع التوقعات الموسمية
          </p>
        </div>
      </div>

      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="trends">التوقعات الموسمية</TabsTrigger>
          <TabsTrigger value="inventory">المخزون</TabsTrigger>
          <TabsTrigger value="calculator">حاسبة الطلبات</TabsTrigger>
          <TabsTrigger value="reports">التقارير</TabsTrigger>
        </TabsList>

        {/* Seasonal Trends Tab */}
        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                التوقعات الموسمية للأقمشة
              </CardTitle>
            </CardHeader>
            <CardContent>
              {seasonalTrends && (
                <div className="space-y-6">
                  <div className="text-center">
                    <Badge variant="default" className="text-lg px-4 py-2">
                      الموسم الحالي: {seasonalTrends.currentSeason}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="border-l-4 border-l-blue-500">
                      <CardContent className="p-4">
                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                          <Shirt className="h-4 w-4" />
                          الأقمشة الرائجة
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {seasonalTrends.trendingFabrics.map((fabric: string, index: number) => (
                            <Badge key={index} variant="outline">
                              {fabric}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="border-l-4 border-l-purple-500">
                      <CardContent className="p-4">
                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                          <Palette className="h-4 w-4" />
                          الألوان الشائعة
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {seasonalTrends.popularColors.map((color: string, index: number) => (
                            <Badge key={index} variant="secondary">
                              {color}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <Card>
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        توقعات الطلب
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-green-600">طلب عالي</p>
                          {seasonalTrends.demandForecast.high.map((item: string, index: number) => (
                            <Badge key={index} variant="default" className="block w-fit">
                              {item}
                            </Badge>
                          ))}
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-yellow-600">طلب متوسط</p>
                          {seasonalTrends.demandForecast.medium.map((item: string, index: number) => (
                            <Badge key={index} variant="secondary" className="block w-fit">
                              {item}
                            </Badge>
                          ))}
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-red-600">طلب منخفض</p>
                          {seasonalTrends.demandForecast.low.map((item: string, index: number) => (
                            <Badge key={index} variant="outline" className="block w-fit">
                              {item}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Inventory Tab */}
        <TabsContent value="inventory" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                مخزون الأقمشة والمنسوجات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {fabricsInventory.map((fabric: any) => (
                  <Card key={fabric.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Badge variant="outline">{fabric.fabricType}</Badge>
                          <Badge 
                            variant={fabric.quality === 'فاخر' ? 'default' : 
                                    fabric.quality === 'ممتاز جداً' ? 'secondary' : 'outline'}
                          >
                            {fabric.quality}
                          </Badge>
                        </div>
                        
                        <div>
                          <p className="font-medium text-lg">{fabric.color}</p>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Ruler className="h-3 w-3" />
                            العرض: {fabric.width} | الطول: {fabric.length}
                          </p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <p className="text-muted-foreground">السعر للمتر</p>
                            <p className="font-medium text-green-600">{fabric.pricePerMeter} د.ك</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">المورد</p>
                            <p className="font-medium">{fabric.supplier}</p>
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">الاستخدام:</p>
                          <Badge variant="secondary" className="text-xs">
                            {fabric.usage}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center justify-between pt-2">
                          <Button size="sm" variant="outline">
                            <Scissors className="h-3 w-3 ml-1" />
                            طلب قص
                          </Button>
                          <Button size="sm">
                            <Calculator className="h-3 w-3 ml-1" />
                            احسب السعر
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Calculator Tab */}
        <TabsContent value="calculator" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                حاسبة طلبات الأقمشة
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>نوع القماش</Label>
                  <Select 
                    value={orderForm.fabricType} 
                    onValueChange={(value) => setOrderForm({...orderForm, fabricType: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر نوع القماش" />
                    </SelectTrigger>
                    <SelectContent>
                      {fabricTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>الكمية (بالمتر)</Label>
                  <Input
                    type="number"
                    placeholder="أدخل الكمية"
                    value={orderForm.meters}
                    onChange={(e) => setOrderForm({...orderForm, meters: e.target.value})}
                  />
                </div>
                
                <div>
                  <Label>العرض المطلوب (سم)</Label>
                  <Input
                    type="number"
                    placeholder="أدخل العرض"
                    value={orderForm.width}
                    onChange={(e) => setOrderForm({...orderForm, width: e.target.value})}
                  />
                </div>
                
                <div>
                  <Label>نوع العميل</Label>
                  <Select 
                    value={orderForm.customerType} 
                    onValueChange={(value) => setOrderForm({...orderForm, customerType: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر نوع العميل" />
                    </SelectTrigger>
                    <SelectContent>
                      {customerTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex justify-center pt-4">
                <Button 
                  onClick={handleCalculateOrder} 
                  className="w-full md:w-auto px-8"
                  disabled={!orderForm.fabricType || !orderForm.meters || !orderForm.width}
                >
                  <Calculator className="h-4 w-4 ml-2" />
                  احسب التكلفة الإجمالية
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">أنواع الأقمشة</p>
                    <p className="text-2xl font-bold">28 نوع</p>
                  </div>
                  <Shirt className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">إجمالي الأمتار</p>
                    <p className="text-2xl font-bold">1,250 م</p>
                  </div>
                  <Ruler className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">قيمة المخزون</p>
                    <p className="text-2xl font-bold">18,750 د.ك</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">الموردون النشطون</p>
                    <p className="text-2xl font-bold">8</p>
                  </div>
                  <Truck className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>أهم الموردين</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { name: "معامل النسيج التركية", country: "تركيا", rating: "4.9/5" },
                  { name: "مصانع القطن المصرية", country: "مصر", rating: "4.7/5" },
                  { name: "مجموعة الحرير الإيطالية", country: "إيطاليا", rating: "4.8/5" }
                ].map((supplier, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{supplier.name}</p>
                      <p className="text-sm text-muted-foreground">{supplier.country}</p>
                    </div>
                    <Badge variant="secondary">{supplier.rating}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}