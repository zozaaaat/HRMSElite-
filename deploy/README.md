# 🚀 HRMS Elite - ملفات النشر للخادم

## 📋 نظرة عامة

هذا المجلد يحتوي على جميع ملفات النشر اللازمة لنشر تطبيق HRMS Elite على الخادم. النظام مُعد ليكون آمناً وقابلاً للتوسع ومحسناً للأداء.

## 📁 هيكل الملفات

```
deploy/
├── 📄 Dockerfile                    # بناء التطبيق في حاويات
├── 📄 docker-compose.yml            # إعداد الإنتاج الأساسي
├── 📄 docker-compose.prod.yml       # إعداد الإنتاج المتقدم مع المراقبة
├── 📄 docker-compose.dev.yml        # إعداد التطوير
├── 📄 nginx.conf                    # تكوين Nginx للإنتاج
├── 📄 nginx.dev.conf                # تكوين Nginx للتطوير
├── 📄 env.example                   # قالب المتغيرات البيئية
├── 📄 deploy.sh                     # سكريبت النشر لـ Linux
├── 📄 deploy.bat                    # سكريبت النشر لـ Windows
├── 📄 DEPLOYMENT-GUIDE.md           # دليل النشر الشامل
├── 📄 QUICK-DEPLOY-CHECK.md         # فحص سريع للنشر
├── 📄 README.md                     # هذا الملف
└── 📁 monitoring/                   # ملفات المراقبة
    ├── 📁 prometheus/
    │   ├── 📄 prometheus.yml        # تكوين Prometheus
    │   └── 📁 rules/
    │       └── 📄 alerts.yml        # قواعد التنبيهات
    └── 📁 grafana/
        ├── 📁 dashboards/
        │   ├── 📄 dashboards.yml    # تكوين لوحات التحكم
        │   └── 📄 hrms-elite-dashboard.json # لوحة تحكم HRMS
        └── 📁 datasources/
            └── 📄 prometheus.yml    # تكوين مصادر البيانات
```

## 🎯 البيئات المدعومة

### 1. بيئة التطوير (Development)
```bash
# تشغيل بيئة التطوير
docker-compose -f docker-compose.dev.yml up -d

# الوصول للتطبيق
http://localhost:3000

# أدوات التطوير
http://localhost:8080  # Adminer (إدارة قاعدة البيانات)
http://localhost:8081  # Redis Commander
```

### 2. بيئة الإنتاج (Production)
```bash
# تشغيل بيئة الإنتاج الأساسية
docker-compose up -d

# تشغيل بيئة الإنتاج مع المراقبة
docker-compose -f docker-compose.prod.yml up -d

# الوصول للتطبيق
https://your-domain.com

# أدوات المراقبة
http://your-domain.com:9090  # Prometheus
http://your-domain.com:3001  # Grafana
```

## 🔧 الملفات الرئيسية

### Dockerfile
- **Multi-stage build** لتحسين حجم الصورة
- **Security** تشغيل كـ non-root user
- **Health checks** مراقبة صحة التطبيق
- **Signal handling** معالجة الإشارات بشكل صحيح

### docker-compose.yml
يتضمن الخدمات التالية:
- **hrms-app**: التطبيق الرئيسي
- **hrms-db**: قاعدة البيانات SQLite
- **nginx**: خادم الويب العكسي
- **redis**: تخزين الجلسات والتخزين المؤقت
- **backup**: خدمة النسخ الاحتياطي

### nginx.conf
- **تحسين الأداء**: ضغط Gzip، تخزين مؤقت للملفات الثابتة
- **الأمان**: رؤوس HTTP آمنة، حماية من XSS و CSRF
- **Rate Limiting**: حماية من الهجمات
- **SSL/TLS**: تشفير كامل للاتصالات

## 🚀 خطوات النشر السريع

### 1. إعداد البيئة
```bash
cd deploy
cp env.example .env
nano .env  # تعديل المتغيرات البيئية
```

### 2. إنشاء شهادات SSL
```bash
mkdir -p ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout ssl/key.pem \
    -out ssl/cert.pem \
    -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"
```

### 3. تشغيل التطبيق
```bash
# للإنتاج
docker-compose up -d --build

# للتطوير
docker-compose -f docker-compose.dev.yml up -d --build
```

### 4. فحص الحالة
```bash
docker-compose ps
docker-compose logs -f
```

## 🔒 الأمان

### إعدادات الأمان المطبقة
1. **HTTPS إجباري**: إعادة توجيه HTTP إلى HTTPS
2. **Security Headers**: حماية من XSS و CSRF
3. **Rate Limiting**: حماية من هجمات DDoS
4. **CORS**: إعدادات آمنة للـ Cross-Origin
5. **File Upload Security**: التحقق من أنواع الملفات

