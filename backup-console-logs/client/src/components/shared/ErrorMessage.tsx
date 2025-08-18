import {AlertCircle, RefreshCw} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Alert, AlertDescription, AlertTitle} from '@/components/ui/alert';
import {cn} from '@/lib/utils';

interface ErrorMessageProps {
  error: Error | string | null;
  onRetry?: (() => void) | undefined;
  className?: string | undefined;
  title?: string | undefined;
  showRetry?: boolean | undefined;
}

export function ErrorMessage ({
  error,
  onRetry,
  className,
  title = 'حدث خطأ',
  showRetry = true
}: ErrorMessageProps) {

  if (!error) {

    return null;

  }

  const errorMessage = typeof error === 'string' ? error : error.message;

  return (
    <Alert variant="destructive" className={
  cn('border-red-200 bg-red-50 dark:bg-red-950/20', className)
}>
      <AlertCircle className="h-4 w-4" />
      <AlertTitle className="text-red-800 dark:text-red-200">{title}</AlertTitle>
      <AlertDescription className="text-red-700 dark:text-red-300 mt-2">
        {errorMessage}
      </AlertDescription>
      {showRetry && onRetry && (
        <div className="mt-3">
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="border-red-300 text-red-700 hover:bg-red-100 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-900/20"
          >
            <RefreshCw className="h-4 w-4 ml-2" />
            إعادة المحاولة
          </Button>
        </div>
      )}
    </Alert>
  );

}

// مكون للخطأ في وسط الشاشة
export function FullScreenError ({
  error,
  onRetry
}: {
  error: Error | string | null;
  onRetry?: (() => void) | undefined;
}) {

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <ErrorMessage
          error={error}
          onRetry={onRetry}
          title="خطأ في تحميل البيانات"
        />
      </div>
    </div>
  );

}

// مكون للخطأ في منطقة محددة
export function SectionError ({
  error,
  onRetry
}: {
  error: Error | string | null;
  onRetry?: (() => void) | undefined;
}) {

  return (
    <div className="flex items-center justify-center py-12">
      <div className="max-w-md w-full">
        <ErrorMessage
          error={error}
          onRetry={onRetry}
          title="خطأ في تحميل البيانات"
        />
      </div>
    </div>
  );

}

// مكون للخطأ في الجدول
export function TableError ({
  error,
  onRetry
}: {
  error: Error | string | null;
  onRetry?: (() => void) | undefined;
}) {

  return (
    <div className="flex items-center justify-center py-8">
      <div className="max-w-sm w-full">
        <ErrorMessage
          error={error}
          onRetry={onRetry}
          title="خطأ في تحميل الجدول"
        />
      </div>
    </div>
  );

}
