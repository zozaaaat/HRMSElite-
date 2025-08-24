import {useState} from 'react';
import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {Button} from '../components/ui/button';
import {Card, CardContent, CardHeader, CardTitle} from '../components/ui/card';
import {Tabs, TabsContent, TabsList, TabsTrigger} from '../components/ui/tabs';
import {Badge} from '../components/ui/badge';
import {
  Calculator,
  Link as LinkIcon,
  RefreshCw,
  Settings,
  CheckCircle,
  AlertCircle,
  Clock,
  Database,
  DollarSign,
  FileText,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import {SharedLayout} from '../components/shared-layout';
import {apiRequest} from '@/lib/queryClient';
import {LoadingSpinner} from '../components/shared/LoadingSpinner';
import {ErrorMessage} from '../components/shared/ErrorMessage';
import {AccountingIntegration, FieldMapping} from '../types/component-props';
import { t } from "i18next";

export default function AccountingSystems () {

  return (
    <SharedLayout
      companyName={t('auto.accounting-systems.53')}
    >
      <AccountingSystemsContent />
    </SharedLayout>
  );

}

function AccountingSystemsContent () {

  const [activeTab, setActiveTab] = useState('overview');
  const queryClient = useQueryClient();

  // Fetch accounting integrations
  const {
  'data': integrations = [], 'isLoading': integrationsLoading, 'error': integrationsError
} = useQuery<AccountingIntegration[]>({
  
    'queryKey': ['/api/accounting/integrations']
  });

  // Fetch sync status
  const {'data': syncStatus, 'isLoading': syncLoading} = useQuery<{
    status: string;
    recordsProcessed: number;
    errors: number;
    warnings: number;
    lastRun: string;
    nextRun: string;
    duration: string;
  }>({
    'queryKey': ['/api/accounting/sync-status']
  });

  // Fetch field mapping
  const {'data': mapping = [], 'isLoading': mappingLoading, 'error': mappingError} = useQuery({
    'queryKey': ['/api/accounting/mapping']
  });

  // Sync mutation
  const syncMutation = useMutation({
    'mutationFn': () => apiRequest('/api/accounting/sync', 'POST'),
    'onSuccess': () => {

      queryClient.invalidateQueries({'queryKey': ['/api/accounting/sync-status']});

    }
  });

  const getStatusColor = (status: string) => {

    switch (status) {

    case 'connected': return 'bg-green-500';
    case 'disconnected': return 'bg-red-500';
    case 'pending': return 'bg-yellow-500';
    case 'error': return 'bg-red-500';
    default: return 'bg-gray-500';

    }

  };

  const getStatusText = (status: string) => {

    switch (status) {

    case 'connected': return 'متصل';
    case 'disconnected': return 'غير متصل';
    case 'pending': return 'قيد الإعداد';
    case 'error': return 'خطأ';
    default: return 'غير محدد';

    }

  };

  const getHealthIcon = (health: string) => {

    switch (health) {

    case 'excellent': return <CheckCircle className="h-5 w-5 text-green-500" />;
    case 'good': return <CheckCircle className="h-5 w-5 text-blue-500" />;
    case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    case 'error': return <AlertCircle className="h-5 w-5 text-red-500" />;
    case 'not_connected': return <AlertCircle className="h-5 w-5 text-gray-500" />;
    default: return <AlertCircle className="h-5 w-5 text-gray-500" />;

    }

  };

  const handleSync = () => {

    syncMutation.mutate();

  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('auto.accounting-systems.1')}</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              {t('auto.accounting-systems.2')}</p>
          </div>
          <Button
            onClick={handleSync}
            disabled={syncMutation.isPending}
            className="bg-orange-600 hover:bg-orange-700"
          >
            {syncMutation.isPending ? (
              <RefreshCw className="h-4 w-4 ml-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 ml-2" />
            )}
            {t('auto.accounting-systems.3')}</Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">{t('auto.accounting-systems.4')}</TabsTrigger>
            <TabsTrigger value="integrations">{t('auto.accounting-systems.5')}</TabsTrigger>
            <TabsTrigger value="mapping">{t('auto.accounting-systems.6')}</TabsTrigger>
            <TabsTrigger value="reports">{t('auto.accounting-systems.7')}</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Sync Status Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RefreshCw className="h-5 w-5" />
                  {t('auto.accounting-systems.8')}</CardTitle>
              </CardHeader>
              <CardContent>
                {syncLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto" />
                    <p className="mt-2 text-gray-600">{t('auto.accounting-systems.9')}</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-2">
                        {syncStatus?.status === 'completed' ? (
                          <CheckCircle className="h-8 w-8 text-green-500" />
                        ) : syncStatus?.status === 'running' ? (
                          <RefreshCw className="h-8 w-8 text-blue-500 animate-spin" />
                        ) : (
                          <Clock className="h-8 w-8 text-yellow-500" />
                        )}
                      </div>
                      <p className="font-semibold">
                        {syncStatus?.status === 'completed' ? 'مكتملة'
                          : syncStatus?.status === 'running' ? 'قيد التشغيل' : 'متوقفة'}
                      </p>
                      <p className="text-sm text-gray-600">{t('auto.accounting-systems.10')}</p>
                    </div>

                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">{
  syncStatus?.recordsProcessed ?? 0
}</p>
                      <p className="text-sm text-gray-600">{t('auto.accounting-systems.11')}</p>
                    </div>

                    <div className="text-center">
                      <p className="text-2xl font-bold text-red-600">{syncStatus?.errors ?? 0}</p>
                      <p className="text-sm text-gray-600">{t('auto.accounting-systems.12')}</p>
                    </div>

                    <div className="text-center">
                      <p className="text-2xl font-bold text-yellow-600">{
  syncStatus?.warnings ?? 0
}</p>
                      <p className="text-sm text-gray-600">{t('auto.accounting-systems.13')}</p>
                    </div>
                  </div>
                )}

                {syncStatus && (
                  <div className="mt-6 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>{t('auto.accounting-systems.14')}</span>
                      <span>{new Date(syncStatus.lastRun).toLocaleString('ar-SA')}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>{t('auto.accounting-systems.15')}</span>
                      <span>{new Date(syncStatus.nextRun).toLocaleString('ar-SA')}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>{t('auto.accounting-systems.16')}</span>
                      <span>{syncStatus.duration}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Integration Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6 text-center">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                  <p className="text-2xl font-bold text-green-600">
                    {
  integrations.filter((i: AccountingIntegration) => i.status === 'connected').length
}
                  </p>
                  <p className="text-sm text-gray-600">{t('auto.accounting-systems.17')}</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-3" />
                  <p className="text-2xl font-bold text-red-600">
                    {
  integrations.filter((i: AccountingIntegration) => i.status === 'disconnected').length
}
                  </p>
                  <p className="text-sm text-gray-600">{t('auto.accounting-systems.18')}</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <Clock className="h-12 w-12 text-yellow-500 mx-auto mb-3" />
                  <p className="text-2xl font-bold text-yellow-600">
                    {
  integrations.filter((i: AccountingIntegration) => i.status === 'pending').length
}
                  </p>
                  <p className="text-sm text-gray-600">{t('auto.accounting-systems.19')}</p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>{t('auto.accounting-systems.20')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Button variant="outline" className="h-20 flex flex-col gap-2" onClick={
  handleSync
}>
                    <RefreshCw className="h-6 w-6" />
                    <span>{t('auto.accounting-systems.21')}</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col gap-2">
                    <FileText className="h-6 w-6" />
                    <span>{t('auto.accounting-systems.22')}</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col gap-2">
                    <Settings className="h-6 w-6" />
                    <span>{t('auto.accounting-systems.23')}</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col gap-2">
                    <Database className="h-6 w-6" />
                    <span>{t('auto.accounting-systems.24')}</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="integrations" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">{t('auto.accounting-systems.25')}</h2>
              <Button>
                <LinkIcon className="h-4 w-4 ml-2" />
                {t('auto.accounting-systems.26')}</Button>
            </div>

            {integrationsLoading && <LoadingSpinner text={t('auto.accounting-systems.54')} />}
            {
  integrationsError && <ErrorMessage error={
  integrationsError
} title={t('auto.accounting-systems.55')} onRetry={
  () => window.location.reload()
} />
}
            {!integrationsLoading && !integrationsError && (
              <div className="space-y-6">
                {integrations.map((integration: AccountingIntegration) => (
                  <Card key={integration.id} className="border-2">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-lg">
                            <Calculator className="h-8 w-8 text-orange-600" />
                          </div>
                          <div>
                            <h3 className="text-xl font-semibold">{integration.name}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{
  integration.type
}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getHealthIcon(integration.connectionHealth ?? 'not_connected')}
                          <Badge className={getStatusColor(integration.status)}>
                            {getStatusText(integration.status)}
                          </Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div>
                          <p className="text-sm text-gray-600 mb-1">{t('auto.accounting-systems.27')}</p>
                          <p className="font-semibold">{integration.syncFrequency}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">{t('auto.accounting-systems.28')}</p>
                          <p className="font-semibold">
                            {integration.lastSync
                              ? new Date(integration.lastSync).toLocaleString('ar-SA')
                              : 'لم يتم'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">{t('auto.accounting-systems.29')}</p>
                          <p className="font-semibold">{integration.connectionHealth}</p>
                        </div>
                      </div>

                      <div className="space-y-2 mb-6">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('auto.accounting-systems.30')}</p>
                        <div className="flex flex-wrap gap-2">
                          {(integration.dataTypes ?? []).map((type: string, index: number) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {type === 'employees' ? 'الموظفون'
                                : type === 'payroll' ? 'كشوف المرتبات'
                                  : type === 'expenses' ? 'المصروفات'
                                    : type === 'taxes' ? 'الضرائب'
                                      : type === 'full_integration' ? 'تكامل شامل'
                                        : type === 'basic_payroll' ? 'كشوف أساسية' : type}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {integration.status === 'connected' ? (
                          <>
                            <Button size="sm" variant="outline">
                              <Settings className="h-4 w-4 ml-1" />
                              {t('auto.accounting-systems.31')}</Button>
                            <Button size="sm" variant="outline">
                              <RefreshCw className="h-4 w-4 ml-1" />
                              {t('auto.accounting-systems.32')}</Button>
                            <Button size="sm" variant="outline">
                              <FileText className="h-4 w-4 ml-1" />
                              {t('auto.accounting-systems.33')}</Button>
                          </>
                        ) : (
                          <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
                            <LinkIcon className="h-4 w-4 ml-1" />
                            {t('auto.accounting-systems.34')}</Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="mapping" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">{t('auto.accounting-systems.35')}</h2>
              <Button>
                <Settings className="h-4 w-4 ml-2" />
                {t('auto.accounting-systems.36')}</Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>{t('auto.accounting-systems.37')}</CardTitle>
              </CardHeader>
              <CardContent>
                {mappingLoading && <LoadingSpinner text={t('auto.accounting-systems.56')} />}
                {
  mappingError && <ErrorMessage error={
  mappingError
} title={t('auto.accounting-systems.57')} onRetry={
  () => window.location.reload()
} />
}
                {!mappingLoading && !mappingError && (
                  <div className="space-y-4">
                    {(mapping as FieldMapping[]).map((field: FieldMapping, index: number) => (
                      <div key={
  index
} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded">
                            <Database className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-semibold">
                              {field.hrmsField === 'basicSalary' ? 'الراتب الأساسي'
                                : field.hrmsField === 'allowances' ? 'البدلات'
                                  : field.hrmsField === 'deductions' ? 'الخصومات' : field.hrmsField}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {field.system} → {field.accountingField}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={field.mapped ? 'default' : 'destructive'}>
                            {field.mapped ? 'مربوط' : 'غير مربوط'}
                          </Badge>
                          <Button size="sm" variant="outline">
                            {t('auto.accounting-systems.38')}</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Mapping Guide */}
            <Card>
              <CardHeader>
                <CardTitle>{t('auto.accounting-systems.39')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">{t('auto.accounting-systems.40')}</h4>
                    <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
                      <li>{t('auto.accounting-systems.41')}</li>
                      <li>{t('auto.accounting-systems.42')}</li>
                      <li>{t('auto.accounting-systems.43')}</li>
                      <li>{t('auto.accounting-systems.44')}</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <div className="text-center py-12">
              <TrendingUp className="h-16 w-16 text-orange-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">{t('auto.accounting-systems.45')}</h3>
              <p className="text-muted-foreground mb-4">{t('auto.accounting-systems.46')}</p>
            </div>

            {/* Sample Reports Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="border-dashed border-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                <CardContent className="p-6 text-center">
                  <FileText className="h-8 w-8 text-gray-500 mx-auto mb-3" />
                  <h3 className="font-semibold">{t('auto.accounting-systems.47')}</h3>
                  <p className="text-sm text-gray-600 mt-1">{t('auto.accounting-systems.48')}</p>
                </CardContent>
              </Card>

              <Card className="border-dashed border-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                <CardContent className="p-6 text-center">
                  <DollarSign className="h-8 w-8 text-gray-500 mx-auto mb-3" />
                  <h3 className="font-semibold">{t('auto.accounting-systems.49')}</h3>
                  <p className="text-sm text-gray-600 mt-1">{t('auto.accounting-systems.50')}</p>
                </CardContent>
              </Card>

              <Card className="border-dashed border-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                <CardContent className="p-6 text-center">
                  <AlertTriangle className="h-8 w-8 text-gray-500 mx-auto mb-3" />
                  <h3 className="font-semibold">{t('auto.accounting-systems.51')}</h3>
                  <p className="text-sm text-gray-600 mt-1">{t('auto.accounting-systems.52')}</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );

}
