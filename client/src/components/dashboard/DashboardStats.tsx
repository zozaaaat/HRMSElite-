import React from 'react';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Skeleton} from '@/components/ui/skeleton';
import {useTranslation} from 'react-i18next';
import type {DashboardStats as DashboardStatsData} from '@/types/component-props';

interface DashboardStatsProps {
  data?: DashboardStatsData | null;
}

export default function DashboardStats ({data}: DashboardStatsProps) {
  const isLoading = !data;
  const {t} = useTranslation();

  const statItems = [
    {label: t('dashboard.stats.totalCompanies'), value: data?.totalCompanies},
    {label: t('dashboard.stats.activeCompanies'), value: data?.activeCompanies},
    {label: t('dashboard.stats.totalEmployees'), value: data?.totalEmployees},
    {label: t('dashboard.stats.activeEmployees'), value: data?.activeEmployees},
    {label: t('dashboard.stats.totalLicenses'), value: data?.totalLicenses},
    {label: t('dashboard.stats.activeLicenses'), value: data?.activeLicenses},
    {label: t('dashboard.stats.systemUsage'), value: data?.systemUsage}
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {statItems.map((item) => (
        <Card key={item.label} className="h-full">
          <CardHeader>
            <CardTitle className="text-base font-medium text-muted-foreground">
              {item.label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold text-foreground">
                {item.value ?? '-'}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}


