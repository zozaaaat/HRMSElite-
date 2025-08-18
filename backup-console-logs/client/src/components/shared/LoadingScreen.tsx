import React from 'react';
import {cn} from '@/lib/utils';

interface LoadingScreenProps {
  message?: string;
  className?: string;
}

export function LoadingScreen ({
  message = 'جاري تحميل الصفحة...',
  className
}: LoadingScreenProps) {

  return (
    <div className={cn(
      'min-h-screen flex items-center justify-center bg-background',
      className
    )}>
      <div className="text-center space-y-6">
        {/* Logo or Brand */}
        <div className="mb-8">
          <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
            <div className="w-8 h-8 bg-primary rounded-full animate-pulse" />
          </div>
        </div>

        {/* Loading Animation */}
        <div className="relative">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-primary rounded-full animate-spin mx-auto" />
          <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-primary/30 rounded-full animate-spin mx-auto"
            style={{'animationDelay': '-0.5s'}} />
        </div>

        {/* Loading Text */}
        <div className="space-y-2">
          <p className="text-lg font-medium text-foreground">{message}</p>
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

        {/* Progress Bar */}
        <div className="w-48 mx-auto">
          <div className="w-full bg-gray-200 rounded-full h-1">
            <div className="bg-primary h-1 rounded-full animate-pulse" style={{'width': '60%'}} />
          </div>
        </div>
      </div>
    </div>
  );

}

// Variant for smaller loading screens
export function CompactLoadingScreen ({
  message = 'جاري التحميل...',
  className
}: LoadingScreenProps) {

  return (
    <div className={cn(
      'flex items-center justify-center p-8 bg-background/50 backdrop-blur-sm',
      className
    )}>
      <div className="text-center space-y-4">
        <div className="w-8 h-8 border-3 border-gray-200 border-t-primary rounded-full animate-spin mx-auto" />
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  );

}

// Variant for overlay loading
export function OverlayLoadingScreen ({
  message = 'جاري تحميل المحتوى...',
  className
}: LoadingScreenProps) {

  return (
    <div className={cn(
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
