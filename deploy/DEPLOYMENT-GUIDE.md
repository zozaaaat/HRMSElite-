# HRMS Elite - دليل النشر إلى الخادم

## 📋 نظرة عامة

هذا الدليل يوضح كيفية نشر تطبيق HRMS Elite إلى خادم الإنتاج باستخدام Docker و Docker Compose.

## 🏗️ المكونات المطلوبة

### 📁 ملفات النشر الأساسية
```
deploy/
├── Dockerfile              # تكوين Docker للتطبيق
├── docker-compose.yml      # تكوين Docker Compose
├── nginx.conf             # تكوين Nginx للخادم العكسي
├── deploy.sh              # سكريبت النشر التلقائي
├── deploy.bat             # سكريبت النشر لنظام Windows
└── env.example            # مثال لملف البيئة
```

## 🚀 خطوات النشر

### 1. إعداد الخادم

#### متطلبات النظام
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install -y docker.io docker-compose nginx certbot python3-certbot-nginx

# CentOS/RHEL
sudo yum install -y docker docker-compose nginx certbot python3-certbot-nginx

# تشغيل Docker
sudo systemctl enable docker
sudo systemctl start docker
```

#### إعداد المستخدم
```bash
# إضافة المستخدم إلى مجموعة Docker
sudo usermod -aG docker $USER
newgrp docker
```

### 2. تحضير البيئة

#### نسخ الملفات
```bash
# نسخ مجلد النشر إلى الخادم
scp -r deploy/ user@your-server:/opt/hrms-elite/
cd /opt/hrms-elite/deploy
```

#### إعداد متغيرات البيئة
```bash
# نسخ ملف البيئة
cp env.example .env

# تعديل المتغيرات المطلوبة
nano .env
```

#### المتغيرات المطلوبة في ملف `.env`:
```env
# إعدادات التطبيق
NODE_ENV=production
PORT=3000
DATABASE_URL=/app/data/hrms.db

# مفاتيح الأمان
SESSION_SECRET=your-super-secret-session-key-change-this
ACCESS_JWT_SECRET=your-super-secret-access-jwt-key-change-this
REFRESH_JWT_SECRET=your-super-secret-refresh-jwt-key-change-this
CSRF_SECRET=your-csrf-secret-key-change-this

# مفاتيح AI
OPENAI_API_KEY=your-openai-api-key
ANTHROPIC_API_KEY=your-anthropic-api-key

# إعدادات Redis
REDIS_PASSWORD=your-redis-password

# إعدادات Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# إعدادات التسجيل
LOG_LEVEL=info
```

### 3. إعداد SSL

#### للبيئة الإنتاجية (Let's Encrypt)
```bash
# إعداد Nginx المؤقت
sudo cp nginx.conf /etc/nginx/nginx.conf
sudo systemctl restart nginx

# الحصول على شهادة SSL
sudo certbot --nginx -d your-domain.com

# تحديث تكوين Nginx
sudo cp nginx.conf /etc/nginx/nginx.conf
sudo systemctl restart nginx
```

#### للبيئة التطويرية
```bash
# إنشاء شهادات SSL ذاتية التوقيع
mkdir -p ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout ssl/key.pem \
    -out ssl/cert.pem \
    -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"
```

### 4. تشغيل التطبيق

#### النشر التلقائي
```bash
# تشغيل سكريبت النشر
chmod +x deploy.sh
./deploy.sh
```

#### النشر اليدوي
```bash
# بناء وتشغيل الحاويات
docker-compose up -d --build

# مراقبة السجلات
docker-compose logs -f

# فحص حالة الخدمات
docker-compose ps
```

### 5. إعداد النسخ الاحتياطي

#### إعداد النسخ الاحتياطي التلقائي
```bash
# إنشاء مجلد النسخ الاحتياطي
mkdir -p backups

# إضافة مهمة cron للنسخ الاحتياطي اليومي
crontab -e

# إضافة السطر التالي:
0 2 * * * cd /opt/hrms-elite/deploy && docker-compose run --rm backup
```

#### استعادة النسخ الاحتياطي
```bash
# استعادة قاعدة البيانات
docker-compose run --rm -v /path/to/backup:/backup alpine sh -c "
    apk add --no-cache sqlite3 tar &&
    tar -xzf /backup/hrms-backup-YYYYMMDD-HHMMSS.tar.gz -C /data
