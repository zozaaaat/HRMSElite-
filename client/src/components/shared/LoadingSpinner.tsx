import {cn} from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | undefined;
  className?: string | undefined;
  text?: string | undefined;
}

export function LoadingSpinner ({
  size = 'md',
  className,
  text = 'جاري التحميل...'
}: LoadingSpinnerProps) {

  const sizeClasses = {
    'sm': 'w-4 h-4',
    'md': 'w-8 h-8',
    'lg': 'w-12 h-12'
  };

  const textSizeClasses = {
    'sm': 'text-xs',
    'md': 'text-sm',
    'lg': 'text-base'
  };

  return (
    <div role="status" aria-live="polite" className={cn('flex flex-col items-center justify-center gap-3', className)}>
      <div
        className={cn(
          'animate-spin rounded-full border-2 border-gray-300 border-t-primary',
          sizeClasses[size]
        )}
      />
      {text && (
        <p className={cn('text-muted-foreground text-center', textSizeClasses[size])}>
          {text}
        </p>
      )}
    </div>
  );

}

// مكون للتحميل في وسط الشاشة
export function FullScreenLoader ({text}: { text?: string | undefined }) {

  return (
    <div role="status" aria-live="polite" className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <LoadingSpinner size="lg" text={text} />
    </div>
  );

}

// مكون للتحميل في منطقة محددة
export function SectionLoader ({text}: { text?: string | undefined }) {

  return (
    <div role="status" aria-live="polite" className="flex items-center justify-center py-12">
      <LoadingSpinner size="md" text={text} />
    </div>
  );

}

// مكون للتحميل في الجدول
export function TableLoader () {

  return (
    <div role="status" aria-live="polite" className="flex items-center justify-center py-8">
      <LoadingSpinner size="sm" text="جاري تحميل البيانات..." />
    </div>
  );

}
