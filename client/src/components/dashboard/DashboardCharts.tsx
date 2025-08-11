import React from 'react';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Skeleton} from '@/components/ui/skeleton';

type SeriesPoint = { label: string; value: number };

interface DashboardChartsProps {
  data?: {
    line?: SeriesPoint[];
    bar?: SeriesPoint[];
    pie?: SeriesPoint[];
    title?: string;
  } | null;
}

export default function DashboardCharts ({data}: DashboardChartsProps) {
  const isLoading = !data;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{data?.title ?? 'الرسوم البيانية'}</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-40 w-full" />
          </div>
        ) : (
          <div className="text-muted-foreground text-sm">
            {/* Placeholder rendering; integrate real charts later */}
            <div className="mb-3 font-medium text-foreground">بيانات الخط:</div>
            <ul className="list-disc mr-5 mb-4">
              {data?.line?.map((p) => (
                <li key={`l-${p.label}`}>{p.label}: {p.value}</li>
              ))}
            </ul>
            <div className="mb-3 font-medium text-foreground">بيانات الأعمدة:</div>
            <ul className="list-disc mr-5 mb-4">
              {data?.bar?.map((p) => (
                <li key={`b-${p.label}`}>{p.label}: {p.value}</li>
              ))}
            </ul>
            <div className="mb-3 font-medium text-foreground">بيانات الدائرة:</div>
            <ul className="list-disc mr-5">
              {data?.pie?.map((p) => (
                <li key={`p-${p.label}`}>{p.label}: {p.value}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}


