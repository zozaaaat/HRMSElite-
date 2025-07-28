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
  Coins, 
  TrendingUp, 
  TrendingDown, 
  Package, 
  Calculator,
  Users,
  Star,
  Weight,
  DollarSign,
  Clock,
  AlertTriangle
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";

export default function GoldManagement() {
  const [orderForm, setOrderForm] = useState({
    goldType: "",
    weight: "",
    category: "",
    stones: []
  });

  const { data: goldPrices } = useQuery({
    queryKey: ['/api/gold/daily-prices'],
  });

  const { data: goldInventory = [] } = useQuery({
    queryKey: ['/api/gold/inventory/1'], // Company ID 1 - النيل الأزرق
  });

  const handleCalculateOrder = async () => {
    try {
      const response = await fetch('/api/gold/calculate-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderForm),
      });
      
      if (response.ok) {
        const calculation = await response.json();
        toast({
          title: "تم حساب الطلب",
          description: `التكلفة الإجمالية: ${calculation.totalCost} دينار كويتي`,
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

  const goldTypes = [
    { value: "ذهب عيار 18", label: "ذهب عيار 18" },
    { value: "ذهب عيار 21", label: "ذهب عيار 21" },
    { value: "ذهب عيار 24", label: "ذهب عيار 24" }
  ];

  const jewelryCategories = [
    { value: "خواتم", label: "خواتم" },
    { value: "أساور", label: "أساور" },
    { value: "قلائد", label: "قلائد" },
    { value: "أقراط", label: "أقراط" },
    { value: "دبل", label: "دبل" },
    { value: "طقم كامل", label: "طقم كامل" }
  ];

  return (
    <div className="container mx-auto p-6 space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Coins className="h-8 w-8 text-yellow-500" />
            إدارة الذهب والمجوهرات
          </h1>
          <p className="text-muted-foreground">
            نظام شامل لإدارة تجارة الذهب والمجوهرات مع الأسعار اليومية
          </p>
        </div>
      </div>

      <Tabs defaultValue="prices" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="prices">أسعار الذهب</TabsTrigger>
          <TabsTrigger value="inventory">المخزون</TabsTrigger>
          <TabsTrigger value="calculator">حاسبة الطلبات</TabsTrigger>
          <TabsTrigger value="reports">التقارير</TabsTrigger>
        </TabsList>

        {/* Gold Prices Tab */}
        <TabsContent value="prices" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                أسعار الذهب اليومية
              </CardTitle>
            </CardHeader>
            <CardContent>
              {goldPrices && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      آخر تحديث: {goldPrices.date}
                    </span>
                    <Badge 
                      variant={goldPrices.trend === 'up' ? 'default' : goldPrices.trend === 'down' ? 'destructive' : 'secondary'}
                      className="flex items-center gap-1"
                    >
                      {goldPrices.trend === 'up' ? <TrendingUp className="h-3 w-3" /> : 
                       goldPrices.trend === 'down' ? <TrendingDown className="h-3 w-3" /> : null}
                      {goldPrices.changePercent}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {Object.entries(goldPrices.prices).map(([type, price]) => (
                      <Card key={type} className="border-l-4 border-l-yellow-500">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">
                                {type === 'gold_18k' ? 'ذهب عيار 18' :
                                 type === 'gold_21k' ? 'ذهب عيار 21' : 'ذهب عيار 24'}
                              </p>
                              <p className="text-sm text-muted-foreground">{(price as any).currency}</p>
                            </div>
                            <div className="text-left">
                              <p className="text-lg font-bold text-green-600">
                                {(price as any).buy} د.ك
                              </p>
                              <p className="text-sm text-muted-foreground">شراء</p>
                            </div>
                            <div className="text-left">
                              <p className="text-lg font-bold text-blue-600">
                                {(price as any).sell} د.ك
                              </p>
                              <p className="text-sm text-muted-foreground">بيع</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
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
                مخزون الذهب والمجوهرات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {goldInventory.map((item: any) => (
                  <Card key={item.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Badge variant="outline">{item.category}</Badge>
                          <Badge variant="secondary">{item.pieces} قطعة</Badge>
                        </div>
                        
                        <div>
                          <p className="font-medium">{item.goldType}</p>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Weight className="h-3 w-3" />
                            {item.weight}
                          </p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <p className="text-muted-foreground">سعر التكلفة</p>
                            <p className="font-medium text-red-600">{item.costPrice} د.ك</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">سعر البيع</p>
                            <p className="font-medium text-green-600">{item.sellingPrice} د.ك</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>آخر تحديث: {item.lastUpdated}</span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            متاح
                          </span>
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
                حاسبة طلبات الذهب والمجوهرات
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>نوع الذهب</Label>
                  <Select 
                    value={orderForm.goldType} 
                    onValueChange={(value) => setOrderForm({...orderForm, goldType: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر نوع الذهب" />
                    </SelectTrigger>
                    <SelectContent>
                      {goldTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>الوزن (بالجرام)</Label>
                  <Input
                    type="number"
                    placeholder="أدخل الوزن"
                    value={orderForm.weight}
                    onChange={(e) => setOrderForm({...orderForm, weight: e.target.value})}
                  />
                </div>
                
                <div>
                  <Label>نوع المجوهرات</Label>
                  <Select 
                    value={orderForm.category} 
                    onValueChange={(value) => setOrderForm({...orderForm, category: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر نوع المجوهرات" />
                    </SelectTrigger>
                    <SelectContent>
                      {jewelryCategories.map(category => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-end">
                  <Button 
                    onClick={handleCalculateOrder} 
                    className="w-full"
                    disabled={!orderForm.goldType || !orderForm.weight || !orderForm.category}
                  >
                    <Calculator className="h-4 w-4 ml-2" />
                    احسب التكلفة
                  </Button>
                </div>
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
                    <p className="text-sm text-muted-foreground">إجمالي المخزون</p>
                    <p className="text-2xl font-bold">55 قطعة</p>
                  </div>
                  <Package className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">قيمة المخزون</p>
                    <p className="text-2xl font-bold">12,500 د.ك</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">العملاء النشطون</p>
                    <p className="text-2xl font-bold">23</p>
                  </div>
                  <Users className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">متوسط التقييم</p>
                    <p className="text-2xl font-bold flex items-center gap-1">
                      4.8 <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    </p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}