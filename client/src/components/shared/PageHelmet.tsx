import React from 'react';
import {Helmet} from 'react-helmet-async';
import { t } from "i18next";

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

      {children}
    </Helmet>
  );

}

// Predefined helmet configurations for common pages
export const PageHelmets = {
  'Dashboard': () => (
    <PageHelmet
      title={t('auto.PageHelmet.1')}
      description={t('auto.PageHelmet.2')}
      keywords={t('auto.PageHelmet.3')}
    />
  ),
  'Companies': () => (
    <PageHelmet
      title={t('auto.PageHelmet.4')}
      description={t('auto.PageHelmet.5')}
      keywords={t('auto.PageHelmet.6')}
    />
  ),
  'Employees': () => (
    <PageHelmet
      title={t('auto.PageHelmet.7')}
      description={t('auto.PageHelmet.8')}
      keywords={t('auto.PageHelmet.9')}
    />
  ),
  'Documents': () => (
    <PageHelmet
      title={t('auto.PageHelmet.10')}
      description={t('auto.PageHelmet.11')}
      keywords={t('auto.PageHelmet.12')}
    />
  ),
  'Reports': () => (
    <PageHelmet
      title={t('auto.PageHelmet.13')}
      description={t('auto.PageHelmet.14')}
      keywords={t('auto.PageHelmet.15')}
    />
  ),
  'Settings': () => (
    <PageHelmet
      title={t('auto.PageHelmet.16')}
      description={t('auto.PageHelmet.17')}
      keywords={t('auto.PageHelmet.18')}
    />
  ),
  'Login': () => (
    <PageHelmet
      title={t('auto.PageHelmet.19')}
      description={t('auto.PageHelmet.20')}
      keywords={t('auto.PageHelmet.21')}
      noIndex={true}
    />
  )
};
