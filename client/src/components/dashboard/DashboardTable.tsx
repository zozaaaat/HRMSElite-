import React from 'react';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '@/components/ui/table';
import {Skeleton} from '@/components/ui/skeleton';

type Row = Record<string, string | number | boolean | null | undefined>;

interface DashboardTableProps {
  data?: {
    title?: string;
    columns?: string[];
    rows?: Row[];
  } | null;
}

export default function DashboardTable ({data}: DashboardTableProps) {
  const isLoading = !data;

  const columns = data?.columns ?? ['العمود 1', 'العمود 2', 'العمود 3'];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{data?.title ?? 'جدول البيانات'}</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-6 w-28" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((c) => (
                  <TableHead key={c}>{c}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {(data?.rows ?? []).map((row, idx) => (
                <TableRow key={idx}>
                  {columns.map((c) => (
                    <TableCell key={`${idx}-${c}`}>
                      {formatCellValue(row[c])}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

function formatCellValue (value: Row[string]) {
  if (value === null || value === undefined) return '-';
  if (typeof value === 'boolean') return value ? 'نعم' : 'لا';
  return String(value);
}