"
```

## 🔧 إعدادات متقدمة

### إعدادات Nginx المحسنة

#### تحسين الأداء
```nginx
# إضافة إلى nginx.conf
http {
    # تحسين الأداء
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    
    # ضغط Gzip
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_comp_level 6;
    gzip_types text/plain text/css application/json application/javascript;
}
```

#### إعدادات الأمان
```nginx
# إضافة رؤوس الأمان
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
```

### إعدادات Docker المحسنة

#### تحسين حجم الصورة
```dockerfile
# استخدام multi-stage builds
FROM node:18-alpine AS builder
# ... build steps

FROM node:18-alpine AS production
# ... runtime steps
```

#### إعدادات الأمان
```yaml
# في docker-compose.yml
services:
  hrms-app:
    security_opt:
      - no-new-privileges:true
    read_only: true
    tmpfs:
      - /tmp
      - /var/tmp
```

## 📊 المراقبة والصيانة

### مراقبة الأداء
```bash
# مراقبة استخدام الموارد
docker stats

# مراقبة السجلات
docker-compose logs -f hrms-app

# فحص حالة الخدمات
docker-compose ps
```

### الصيانة الدورية
```bash
# تنظيف الصور غير المستخدمة
docker image prune -f

# تنظيف الحاويات المتوقفة
docker container prune -f

# تنظيف الشبكات غير المستخدمة
docker network prune -f
```

### التحديثات
```bash
# تحديث التطبيق
git pull origin main
docker-compose down
docker-compose up -d --build

# تحديث قاعدة البيانات
docker-compose run --rm hrms-app npm run migrate
```

## 🚨 استكشاف الأخطاء

### مشاكل شائعة

#### التطبيق لا يعمل
```bash
# فحص السجلات
docker-compose logs hrms-app

# فحص حالة الحاويات
docker-compose ps

# إعادة تشغيل الخدمات
docker-compose restart hrms-app
```

#### مشاكل قاعدة البيانات
```bash
# فحص قاعدة البيانات
docker-compose exec hrms-db sqlite3 /data/hrms.db ".tables"

# إعادة تهيئة قاعدة البيانات
docker-compose down -v
docker-compose up -d
```

#### مشاكل Nginx
```bash
# فحص تكوين Nginx
nginx -t

# إعادة تشغيل Nginx
docker-compose restart nginx
```

### أدوات التشخيص
```bash
# فحص الاتصالات
docker-compose exec hrms-app netstat -tulpn

# فحص استخدام الذاكرة
docker-compose exec hrms-app top

# فحص مساحة القرص
docker system df
```

## 📈 تحسين الأداء

### إعدادات الذاكرة
```yaml
# في docker-compose.yml
services:
  hrms-app:
    deploy:
      resources:
        limits:
          memory: 1G
        reservations:
          memory: 512M
```

### إعدادات CPU
```yaml
services:
  hrms-app:
    deploy:
      resources:
        limits:
          cpus: '1.0'
        reservations:
          cpus: '0.5'
```

### تحسين قاعدة البيانات
```sql
-- إنشاء فهارس للأداء
CREATE INDEX idx_employees_email ON employees(email);
CREATE INDEX idx_attendance_date ON attendance(date);
CREATE INDEX idx_documents_type ON documents(type);
```

## 🔐 الأمان

### إعدادات الأمان الأساسية
```bash
# تحديث النظام بانتظام
sudo apt update && sudo apt upgrade -y

# إعداد جدار الحماية
sudo ufw enable
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
```

### مراقبة الأمان
```bash
# فحص الثغرات الأمنية
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
    aquasec/trivy image hrms-elite:latest

# فحص التكوين
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
    aquasec/trivy config .
```

## 📞 الدعم

### معلومات الاتصال
- **المطور**: فريق HRMS Elite
- **البريد الإلكتروني**: support@hrms-elite.com
- **التوثيق**: https://docs.hrms-elite.com

### روابط مفيدة
- [دليل المستخدم](https://docs.hrms-elite.com/user-guide)
- [دليل المطور](https://docs.hrms-elite.com/developer-guide)
- [API Documentation](https://docs.hrms-elite.com/api)

---

## ✅ قائمة التحقق من النشر

- [ ] تثبيت Docker و Docker Compose
- [ ] إعداد متغيرات البيئة
- [ ] إنشاء شهادات SSL
- [ ] بناء وتشغيل الحاويات
- [ ] اختبار التطبيق
- [ ] إعداد النسخ الاحتياطي
- [ ] إعداد المراقبة
- [ ] اختبار الأمان
- [ ] توثيق الإعدادات

**ملاحظة**: تأكد من اختبار جميع الوظائف بعد النشر للتأكد من عمل التطبيق بشكل صحيح. 