import React from 'react';
import {useAppInitialization} from '../../hooks/useAppInitialization';
import {Card, CardContent} from '../ui/card';
import {Loader2} from 'lucide-react';

interface AppInitializerProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const AppInitializer: React.FC<AppInitializerProps> = ({
  children,
  fallback
}) => {

  const {isReady, isInitialized, hydrationComplete} = useAppInitialization();

  // Default loading screen
  const defaultFallback = (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-96 shadow-lg">
        <CardContent className="p-8 text-center">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-gray-900">
                جاري تحميل التطبيق...
              </h2>
              <p className="text-sm text-gray-600">
                {!hydrationComplete && 'جاري استعادة البيانات المحفوظة...'}
                {hydrationComplete && !isInitialized && 'جاري التحقق من صحة البيانات...'}
                {isInitialized && !isReady && 'جاري إكمال التهيئة...'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  if (!isReady) {

    return fallback || defaultFallback;

  }

  return <>{children}</>;

};

// Component for debugging initialization state
export const InitializationDebugger: React.FC = () => {

  const {isReady, isInitialized, hydrationComplete} = useAppInitialization();

  if (process.env.NODE_ENV === 'development') {

    return (
      <div className="fixed bottom-4 right-4 bg-black bg-opacity-75 text-white p-2 rounded text-xs z-50">
        <div>Ready: {isReady ? '✅' : '❌'}</div>
        <div>Initialized: {isInitialized ? '✅' : '❌'}</div>
        <div>Hydrated: {hydrationComplete ? '✅' : '❌'}</div>
      </div>
    );

  }

  return null;

};
