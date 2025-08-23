import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import runtimeErrorOverlay from '@replit/vite-plugin-runtime-error-modal';
import {VitePWA} from 'vite-plugin-pwa';
import tailwindcss from '@tailwindcss/vite';
import {promises as fs} from 'fs';
import {glob} from 'glob';
import {execSync} from 'child_process';

function secureSourceMaps() {
  return {
    'name': 'secure-source-maps',
    'apply': 'build',
    async 'closeBundle'() {
      const distDir = path.resolve(import.meta.dirname, 'dist');
      const publicDir = path.join(distDir, 'public');
      const mapsDir = path.join(distDir, 'maps');
      await fs.mkdir(mapsDir, {'recursive': true});

      const mapFiles = await glob('**/*.map', {'cwd': publicDir});
      for (const file of mapFiles) {
        const from = path.join(publicDir, file);
        const to = path.join(mapsDir, path.basename(file));
        await fs.rename(from, to);
      }

      const bundleFiles = await glob('**/*.{js,css}', {'cwd': publicDir});
      for (const file of bundleFiles) {
        const filePath = path.join(publicDir, file);
        const code = await fs.readFile(filePath, 'utf8');
        await fs.writeFile(filePath, code.replace(/\n?\/\/\# sourceMappingURL=.*\.map\n?/g, '\n'), 'utf8');
      }

      const sentryUrl = process.env.SENTRY_UPLOAD_URL;
      const sentryAuth = process.env.SENTRY_AUTH_TOKEN;
      const gcpBucket = process.env.GCP_BUCKET;
      try {
        if (sentryUrl && sentryAuth) {
          execSync(`curl -sf --header "Authorization: Bearer ${sentryAuth}" --upload-file ${mapsDir}/*.map ${sentryUrl}`, {'stdio': 'inherit'});
        } else if (gcpBucket) {
          execSync(`gsutil cp ${mapsDir}/*.map gs://${gcpBucket}`, {'stdio': 'inherit'});
        }
      } catch (err) {
        console.warn('Source map upload failed', err);
      }
    }
  };
}




export default defineConfig({
  'plugins': [
    react(),
    tailwindcss(),
    runtimeErrorOverlay(),
    VitePWA({
      'registerType': 'autoUpdate',
      'workbox': {
        'globPatterns': ['**/*.{js,css,html,ico,png,svg,woff2}'],
        'runtimeCaching': [
          {
            'urlPattern': ({ url, request }) => {
              const isApi = url.hostname.startsWith('api.');
              const isAuth = url.pathname.startsWith('/auth') || url.pathname.startsWith('/session');
              const hasCredentials = request.headers.has('Authorization') || request.headers.has('Cookie');
              return isApi && !isAuth && !hasCredentials;
            },
            'handler': 'NetworkFirst',
            'options': {
              'cacheName': 'api-cache',
              'expiration': {
                'maxEntries': 100,
                'maxAgeSeconds': 60 * 60 * 24 // 24 hours
              }
            }
          },
          {
            'urlPattern': /\.(png|jpg|jpeg|svg|gif|webp)$/,
            'handler': 'CacheFirst',
            'options': {
              'cacheName': 'image-cache',
              'expiration': {
                'maxEntries': 200,
                'maxAgeSeconds': 60 * 60 * 24 * 30 // 30 days
              }
            }
          }
        ]
      },
      'includeAssets': ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      'manifest': {
        'name': 'HRMS Elite - نظام إدارة الموارد البشرية',
        'short_name': 'HRMS Elite',
        'description': 'نظام إدارة الموارد البشرية الشامل والمتقدم',
        'theme_color': '#2563eb',
        'background_color': '#ffffff',
        'display': 'standalone',
        'orientation': 'portrait-primary',
        'start_url': '/',
        'scope': '/',
        'lang': 'ar',
        'dir': 'rtl',
        'categories': ['business', 'productivity', 'utilities'],
        'icons': [
          {
            'src': '/icon-72x72.png',
            'sizes': '72x72',
            'type': 'image/png',
            'purpose': 'maskable any'
          },
          {
            'src': '/icon-96x96.png',
            'sizes': '96x96',
            'type': 'image/png',
            'purpose': 'maskable any'
          },
          {
            'src': '/icon-128x128.png',
            'sizes': '128x128',
            'type': 'image/png',
            'purpose': 'maskable any'
          },
          {
            'src': '/icon-144x144.png',
            'sizes': '144x144',
            'type': 'image/png',
            'purpose': 'maskable any'
          },
          {
            'src': '/icon-152x152.png',
            'sizes': '152x152',
            'type': 'image/png',
            'purpose': 'maskable any'
          },
          {
            'src': '/icon-192x192.png',
            'sizes': '192x192',
            'type': 'image/png',
            'purpose': 'maskable any'
          },
          {
            'src': '/icon-384x384.png',
            'sizes': '384x384',
            'type': 'image/png',
            'purpose': 'maskable any'
          },
          {
            'src': '/icon-512x512.png',
            'sizes': '512x512',
            'type': 'image/png',
            'purpose': 'maskable any'
          }
        ],
        'shortcuts': [
          {
            'name': 'لوحة التحكم',
            'short_name': 'لوحة التحكم',
            'description': 'الوصول السريع للوحة التحكم الرئيسية',
            'url': '/dashboard',
            'icons': [
              {
                'src': '/shortcut-dashboard.png',
                'sizes': '96x96'
              }
            ]
          },
          {
            'name': 'الموظفين',
            'short_name': 'الموظفين',
            'description': 'إدارة بيانات الموظفين',
            'url': '/employees',
            'icons': [
              {
                'src': '/shortcut-employees.png',
                'sizes': '96x96'
              }
            ]
          },
          {
            'name': 'الحضور',
            'short_name': 'الحضور',
            'description': 'تسجيل الحضور والانصراف',
            'url': '/attendance',
            'icons': [
              {
                'src': '/shortcut-attendance.png',
                'sizes': '96x96'
              }
            ]
          },
          {
            'name': 'التقارير',
            'short_name': 'التقارير',
            'description': 'عرض التقارير والإحصائيات',
            'url': '/reports',
            'icons': [
              {
                'src': '/shortcut-reports.png',
                'sizes': '96x96'
              }
            ]
          }
        ],
        'screenshots': [
          {
            'src': '/screenshot-wide.png',
            'sizes': '1024x593',
            'type': 'image/png',
            'form_factor': 'wide',
            'label': 'لوحة التحكم الرئيسية'
          },
          {
            'src': '/screenshot-narrow.png',
            'sizes': '540x720',
            'type': 'image/png',
            'form_factor': 'narrow',
            'label': 'واجهة التطبيق المحمول'
          }
        ]
      }
    }),
    secureSourceMaps(),
    ...(process.env.NODE_ENV !== 'production' &&
    process.env.REPL_ID !== undefined
      ? [
        await import('@replit/vite-plugin-cartographer').then((m) =>
          m.cartographer()
        )
      ]
      : [])
  ],
  'resolve': {
    'alias': {
      '@': path.resolve(import.meta.dirname, 'client', 'src'),
      '@shared': path.resolve(import.meta.dirname, 'shared'),
      '@assets': path.resolve(import.meta.dirname, 'assets'),
      '@components': path.resolve(import.meta.dirname, 'client', 'src', 'components'),
      '@pages': path.resolve(import.meta.dirname, 'client', 'src', 'pages'),
      '@hooks': path.resolve(import.meta.dirname, 'client', 'src', 'hooks'),
      '@stores': path.resolve(import.meta.dirname, 'client', 'src', 'stores'),
      '@services': path.resolve(import.meta.dirname, 'client', 'src', 'services'),
      '@lib': path.resolve(import.meta.dirname, 'client', 'src', 'lib'),
      '@types': path.resolve(import.meta.dirname, 'client', 'src', 'types'),
      '@tests': path.resolve(import.meta.dirname, 'client', 'tests')
    }
  },
  'root': path.resolve(import.meta.dirname, 'client'),
  'build': {
    'outDir': path.resolve(import.meta.dirname, 'dist/public'),
    'emptyOutDir': true,
    // ✅ تحسين إعدادات Vite للأداء - المرحلة الثالثة
    'target': 'esnext',
    'minify': 'terser',
    'sourcemap': true,
    'reportCompressedSize': true,
    // ✅ تحسين chunkSizeWarningLimit - زيادة الحد لتحسين الأداء
    'chunkSizeWarningLimit': 2000,
    'terserOptions': {
      'compress': {
        // ✅ تحسين drop_console - إزالة جميع console statements في الإنتاج
        'drop_console': process.env.NODE_ENV === 'production',
        'drop_debugger': true,
        'pure_funcs': process.env.NODE_ENV === 'production' ? [
          'console.log',
          'console.info',
          'console.debug',
          'console.warn',
          'console.error',
          'console.trace',
          'console.table',
          'console.group',
          'console.groupEnd',
          'console.time',
          'console.timeEnd',
          'console.count',
          'console.countReset',
          'console.clear',
          'console.assert',
          'console.dir',
          'console.dirxml',
          'console.groupCollapsed',
          'console.profile',
          'console.profileEnd',
          'console.timeLog',
          'console.timeline',
          'console.timelineEnd',
          'console.trace',
          'console.warn'
        ] : [],
        'passes': 3, // زيادة عدد المرات لتحسين الضغط
        'unsafe': true,
        'unsafe_comps': true,
        'unsafe_Function': true,
        'unsafe_math': true,
        'unsafe_proto': true,
        'unsafe_regexp': true,
        'unsafe_undefined': true,
        // تحسينات إضافية للضغط
        'collapse_vars': true,
        'reduce_vars': true,
        'hoist_funs': true,
        'hoist_vars': true,
        'if_return': true,
        'join_vars': true,
        'sequences': true,
        'side_effects': true,
        'unused': true,
        'dead_code': true,
        'pure_getters': true,
        'conditionals': true,
        'comparisons': true,
        'evaluate': true,
        'booleans': true,
        'loops': true,
        'toplevel': true,
        'typeofs': true,
        'global_defs': {
          '@alert': 'console.log'
        }
      },
      'mangle': {
        'safari10': true,
        // تحسين mangling
        'toplevel': true,
        'properties': {
          'regex': /^_/
        }
      },
      'format': {
        'comments': false
      }
    },
    'rollupOptions': {
      'output': {
        // ✅ تحسين code splitting مع manualChunks متقدم ومحسن
        'manualChunks': (id) => {

          // Vendor chunks - تحسين تجميع المكتبات
          if (id.includes('node_modules')) {

            // React ecosystem - تجميع React في chunk منفصل
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-is')) {
              return 'react-core';
            }
            if (id.includes('react-router') || id.includes('wouter')) {
              return 'routing';
            }

            // UI Libraries - تجميع مكتبات UI
            if (id.includes('@radix-ui')) {
              return 'radix-ui';
            }
            if (id.includes('framer-motion')) {
              return 'animations';
            }
            if (id.includes('lucide-react') || id.includes('react-icons')) {
              return 'icons';
            }

            // Data Management - تجميع مكتبات إدارة البيانات
            if (id.includes('@tanstack')) {
              return 'data-management';
            }
            if (id.includes('zustand')) {
              return 'state-management';
            }
            if (id.includes('react-hook-form') || id.includes('@hookform')) {
              return 'forms';
            }

            // Charts and Visualization - تجميع مكتبات الرسوم البيانية
            if (id.includes('recharts') || id.includes('d3')) {
              return 'charts';
            }

            // Date and Time - تجميع مكتبات التاريخ والوقت
            if (id.includes('date-fns') || id.includes('dayjs') || id.includes('moment')) {
              return 'date-utils';
            }

            // Utilities - تجميع المكتبات المساعدة
            if (id.includes('clsx') || id.includes('classnames') || id.includes('tailwind-merge')) {
              return 'utils';
            }

            // HTTP and API - تجميع مكتبات HTTP
            if (id.includes('axios') || id.includes('fetch') || id.includes('ky')) {
              return 'http-client';
            }

            // Validation - تجميع مكتبات التحقق
            if (id.includes('zod') || id.includes('yup') || id.includes('joi')) {
              return 'validation';
            }

            // AI and ML Libraries - تجميع مكتبات الذكاء الاصطناعي
            if (id.includes('ai') || id.includes('openai') || id.includes('anthropic')) {
              return 'ai-libraries';
            }

            // File handling - تجميع مكتبات التعامل مع الملفات
            if (id.includes('file-saver') || id.includes('jszip') || id.includes('pdf-lib')) {
              return 'file-handling';
            }

            // Default vendor chunk for other node_modules
            return 'vendor';
          }

          // Application chunks based on features - تحسين تجميع المكونات
          if (id.includes('/pages/')) {

            // Core pages - الصفحات الأساسية
            if (id.includes('dashboard') || id.includes('home')) {
              return 'core-pages';
            }
            if (id.includes('employees') || id.includes('employee')) {
              return 'employee-pages';
            }
            if (id.includes('attendance') || id.includes('time')) {
              return 'attendance-pages';
            }
            if (id.includes('documents') || id.includes('files')) {
              return 'document-pages';
            }
            if (id.includes('reports') || id.includes('analytics')) {
              return 'report-pages';
            }
            if (id.includes('settings') || id.includes('config')) {
              return 'settings-pages';
            }

            // AI and Advanced features - ميزات الذكاء الاصطناعي
            if (id.includes('ai-') || id.includes('chatbot') || id.includes('analytics')) {
              return 'ai-features';
            }

            // Authentication - صفحات المصادقة
            if (id.includes('login') || id.includes('auth') || id.includes('register')) {
              return 'auth-pages';
            }

            // Other pages
            return 'other-pages';
          }

          // Component chunks - تحسين تجميع المكونات
          if (id.includes('/components/')) {

            if (id.includes('/ui/')) {
              return 'ui-components';
            }
            if (id.includes('/shared/')) {
              return 'shared-components';
            }
            if (id.includes('/optimized/')) {
              return 'optimized-components';
            }
            if (id.includes('/ai/')) {
              return 'ai-components';
            }
            if (id.includes('/forms/')) {
              return 'form-components';
            }
            if (id.includes('/charts/')) {
              return 'chart-components';
            }
            if (id.includes('/tables/')) {
              return 'table-components';
            }
            if (id.includes('/modals/')) {
              return 'modal-components';
            }
            return 'other-components';
          }

          // Service and utility chunks
          if (id.includes('/stores/')) {
            return 'stores';
          }
          if (id.includes('/services/')) {
            return 'services';
          }
          if (id.includes('/hooks/')) {
            return 'hooks';
          }
          if (id.includes('/utils/') || id.includes('/lib/')) {
            return 'utilities';
          }
          if (id.includes('/types/')) {
            return 'types';
          }

          // Default chunk for other files
          return 'app';
        },
        // تحسين أسماء الملفات مع hashing محسن
        'chunkFileNames': (_chunkInfo) => {
          return 'js/[name]-[hash].js';
        },
        'entryFileNames': 'js/[name]-[hash].js',
        'assetFileNames': (assetInfo) => {

          const name = assetInfo.name ?? 'asset';
          const info = name.split('.');
          const ext = info[info.length - 1];
          if ((/\.(css)$/).test(name)) {

            return `css/[name]-[hash].${ext}`;

          }
          if ((/\.(png|jpe?g|svg|gif|tiff|bmp|ico|webp)$/i).test(name)) {

            return `images/[name]-[hash].${ext}`;

          }
          if ((/\.(woff2?|eot|ttf|otf)$/i).test(name)) {

            return `fonts/[name]-[hash].${ext}`;

          }
          if ((/\.(mp4|webm|ogg|mp3|wav|flac|aac)$/i).test(name)) {

            return `media/[name]-[hash].${ext}`;

          }
          return `assets/[name]-[hash].${ext}`;

        },
        // تحسين تجميع الكود
        'compact': true,
        // تحسين source maps
        // تحسين exports
        'exports': 'named',
        // تحسين globals
        'globals': {
          'react': 'React',
          'react-dom': 'ReactDOM',
          'react-router-dom': 'ReactRouterDOM'
        }
      },
      // تحسين tree shaking - إزالة الكود غير المستخدم
      'treeshake': {
        'propertyReadSideEffects': false,
        'unknownGlobalSideEffects': false,
        'tryCatchDeoptimization': false,
        'moduleSideEffects': (id) => {
          // تحديد الملفات التي لها side effects
          return id.includes('polyfill') ||
                 id.includes('global') ||
                 id.includes('css') ||
                 id.includes('style');
        }
      },
      'external': ['ai'],
      // تحسين cache
      'cache': true,
      // تحسين watch
      'watch': process.env.NODE_ENV === 'development' ? {
        'include': 'src/**',
        'exclude': 'node_modules/**'
      } : false
    }
  },
  'server': {
    'port': 5173,
    'host': 'localhost',
    'strictPort': false,
    'fs': {
      'strict': true,
      'deny': ['**/.*']
    },
    // تحسين أداء التطوير
    'hmr': {
      'overlay': true,
      'port': 24678,
      'host': 'localhost'
    },
    // تحسين headers
    'headers': {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block'
    }
  },
  // تحسين optimizeDeps - تحسين pre-bundling
  'optimizeDeps': {
    'include': [
      'react',
      'react-dom',
      'react/jsx-runtime',
      'wouter',
      '@tanstack/react-query',
      'react-hook-form',
      '@hookform/resolvers',
      'date-fns',
      'clsx',
      'tailwind-merge',
      'framer-motion',
      'zustand',
      'lucide-react',
      'recharts',
      'axios',
      'zod',
      'react-router-dom'
    ],
    'exclude': ['@radix-ui/react-icons', 'ai'],
    // تحسين pre-bundling
    'force': process.env.NODE_ENV === 'development',
    // تحسين esbuild options
    'esbuildOptions': {
      'target': 'esnext',
      'supported': {
        'bigint': true
      },
      'plugins': []
    }
  },
  // تحسين CSS
  'css': {
    'devSourcemap': process.env.NODE_ENV === 'development',
    // تحسين CSS modules
    'modules': {
      'localsConvention': 'camelCase',
      'generateScopedName': process.env.NODE_ENV === 'development'
        ? '[name]__[local]___[hash:base64:5]'
        : '[hash:base64:8]'
    },
    // تحسين PostCSS

  },
  // تحسينات إضافية للأداء
  'define': {
    '__DEV__': process.env.NODE_ENV === 'development',
    '__PROD__': process.env.NODE_ENV === 'production',
    '__VERSION__': JSON.stringify(process.env.npm_package_version ?? '1.0.0'),
    '__BUILD_TIME__': JSON.stringify(new Date().toISOString()),
    // تحسين React
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    'global': 'globalThis'
  },
  // تحسين cache
  'cacheDir': '.vite',
  // تحسين preview
  'preview': {
    'port': 4173,
    'strictPort': true,
    'host': true,
    // تحسين headers للـ preview
    'headers': {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block'
    }
  },
  // تحسينات إضافية
  'esbuild': {
    'target': 'esnext',
    'supported': {
      'bigint': true
    },
    'legalComments': 'none',
    'charset': 'utf8'
  },
  // تحسين worker
  'worker': {
    'format': 'es'
  }
});