### المتغيرات البيئية المهمة
```env
# مفاتيح الأمان (تغييرها في الإنتاج!)
SESSION_SECRET=your-super-secret-session-key-change-this-in-production
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
CSRF_SECRET=your-csrf-secret-key-change-this-in-production

# مفاتيح الذكاء الاصطناعي (اختياري)
OPENAI_API_KEY=your-openai-api-key-here
ANTHROPIC_API_KEY=your-anthropic-api-key-here

# إعدادات Redis
REDIS_PASSWORD=your-secure-redis-password

# إعدادات CORS
CORS_ORIGIN=https://your-domain.com
```

## 📊 المراقبة

### Prometheus
- **جمع المقاييس**: من التطبيق والخوادم
- **قواعد التنبيهات**: مراقبة الأداء والأخطاء
- **التخزين**: حفظ البيانات التاريخية

### Grafana
- **لوحات التحكم**: عرض المقاييس بشكل مرئي
- **التنبيهات**: إشعارات فورية للمشاكل
- **التقارير**: تقارير دورية عن الأداء

### المقاييس المراقبة
- **الأداء**: وقت الاستجابة، معدل الطلبات
- **الموارد**: استخدام CPU، الذاكرة، القرص
- **الأخطاء**: معدل الأخطاء، أخطاء الاتصال
- **الأمان**: محاولات الاختراق، الطلبات المشبوهة

## 💾 النسخ الاحتياطي

### النسخ الاحتياطي التلقائي
```bash
# تشغيل نسخة احتياطية يدوية
docker-compose run --rm backup

# جدولة النسخ الاحتياطي
0 2 * * * cd /path/to/HRMSElite/deploy && docker-compose run --rm backup
```

### استعادة النسخة الاحتياطية
```bash
# استعادة قاعدة البيانات
docker-compose exec hrms-db sqlite3 /data/hrms.db < backup.sql

# أو استعادة من ملف مضغوط
tar -xzf backup-file.tar.gz -C /path/to/restore
```

## 🚨 استكشاف الأخطاء

### مشاكل شائعة وحلولها

1. **خطأ في بناء الصورة**
   ```bash
   docker-compose build --no-cache
   ```

2. **مشاكل في الشبكة**
   ```bash
   docker network ls
   docker network prune
   ```

3. **مشاكل في التخزين**
   ```bash
   docker volume ls
   docker volume prune
   ```

4. **مشاكل في المنافذ**
   ```bash
   netstat -tulpn | grep :80
   netstat -tulpn | grep :443
   ```

### أوامر مفيدة
```bash
# إعادة تشغيل سريع
docker-compose restart

# فحص السجلات
docker-compose logs -f hrms-app

# فحص قاعدة البيانات
docker-compose exec hrms-db sqlite3 /data/hrms.db ".tables"

# فحص Redis
docker-compose exec redis redis-cli ping

# فحص Nginx
docker-compose exec nginx nginx -t
```

## 📈 التوسع

### إضافة المزيد من الموارد
```yaml
# في docker-compose.yml
services:
  hrms-app:
    deploy:
      resources:
        limits:
          memory: 2G
          cpus: '2.0'
        reservations:
          memory: 1G
          cpus: '1.0'
```

### إعداد Load Balancer
```nginx
# إضافة خوادم إضافية في nginx.conf
upstream hrms_backend {
    server hrms-app-1:3000;
    server hrms-app-2:3000;
    server hrms-app-3:3000;
}
```

## ✅ التحقق من النشر

### قبل النشر
- [ ] جميع المتغيرات البيئية مُعدة
- [ ] شهادات SSL موجودة
- [ ] قاعدة البيانات جاهزة
- [ ] الملفات الثابتة مُبنية

### بعد النشر
- [ ] التطبيق يستجيب على `https://your-domain.com`
- [ ] جميع الخدمات تعمل
- [ ] السجلات تُحفظ
- [ ] النسخ الاحتياطي يعمل
- [ ] المراقبة مفعلة

## 📞 الدعم

### معلومات الاتصال
- **GitHub Issues**: للإبلاغ عن الأخطاء
- **Documentation**: `/docs/` في المشروع
- **Logs**: `/app/logs/` في الحاوية

### أوامر مفيدة
```bash
# فحص حالة النظام
./deploy.sh --status

# إعادة تشغيل كامل
./deploy.sh --restart

# تنظيف النظام
./deploy.sh --cleanup

# فحص الأمان
./deploy.sh --security-check
```

---

## 🎉 تهانينا!

تم إعداد نظام النشر الخاص بـ HRMS Elite بنجاح! يمكنك الآن نشر التطبيق على الخادم بثقة وأمان.

### روابط مفيدة
- [دليل النشر الشامل](./DEPLOYMENT-GUIDE.md)
- [فحص سريع للنشر](./QUICK-DEPLOY-CHECK.md)
- [ملخص النشر](./DEPLOYMENT-SUMMARY.md)

---

**🚀 النظام جاهز للنشر!** 