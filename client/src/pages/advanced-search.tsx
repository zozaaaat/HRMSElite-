import {useState} from 'react';
import {useLocation} from 'wouter';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Badge} from '@/components/ui/badge';
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs';
import {
  Search,
  Users,
  DollarSign,
  Settings,
  Shield,
  Workflow,
  Smartphone,
  Eye,
  Package,
  Calculator,
  Clock,
  UserCheck,
  TrendingUp,
  Bell,
  ArrowLeft,
  Filter
} from 'lucide-react';
import { t } from "i18next";

// Simple SearchForm Component
const SearchForm = ({
  searchQuery, setSearchQuery
}: {
   searchQuery: string; setSearchQuery: (query: string) => void 
}) => (
  <div className="space-y-4">
    <div className="relative">
      <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder={t('auto.advanced-search.88')}
        className="pl-4 pr-10"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
    </div>
    <div className="flex gap-2">
      <Button variant="outline" size="sm">
        <Filter className="h-4 w-4 mr-2" />
        {t('auto.advanced-search.1')}</Button>
      <Button size="sm">
        <Search className="h-4 w-4 mr-2" />
        {t('auto.advanced-search.2')}</Button>
    </div>
  </div>
);

// Simple SummaryBox Component
const SummaryBox = ({
  totalResults, employeesCount, documentsCount
}: {
   totalResults: number; employeesCount: number; documentsCount: number 
}) => (
  <Card>
    <CardHeader>
      <CardTitle>{t('auto.advanced-search.3')}</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{totalResults}</div>
          <div className="text-sm text-muted-foreground">{t('auto.advanced-search.4')}</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{employeesCount}</div>
          <div className="text-sm text-muted-foreground">{t('auto.advanced-search.5')}</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600">{documentsCount}</div>
          <div className="text-sm text-muted-foreground">{t('auto.advanced-search.6')}</div>
        </div>
      </div>
    </CardContent>
  </Card>
);

// Simple ResultsList Component
const ResultsList = ({accuracy, avgTime, trends}: {
  accuracy: string;
  avgTime: string;
  trends: Array<{ label: string; value: string; variant: 'default' | 'secondary' | 'outline' }>;
}) => (
  <Card>
    <CardHeader>
      <CardTitle>{t('auto.advanced-search.7')}</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm">{t('auto.advanced-search.8')}</span>
          <Badge variant="default">{accuracy}</Badge>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm">{t('auto.advanced-search.9')}</span>
          <Badge variant="secondary">{avgTime}</Badge>
        </div>
        <div className="space-y-2">
          <h4 className="font-medium">{t('auto.advanced-search.10')}</h4>
          {trends.map((trend, index) => (
            <div key={index} className="flex justify-between items-center">
              <span className="text-sm">{trend.label}</span>
              <Badge variant={trend.variant}>{trend.value}</Badge>
            </div>
          ))}
        </div>
      </div>
    </CardContent>
  </Card>
);

