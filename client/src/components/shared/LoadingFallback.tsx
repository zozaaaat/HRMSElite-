import React from 'react';
import {cn} from '@/lib/utils';
import {
  Skeleton,
  CardSkeleton,
  TableSkeleton,
  ListSkeleton,
  FormSkeleton,
  DashboardSkeleton
} from '@/components/ui/skeleton';

interface LoadingFallbackProps {
  type?: 'default' | 'card' | 'table' | 'list' | 'form' | 'dashboard' | 'skeleton';
  message?: string;
  className?: string;
  rows?: number;
  items?: number;
  showMessage?: boolean;
}

export function LoadingFallback ({
  type = 'default',
  message = 'جاري تحميل المحتوى...',
  className,
  rows = 5,
  items = 3,
  showMessage = true
}: LoadingFallbackProps) {

  const renderContent = () => {

    switch (type) {

    case 'card':
      return <CardSkeleton />;
    case 'table':
      return <TableSkeleton rows={rows} />;
    case 'list':
      return <ListSkeleton items={items} />;
    case 'form':
      return <FormSkeleton />;
    case 'dashboard':
      return <DashboardSkeleton />;
    case 'skeleton':
      return (
        <div className="space-y-4">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      );
    default:
      return (
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="w-8 h-8 border-3 border-gray-200 border-t-primary rounded-full animate-spin mx-auto" />
            <div className="absolute inset-0 w-8 h-8 border-3 border-transparent border-t-primary/30 rounded-full animate-spin mx-auto"
              style={{'animationDelay': '-0.5s'}} />
          </div>
          {showMessage && (
            <p className="text-sm text-muted-foreground">{message}</p>
          )}
        </div>
      );

    }

  };

  return (
    <div role="status" aria-live="polite" className={cn(
      'flex items-center justify-center p-6',
      type === 'default' && 'min-h-[200px]',
      className
    )}>
      {renderContent()}
    </div>
  );

}

// Specialized loading components
export function PageLoadingFallback () {

  return (
    <div role="status" aria-live="polite" className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-6">
        <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
          <div className="w-8 h-8 bg-primary rounded-full animate-pulse" />
        </div>
        <div className="relative">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-primary rounded-full animate-spin mx-auto" />
        </div>
        <div className="space-y-2">
          <p className="text-lg font-medium text-foreground">جاري تحميل الصفحة...</p>
          <div className="flex justify-center space-x-1">
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={
  {
  'animationDelay': '0s'
}
} />
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={
  {
  'animationDelay': '0.1s'
}
} />
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={
  {
  'animationDelay': '0.2s'
}
} />
          </div>
        </div>
      </div>
    </div>
  );

}

export function ComponentLoadingFallback ({
  message = 'جاري تحميل المكون...',
  className
}: { message?: string; className?: string }) {

  return (
    <div role="status" aria-live="polite" className={cn('flex items-center justify-center p-4', className)}>
      <div className="text-center space-y-3">
        <div className="w-6 h-6 border-2 border-gray-200 border-t-primary rounded-full animate-spin mx-auto" />
        <p className="text-xs text-muted-foreground">{message}</p>
      </div>
    </div>
  );

}

export function OverlayLoadingFallback ({
  message = 'جاري التحميل...',
  className
}: { message?: string; className?: string }) {

  return (
    <div role="status" aria-live="polite" className={cn(
      'fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center',
      className
    )}>
      <div className="text-center space-y-4">
        <div className="w-10 h-10 border-3 border-gray-200 border-t-primary rounded-full animate-spin mx-auto" />
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  );

}
