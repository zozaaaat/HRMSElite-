import React from 'react';
import {Helmet} from 'react-helmet-async';

interface PageHelmetProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  ogType?: string;
  canonical?: string;
  noIndex?: boolean;
  children?: React.ReactNode;
}

export function PageHelmet ({
  title,
  description,
  keywords,
  ogImage,
  ogType = 'website',
  canonical,
  noIndex = false,
  children
}: PageHelmetProps) {

  const fullTitle = title ? `${title} - HRMS Elite` : 'HRMS Elite - نظام إدارة الموارد البشرية';
  const fullDescription = description ?? "نظام إدارة الموارد البشرية الشامل والمتقدم للشركات والمؤسسات";
  const fullKeywords = keywords ?? "إدارة الموارد البشرية, HRMS, نظام إدارة, شركات, موظفين";
  const fullOgImage = ogImage ?? "/logo.svg";
  const fullCanonical = canonical ?? window.location.href;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={fullDescription} />
      <meta name="keywords" content={fullKeywords} />
      <meta name="author" content="HRMS Elite" />
      <meta name="robots" content={noIndex ? 'noindex, nofollow' : 'index, follow'} />

      {/* Canonical URL */}
      <link rel="canonical" href={fullCanonical} />

      {/* Open Graph Meta Tags */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={fullDescription} />
      <meta property="og:image" content={fullOgImage} />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={fullCanonical} />
      <meta property="og:site_name" content="HRMS Elite" />
      <meta property="og:locale" content="ar_AR" />

      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={fullDescription} />
      <meta name="twitter:image" content={fullOgImage} />

      {/* Security Headers */}
      <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
      <meta httpEquiv="X-Frame-Options" content="DENY" />
      <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
      <meta httpEquiv="Referrer-Policy" content="strict-origin-when-cross-origin" />

      {/* Viewport and Mobile */}
      <meta name="viewport" content="width=device-width,
   initial-scale=1.0,
   maximum-scale=1.0,
   user-scalable=no" />
      <meta name="theme-color" content="#2563eb" />
      <meta name="msapplication-TileColor" content="#2563eb" />

      {/* Additional Meta Tags */}
      <meta name="application-name" content="HRMS Elite" />
      <meta name="apple-mobile-web-app-title" content="HRMS Elite" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />

      {/* Language and Direction */}
      <html lang="ar" dir="rtl" />

      {children}
    </Helmet>
  );

}

// Predefined helmet configurations for common pages
export const PageHelmets = {
  'Dashboard': () => (
    <PageHelmet
      title="لوحة التحكم"
      description="لوحة التحكم الرئيسية لنظام إدارة الموارد البشرية"
      keywords="لوحة التحكم, إحصائيات, تقارير, HRMS"
    />
  ),
  'Companies': () => (
    <PageHelmet
      title="إدارة الشركات"
      description="إدارة الشركات والمؤسسات في النظام"
      keywords="شركات, مؤسسات, إدارة, HRMS"
    />
  ),
  'Employees': () => (
    <PageHelmet
      title="إدارة الموظفين"
      description="إدارة بيانات الموظفين والموارد البشرية"
      keywords="موظفين, موارد بشرية, إدارة, HRMS"
    />
  ),
  'Documents': () => (
    <PageHelmet
      title="إدارة المستندات"
      description="إدارة المستندات والتراخيص والملفات"
      keywords="مستندات, تراخيص, ملفات, HRMS"
    />
  ),
  'Reports': () => (
    <PageHelmet
      title="التقارير"
      description="تقارير شاملة عن الموارد البشرية والشركات"
      keywords="تقارير, إحصائيات, تحليلات, HRMS"
    />
  ),
  'Settings': () => (
    <PageHelmet
      title="الإعدادات"
      description="إعدادات النظام والتكوين"
      keywords="إعدادات, تكوين, النظام, HRMS"
    />
  ),
  'Login': () => (
    <PageHelmet
      title="تسجيل الدخول"
      description="تسجيل الدخول إلى نظام إدارة الموارد البشرية"
      keywords="تسجيل دخول, مصادقة, أمان, HRMS"
      noIndex={true}
    />
  )
};
