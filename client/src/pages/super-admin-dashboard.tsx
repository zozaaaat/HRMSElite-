import {useState} from 'react';
import {useQuery} from '@tanstack/react-query';
import {useAuth} from '../hooks/useAuth';
import {CompanyWithStats} from '../../../shared/schema';
import {useLocation} from 'wouter';
import {SharedLayout} from '../components/shared-layout';
import {Button} from '../components/ui/button';
import {Input} from '../components/ui/input';
import {Card, CardContent} from '../components/ui/card';
import {Tabs, TabsContent, TabsList, TabsTrigger} from '../components/ui/tabs';
import {
  Building2,
  Users,
  BarChart3,
  Settings,
  Plus,
  Search,
  FileText
} from 'lucide-react';
import {StatsCard} from '@/components/stats-card';
import {CompanyCard} from '../components/company-card';
import { t } from "i18next";

export default function SuperAdminDashboard () {

  const {_user: _unused} = { _user: useAuth().user };
  return (
    <SharedLayout>
      <SuperAdminContent />
    </SharedLayout>
  );

}

function SuperAdminContent () {

  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  const {'data': stats, 'isLoading': _statsLoading, 'error': _statsError} = useQuery<{
    totalCompanies: number;
    totalEmployees: number;
    totalRevenue: number;
    activeUsers: number;
  }>({
    'queryKey': ['/api/super-admin/stats']
  });

  const {
  'data': companies = [], 'isLoading': _companiesLoading, 'error': _companiesError
} = useQuery<CompanyWithStats[]>({
  
    'queryKey': ['/api/super-admin/companies']
  });

  const filteredCompanies = companies.filter((company: CompanyWithStats) =>
    company?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false
  );

  const handleLogout = () => {

    setLocation('/');

  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-reverse space-x-4">
              <img
                src="/logo.svg"
                alt="Zeylab Logo"
                className="w-10 h-10 object-contain"
                decoding="async"
                fetchPriority="high"
                width="40"
                height="40"
              />
              <div>
                <h1 className="text-2xl font-bold text-foreground">Zeylab HRMS</h1>
                <p className="text-sm text-muted-foreground">{t('auto.super-admin-dashboard.1')}</p>
              </div>
            </div>

            <div className="flex items-center space-x-reverse space-x-2">
              <Button variant="outline" size="sm" onClick={handleLogout}>
                {t('auto.super-admin-dashboard.2')}</Button>
            </div>
          </div>
        </div>
      </header>

      <div className="bg-muted/20 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-wrap gap-2 justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveTab('companies')}
              className="gap-2 hover:bg-blue-50 hover:border-blue-300"
            >
              <Building2 className="h-4 w-4" />
              {t('auto.super-admin-dashboard.3')}</Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLocation('/employees')}
              className="gap-2 hover:bg-green-50 hover:border-green-300"
            >
              <Users className="h-4 w-4" />
              {t('auto.super-admin-dashboard.4')}</Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLocation('/reports')}
              className="gap-2 hover:bg-yellow-50 hover:border-yellow-300"
            >
              <BarChart3 className="h-4 w-4" />
              {t('auto.super-admin-dashboard.5')}</Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLocation('/settings')}
              className="gap-2 hover:bg-gray-50 hover:border-gray-300"
            >
              <Settings className="h-4 w-4" />
              {t('auto.super-admin-dashboard.6')}</Button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">{t('auto.super-admin-dashboard.7')}</TabsTrigger>
            <TabsTrigger value="companies">{t('auto.super-admin-dashboard.8')}</TabsTrigger>
            <TabsTrigger value="system">{t('auto.super-admin-dashboard.9')}</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatsCard
                title={t('auto.super-admin-dashboard.19')}
                value={companies.length}
                icon="building"
                color="blue"
              />
              <StatsCard
                title={t('auto.super-admin-dashboard.20')}
                value={stats?.totalEmployees ?? 0}
                icon="users"
                color="green"
              />
              <StatsCard
                title={t('auto.super-admin-dashboard.21')}
                value={stats?.activeUsers ?? 0}
                icon="users"
                color="orange"
              />
              <StatsCard
                title={t('auto.super-admin-dashboard.22')}
                value={1}
                icon="check"
                color="purple"
              />
            </div>
          </TabsContent>

          <TabsContent value="companies" className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <h2 className="text-2xl font-bold">{t('auto.super-admin-dashboard.10')}</h2>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder={t('auto.super-admin-dashboard.23')}
                    className="pl-4 pr-10 w-64"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button onClick={() => setLocation('/companies')} className="gap-2">
                  <Plus className="h-4 w-4" />
                  {t('auto.super-admin-dashboard.11')}</Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCompanies.map((company: CompanyWithStats) => (
                <CompanyCard
                  key={company.id}
                  company={company}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="system" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <StatsCard
                title={t('auto.super-admin-dashboard.24')}
                value={1}
                icon="check"
                color="green"
              />
              <StatsCard
                title={t('auto.super-admin-dashboard.25')}
                value={78}
                icon="users"
                color="blue"
              />
              <StatsCard
                title={t('auto.super-admin-dashboard.26')}
                value={1}
                icon="check"
                color="green"
              />
              <StatsCard
                title={t('auto.super-admin-dashboard.27')}
                value={29}
                icon="certificate"
                color="purple"
              />
            </div>

            <h2 className="text-2xl font-bold">{t('auto.super-admin-dashboard.12')}</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={
  () => setLocation('/settings')
}>
                <CardContent className="p-6 text-center">
                  <Settings className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">{t('auto.super-admin-dashboard.13')}</h3>
                  <p className="text-sm text-muted-foreground">{t('auto.super-admin-dashboard.14')}</p>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={
  () => setLocation('/employees')
}>
                <CardContent className="p-6 text-center">
                  <Users className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">{t('auto.super-admin-dashboard.15')}</h3>
                  <p className="text-sm text-muted-foreground">{t('auto.super-admin-dashboard.16')}</p>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={
  () => setLocation('/reports')
}>
                <CardContent className="p-6 text-center">
                  <FileText className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">{t('auto.super-admin-dashboard.17')}</h3>
                  <p className="text-sm text-muted-foreground">{t('auto.super-admin-dashboard.18')}</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );

}
