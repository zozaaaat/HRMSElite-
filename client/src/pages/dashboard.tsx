import React, {Suspense} from 'react';
import {PageHelmet} from '@/components/shared/PageHelmet';
import {LoadingFallback} from '@/components/shared/LoadingFallback';
import {useLogger} from '../lib/logger';
import {useQuery} from '@tanstack/react-query';
import type {DashboardStats as DashboardStatsData} from '@/types/component-props';

// Lazy load dashboard components
const DashboardStats = React.lazy(() => import('../components/dashboard/DashboardStats'));
const DashboardCharts = React.lazy(() => import('../components/dashboard/DashboardCharts'));
const DashboardTable = React.lazy(() => import('../components/dashboard/DashboardTable'));

// Lazy load AI chatbot
const Chatbot = React.lazy(() => import('@/components/ai/chatbot'));

interface DashboardProps {
  role?: string;
}

// Define the dashboard data structure
interface DashboardData {
  stats?: DashboardStatsData;
  charts?: {
    line?: Array<{label: string; value: number}>;
    bar?: Array<{label: string; value: number}>;
    pie?: Array<{label: string; value: number}>;
    title?: string;
  };
  table?: {
    title?: string;
    columns?: string[];
    rows?: Array<Record<string, string | number | boolean | null | undefined>>;
  };
}

export default function Dashboard ({role = 'admin'}: DashboardProps) {

  const log = useLogger('Dashboard');

  // Log component mount
  React.useEffect(() => {

    log.info('Dashboard component mounted', {role});
    return () => log.info('Dashboard component unmounted');

  }, [role]);

  // Fetch dashboard data with React Query
  const {data: dashboardData, isLoading, error} = useQuery<DashboardData>({
    queryKey: ['dashboard', role],
    queryFn: async (): Promise<DashboardData> => {

      log.apiRequest('GET', `/api/dashboard/${role}`);
      const response = await fetch(`/api/dashboard/${role}`);
      if (!response.ok) {

        throw new Error('Failed to fetch dashboard data');

      }
      const rawData = await response.json() as unknown;
      const data: DashboardData = rawData as DashboardData;
      log.apiResponse('GET', `/api/dashboard/${role}`, response.status, { success: true, data });
      return data;

    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000 // 10 minutes
  });

  // Log errors
  React.useEffect(() => {

    if (error) {

      log.error('Dashboard data fetch failed', {'error': error.message}, error);

    }

  }, [error]);

  if (isLoading) {

    return <LoadingFallback type="dashboard" message="جاري تحميل لوحة التحكم..." />;

  }

  if (error) {

    return (
      <div className="p-6">
        <div className="text-center space-y-4">
          <h2 className="text-xl font-semibold text-red-600">خطأ في تحميل البيانات</h2>
          <p className="text-muted-foreground">فشل في تحميل بيانات لوحة التحكم</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );

  }

  return (
    <>
      <PageHelmet
        title="لوحة التحكم"
        description="لوحة التحكم الرئيسية لنظام إدارة الموارد البشرية"
        keywords="لوحة التحكم, إحصائيات, تقارير, HRMS"
      />

      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">لوحة التحكم</h1>
            <p className="text-muted-foreground">مرحباً بك في نظام إدارة الموارد البشرية</p>
          </div>
          <div className="text-sm text-muted-foreground">
            الدور: {role}
          </div>
        </div>

        {/* Dashboard Content with Suspense */}
        <Suspense fallback={<LoadingFallback type="card" message="جاري تحميل الإحصائيات..." />}>
          <DashboardStats data={dashboardData?.stats ?? null} />
        </Suspense>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Suspense fallback={
  <LoadingFallback type="card" message="جاري تحميل الرسوم البيانية..." />
}>
            <DashboardCharts data={dashboardData?.charts ?? null} />
          </Suspense>

          <Suspense fallback={<LoadingFallback type="table" message="جاري تحميل الجدول..." />}>
            <DashboardTable data={dashboardData?.table ?? null} />
          </Suspense>
        </div>
      </div>

      {/* AI Chatbot */}
      <Suspense fallback={null}>
        <Chatbot />
      </Suspense>
    </>
  );

}
