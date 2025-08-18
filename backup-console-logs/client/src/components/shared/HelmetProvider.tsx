import React from 'react';
import {HelmetProvider as ReactHelmetProvider} from 'react-helmet-async';

interface HelmetProviderProps {
  children: React.ReactNode;
}

export function HelmetProvider ({children}: HelmetProviderProps) {

  return (
    <ReactHelmetProvider>
      {children}
    </ReactHelmetProvider>
  );

}

// Custom hook for page-specific meta tags
export function usePageMeta () {

  const setPageMeta = (meta: {
    title?: string;
    description?: string;
    keywords?: string;
    ogImage?: string;
    ogType?: string;
    canonical?: string;
  }) => {

    return {
      'title': meta.title ? `${
  meta.title
} - HRMS Elite` : 'HRMS Elite - نظام إدارة الموارد البشرية',
      'description': meta.description ?? "نظام إدارة الموارد البشرية الشامل والمتقدم للشركات والمؤسسات",
  
      'keywords': meta.keywords ?? "إدارة الموارد البشرية, HRMS, نظام إدارة, شركات, موظفين",
      'ogImage': meta.ogImage ?? "/logo.svg",
      'ogType': meta.ogType ?? "website",
      'canonical': meta.canonical ?? window.location.href
    };

  };

  return {setPageMeta};

}