// Simple FiltersPanel Component
const FiltersPanel = ({
  options, filters
}: {
   options: string[]; filters: Array<{
   label: string; value: string 
}> 
}) => (
  <Card>
    <CardHeader>
      <CardTitle>{t('auto.advanced-search.11')}</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        <div>
          <h4 className="font-medium mb-2">{t('auto.advanced-search.12')}</h4>
          <div className="space-y-2">
            {options.map((option, index) => (
              <div key={index} className="flex items-center">
                <input type="checkbox" id={`option-${index}`} className="mr-2" />
                <label htmlFor={`option-${index}`} className="text-sm">{option}</label>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h4 className="font-medium mb-2">{t('auto.advanced-search.13')}</h4>
          <div className="space-y-2">
            {filters.map((filter, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-sm">{filter.label}</span>
                <Badge variant="outline">{filter.value}</Badge>
              </div>
            ))}
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default function AdvancedSearchPage () {

  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  // استخراج معلومات من URL (غير مستخدمة حالياً)

  // تحديد نوع الصفحة من المسار
  const path = window.location.pathname;
  let pageType = 'advanced-search';
  let pageTitle = 'البحث المتقدم';
  let pageDescription = 'أدوات بحث متقدمة في النظام';

  if (path.includes('ai-analytics')) {

    pageType = 'ai-analytics';
    pageTitle = 'تحليلات الذكاء الاصطناعي';
    pageDescription = 'تحليلات ذكية وتنبؤات مستقبلية';

  } else if (path.includes('project-management')) {

    pageType = 'project-management';
    pageTitle = 'إدارة المشاريع';
    pageDescription = 'متابعة المشاريع والمهام';

  } else if (path.includes('assets-management')) {

    pageType = 'assets-management';
    pageTitle = 'إدارة الأصول';
    pageDescription = 'إدارة أصول ومعدات الشركة';

  } else if (path.includes('permissions-management')) {

    pageType = 'permissions-management';
    pageTitle = 'إدارة الصلاحيات';
    pageDescription = 'تخصيص صلاحيات الموظفين';

  } else if (path.includes('mobile-apps')) {

    pageType = 'mobile-apps';
    pageTitle = 'التطبيق المحمول';
    pageDescription = 'إدارة التطبيق المحمول للموظفين';

  }

  const handleBack = () => {

    setLocation('/dashboard/worker');

  };

  const getPageContent = () => {

    switch (pageType) {

    case 'ai-analytics':
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                    {t('auto.advanced-search.14')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">94.5%</div>
                    <div className="text-sm text-muted-foreground">{t('auto.advanced-search.15')}</div>
                  </div>
                  <div className="h-32 bg-gradient-to-b from-blue-100 to-blue-200 rounded-lg flex items-end justify-between p-4">
                    {[65, 78, 82, 89, 94, 91, 88].map((value, index) => (
                      <div key={
  index
} className="w-6 bg-blue-600 rounded-t" style={
  {
  'height': `${
  value
}%`
}
} />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                    {t('auto.advanced-search.16')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">{t('auto.advanced-search.17')}</span>
                    <Badge variant="default">425</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">{t('auto.advanced-search.18')}</span>
                    <Badge variant="secondary">23</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">{t('auto.advanced-search.19')}</span>
                    <Badge variant="outline">12</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                    {t('auto.advanced-search.20')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">1,250,000</div>
                    <div className="text-sm text-muted-foreground">{t('auto.advanced-search.21')}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">+12.5%</div>
                    <div className="text-sm text-muted-foreground">{t('auto.advanced-search.22')}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{t('auto.advanced-search.23')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-4">{t('auto.advanced-search.24')}</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>{t('auto.advanced-search.25')}</span>
                      <Badge variant="default">+15</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>{t('auto.advanced-search.26')}</span>
                      <Badge variant="secondary">-3</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>{t('auto.advanced-search.27')}</span>
                      <Badge variant="outline">92%</Badge>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-4">{t('auto.advanced-search.28')}</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>{t('auto.advanced-search.29')}</span>
                      <Badge variant="default">+8%</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>{t('auto.advanced-search.30')}</span>
                      <Badge variant="secondary">+5%</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>{t('auto.advanced-search.31')}</span>
                      <Badge variant="outline">89%</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      );

    case 'project-management':
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Workflow className="h-5 w-5" />
                    {t('auto.advanced-search.32')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">12</div>
                  <div className="text-sm text-muted-foreground">{t('auto.advanced-search.33')}</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                    {t('auto.advanced-search.34')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">89</div>
                  <div className="text-sm text-muted-foreground">{t('auto.advanced-search.35')}</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5" />
                    {t('auto.advanced-search.36')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600">8</div>
                  <div className="text-sm text-muted-foreground">{t('auto.advanced-search.37')}</div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{t('auto.advanced-search.38')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
  'name': 'تطوير النظام الجديد', 'progress': 75, 'team': 'فريق التطوير', 'deadline': '2024-03-15'
},
                  {
  'name': 'تحديث قاعدة البيانات', 'progress': 45, 'team': 'فريق IT', 'deadline': '2024-02-28'
},
                  {
  'name': 'تدريب الموظفين', 'progress': 90, 'team': 'فريق التدريب', 'deadline': '2024-01-30'
}
                ].map((project, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium">{project.name}</h4>
                      <Badge variant={
  project.progress > 70 ? 'default' : project.progress > 40 ? 'secondary' : 'outline'
}>
                        {project.progress}%
                      </Badge>
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>{project.team}</span>
                      <span>{t('auto.advanced-search.39')}{project.deadline}</span>
                    </div>
                    <div className="mt-2 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{'width': `${project.progress}%`}}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      );

    case 'assets-management':
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                    {t('auto.advanced-search.40')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">1,234</div>
                  <div className="text-sm text-muted-foreground">{t('auto.advanced-search.41')}</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                    {t('auto.advanced-search.42')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">2.5M</div>
                  <div className="text-sm text-muted-foreground">{t('auto.advanced-search.43')}</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                    {t('auto.advanced-search.44')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600">1,156</div>
                  <div className="text-sm text-muted-foreground">{t('auto.advanced-search.45')}</div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{t('auto.advanced-search.46')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">{t('auto.advanced-search.47')}</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>{t('auto.advanced-search.48')}</span>
                      <Badge variant="default">456</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>{t('auto.advanced-search.49')}</span>
                      <Badge variant="secondary">89</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>{t('auto.advanced-search.50')}</span>
                      <Badge variant="outline">234</Badge>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="font-medium">{t('auto.advanced-search.51')}</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>{t('auto.advanced-search.52')}</span>
                      <Badge variant="default">567</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>{t('auto.advanced-search.53')}</span>
                      <Badge variant="secondary">123</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>{t('auto.advanced-search.54')}</span>
                      <Badge variant="outline">89</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      );

    case 'permissions-management':
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                    {t('auto.advanced-search.55')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">456</div>
                  <div className="text-sm text-muted-foreground">{t('auto.advanced-search.56')}</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                    {t('auto.advanced-search.57')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">8</div>
                  <div className="text-sm text-muted-foreground">{t('auto.advanced-search.58')}</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                    {t('auto.advanced-search.59')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600">12</div>
                  <div className="text-sm text-muted-foreground">{t('auto.advanced-search.60')}</div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{t('auto.advanced-search.61')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-4">{t('auto.advanced-search.62')}</h4>
                  <div className="space-y-3">
                    {[
                      {'role': 'مدير عام', 'users': 3, 'permissions': 15},
                      {'role': 'مدير شركة', 'users': 12, 'permissions': 12},
                      {'role': 'مشرف', 'users': 25, 'permissions': 10},
                      {'role': 'موظف', 'users': 156, 'permissions': 6},
                      {'role': 'عامل', 'users': 234, 'permissions': 4}
                    ].map((role, index) => (
                      <div key={
  index
} className="flex justify-between items-center p-3 border rounded-lg">
                        <div>
                          <div className="font-medium">{role.role}</div>
                          <div className="text-sm text-muted-foreground">{role.users} {t('auto.advanced-search.63')}</div>
                        </div>
                        <Badge variant="outline">{role.permissions} {t('auto.advanced-search.64')}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-4">{t('auto.advanced-search.65')}</h4>
                  <div className="space-y-3">
                    {[
                      'إدارة الموظفين',
                      'إدارة الرواتب',
                      'إدارة التقارير',
                      'إدارة المستندات',
                      'إدارة الإجازات',
                      'إدارة الحضور',
                      'إدارة الشركات',
                      'إدارة النظام'
                    ].map((permission, index) => (
                      <div key={index} className="flex items-center">
                        <input type="checkbox" id={`permission-${index}`} className="mr-2" />
                        <label htmlFor={
  `permission-${
  index
}`
} className="text-sm">{
  permission
}</label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      );

    case 'mobile-apps':
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5" />
                    {t('auto.advanced-search.66')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">1,234</div>
                  <div className="text-sm text-muted-foreground">{t('auto.advanced-search.67')}</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                    {t('auto.advanced-search.68')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">856</div>
                  <div className="text-sm text-muted-foreground">{t('auto.advanced-search.69')}</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                    {t('auto.advanced-search.70')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600">89%</div>
                  <div className="text-sm text-muted-foreground">{t('auto.advanced-search.71')}</div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{t('auto.advanced-search.72')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-4">{t('auto.advanced-search.73')}</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Android</span>
                      <Badge variant="default">{t('auto.advanced-search.74')}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>iOS</span>
                      <Badge variant="secondary">{t('auto.advanced-search.75')}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>{t('auto.advanced-search.76')}</span>
                      <Badge variant="outline">4.5/5</Badge>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-4">{t('auto.advanced-search.77')}</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>{t('auto.advanced-search.78')}</span>
                      <Badge variant="default">95%</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>{t('auto.advanced-search.79')}</span>
                      <Badge variant="secondary">87%</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>{t('auto.advanced-search.80')}</span>
                      <Badge variant="outline">78%</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      );

    default:
      return (
        <div className="space-y-6">
          <SearchForm searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

          <div className="flex gap-6">
            <div className="w-full md:w-2/3 space-y-6">
              <SummaryBox totalResults={1234} employeesCount={456} documentsCount={678} />
              <ResultsList
                accuracy="89%"
                avgTime="0.3s"
                trends={t('auto.advanced-search.89')}
              />
            </div>
            <div className="w-full md:w-1/3">
              <FiltersPanel
                options={t('auto.advanced-search.90')}
                filters={t('auto.advanced-search.91')}
              />
            </div>
          </div>
        </div>
      );

    }

  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-reverse space-x-4">
              <Button variant="ghost" size="icon" onClick={handleBack}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">{pageTitle}</h1>
                <p className="text-sm text-muted-foreground">{pageDescription}</p>
              </div>
            </div>

            <div className="flex items-center space-x-reverse space-x-2">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t('auto.advanced-search.92')}
                  className="pl-4 pr-10 w-64"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">{t('auto.advanced-search.81')}</TabsTrigger>
            <TabsTrigger value="details">{t('auto.advanced-search.82')}</TabsTrigger>
            <TabsTrigger value="settings">{t('auto.advanced-search.83')}</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {getPageContent()}
          </TabsContent>

          <TabsContent value="details" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('auto.advanced-search.84')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {t('auto.advanced-search.85')}{pageTitle.toLowerCase()}
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('auto.advanced-search.86')}{pageTitle}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {t('auto.advanced-search.87')}{pageTitle.toLowerCase()}
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );

}
