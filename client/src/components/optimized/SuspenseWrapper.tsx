import React, {Suspense, ReactNode} from 'react';
import {Card, CardContent} from '../ui/card';
import {Skeleton} from '../ui/skeleton';

interface SuspenseWrapperProps {
  children: ReactNode;
  fallback?: ReactNode;
  type?: 'default' | 'card' | 'list' | 'table' | 'chart';
  message?: string;
}

// Default loading fallback
const DefaultFallback = ({message}: { message?: string | undefined }) => (
  <div className="min-h-screen bg-background flex items-center justify-center p-4">
    <Card className="w-full max-w-md">
      <CardContent className="flex items-center justify-center p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        <span className="mr-3 text-muted-foreground">{message ?? 'جاري التحميل...'}</span>
      </CardContent>
    </Card>
  </div>
);

// Card loading fallback
const CardFallback = () => (
  <Card className="w-full">
    <CardContent className="p-6">
      <div className="space-y-4">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-[90%]" />
          <Skeleton className="h-4 w-[80%]" />
        </div>
        <div className="flex space-x-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-20" />
        </div>
      </div>
    </CardContent>
  </Card>
);

// List loading fallback
const ListFallback = () => (
  <div className="space-y-4">
    {Array.from({'length': 5}).map((_, index) => (
      <Card key={index} className="w-full">
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-[200px]" />
              <Skeleton className="h-3 w-[150px]" />
            </div>
            <Skeleton className="h-8 w-16" />
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);

// Table loading fallback
const TableFallback = () => (
  <div className="space-y-4">
    <div className="flex justify-between items-center">
      <Skeleton className="h-8 w-[200px]" />
      <Skeleton className="h-8 w-[100px]" />
    </div>
    <div className="border rounded-lg">
      <div className="p-4 border-b">
        <div className="grid grid-cols-4 gap-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </div>
      </div>
      {Array.from({'length': 5}).map((_, index) => (
        <div key={index} className="p-4 border-b last:border-b-0">
          <div className="grid grid-cols-4 gap-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Chart loading fallback
const ChartFallback = () => (
  <Card className="w-full">
    <CardContent className="p-6">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-6 w-[150px]" />
          <Skeleton className="h-8 w-[100px]" />
        </div>
        <div className="flex items-end justify-between h-32">
          <Skeleton className="h-16 w-8" />
          <Skeleton className="h-20 w-8" />
          <Skeleton className="h-12 w-8" />
          <Skeleton className="h-24 w-8" />
          <Skeleton className="h-18 w-8" />
          <Skeleton className="h-14 w-8" />
          <Skeleton className="h-22 w-8" />
        </div>
        <div className="flex justify-center space-x-4">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
    </CardContent>
  </Card>
);

// (Removed unused IconFallback component)

// Get appropriate fallback based on type
const getFallbackByType = (type: string, message?: string) => {

  switch (type) {

  case 'card':
    return <CardFallback />;
  case 'list':
    return <ListFallback />;
  case 'table':
    return <TableFallback />;
  case 'chart':
    return <ChartFallback />;
  default:
    return <DefaultFallback message={message} />;

  }

};

// Main Suspense wrapper component
const SuspenseWrapper: React.FC<SuspenseWrapperProps> = ({
  children,
  fallback,
  type = 'default',
  message
}) => {

  const defaultFallback = getFallbackByType(type, message);

  return (
    <Suspense fallback={fallback ?? defaultFallback}>
      {children}
    </Suspense>
  );

};

// Specialized Suspense wrappers for different content types
export const DocumentSuspense = ({
  children, fallback
}: {
   children: ReactNode; fallback?: ReactNode 
}) => (
  <SuspenseWrapper type="list" fallback={fallback}>
    {children}
  </SuspenseWrapper>
);

export const LicenseSuspense = ({
  children, fallback
}: {
   children: ReactNode; fallback?: ReactNode 
}) => (
  <SuspenseWrapper type="card" fallback={fallback}>
    {children}
  </SuspenseWrapper>
);

export const EmployeeSuspense = ({
  children, fallback
}: {
   children: ReactNode; fallback?: ReactNode 
}) => (
  <SuspenseWrapper type="table" fallback={fallback}>
    {children}
  </SuspenseWrapper>
);

export const DashboardSuspense = ({
  children, fallback
}: {
   children: ReactNode; fallback?: ReactNode 
}) => (
  <SuspenseWrapper type="chart" fallback={fallback}>
    {children}
  </SuspenseWrapper>
);

// HOC for wrapping components with Suspense
export const withSuspense = <P extends object>(
  Component: React.ComponentType<P>,
  suspenseProps?: Omit<SuspenseWrapperProps, 'children'>
) => {

  const WrappedComponent = (props: P) => (
    <SuspenseWrapper {...suspenseProps}>
      <Component {...props} />
    </SuspenseWrapper>
  );

  WrappedComponent.displayName = `withSuspense(${Component.displayName ?? Component.name})`;
  return WrappedComponent;

};

// Lazy loading wrapper for dynamic imports
export function lazyLoad(
  importFunc: () => Promise<{ default: React.ComponentType<Record<string, unknown>> }>,
  fallback?: ReactNode
): React.FC<Record<string, unknown>> {

  const LazyComponent = React.lazy(importFunc);

  const Wrapped: React.FC<Record<string, unknown>> = (props) => (
    <SuspenseWrapper fallback={fallback}>
      <LazyComponent {...props} />
    </SuspenseWrapper>
  );

  Wrapped.displayName = 'LazyLoadedComponent';
  return Wrapped;

}

export default SuspenseWrapper;
