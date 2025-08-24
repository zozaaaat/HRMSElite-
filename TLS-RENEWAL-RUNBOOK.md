# TLS Renewal Runbook

## Overview
إجراءات تجديد شهادات TLS للخدمات العامة والداخلية.

## Prerequisites
- وصول إلى خوادم الإنتاج.
- صلاحيات على نظام إدارة الشهادات (Let's Encrypt أو ما شابه).
- أدوات مثل `certbot` أو سكربتات التجديد.

## Steps
1. تأكد من صلاحية الشهادة الحالية باستخدام `openssl s_client`.
2. شغّل سكربت التجديد:
   ```bash
   certbot renew --dry-run
   certbot renew && systemctl reload nginx
   ```
3. تحقق من تحميل الشهادة الجديدة عبر الاتصال بمنفذ HTTPS.
4. حدّث لوحات المراقبة لتنبيه قبل 15 يومًا من انتهاء الصلاحية.

## Validation
- استخدم متصفحًا أو `curl -v https://domain` للتأكد من التاريخ الجديد.
- راجع السجلات للتأكد من عدم وجود أخطاء في إعادة التحميل.

## Rollback
في حال فشل التجديد:
1. استعد النسخة الاحتياطية للشهادة القديمة من `/etc/letsencrypt/backups`.
2. أعد تشغيل الخدمة.
3. بلّغ فريق الأمن للمراجعة.

## Contacts
- **DevOps On-Call**: devops@example.com
- **Security Team**: security@example.com
