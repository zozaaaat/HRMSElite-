/* eslint-env browser */
/* global HTMLCanvasElement, CanvasLineCap, CanvasLineJoin, FileReader, Image */
import React, {useRef, useEffect, useState, useCallback} from 'react';
import {Card, CardContent, CardHeader, CardTitle} from './ui/card';
import {Button} from './ui/button';
import {Label} from './ui/label';
import {Alert, AlertDescription} from './ui/alert';
import {useToast} from '../hooks/use-toast';
import logger from '../lib/logger';
import {SignatureData} from '../types/documents';
import {
  PenTool,
  RotateCcw,
  Download,
  Upload,
  Save,
  X,
  Eye
} from 'lucide-react';

interface SignatureCaptureProps {
  entityId?: string;
  entityType?: 'employee' | 'company' | 'license' | 'leave' | 'document';
  onSave?: (signature: SignatureData) => void;
  onCancel?: () => void;
  mode?: 'create' | 'edit' | 'view';
  existingSignature?: SignatureData;
  title?: string;
  description?: string;
  required?: boolean;
}

export default function SignatureCapture ({
  entityId,
  entityType,
  onSave,
  onCancel,
  mode = 'create',
  existingSignature,
  title = 'التوقيع',
  description = 'قم بالتوقيع في المساحة أدناه',
  required = false
}: SignatureCaptureProps) {

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const {toast} = useToast();
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // إعدادات الرسم
  const [drawingSettings, setDrawingSettings] = useState({
    'strokeStyle': '#000000',
    'lineWidth': 2,
    'lineCap': 'round' as CanvasLineCap,
    'lineJoin': 'round' as CanvasLineJoin
  });

  // تهيئة Canvas
  useEffect(() => {

    const canvas = canvasRef.current;
    if (!canvas) {

      return;

    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {

      return;

    }

    // تعيين حجم Canvas
    canvas.width = 500;
    canvas.height = 200;

    // تعيين خلفية بيضاء
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // تعيين إعدادات الرسم
    ctx.strokeStyle = drawingSettings.strokeStyle;
    ctx.lineWidth = drawingSettings.lineWidth;
    ctx.lineCap = drawingSettings.lineCap;
    ctx.lineJoin = drawingSettings.lineJoin;

    // تحميل التوقيع الموجود إذا كان في وضع التحرير
    if (mode === 'edit' && existingSignature?.imageData) {

      loadExistingSignature(existingSignature.imageData);

    }

  }, [mode, existingSignature, drawingSettings]);

  // تحميل التوقيع الموجود
  const loadExistingSignature = useCallback((imageData: string) => {

    const canvas = canvasRef.current;
    if (!canvas) {

      return;

    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {

      return;

    }

    const img = new Image();
    img.onload = () => {

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      setHasSignature(true);

    };
    img.src = imageData;

  }, []);

  // بدء الرسم
  const startDrawing = useCallback((e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {

    const canvas = canvasRef.current;
    if (!canvas) {

      return;

    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {

      return;

    }

    setIsDrawing(true);
    setHasSignature(true);

    const rect = canvas.getBoundingClientRect();
    let clientX: number, clientY: number;

    if ('touches' in e && e.touches.length > 0 && e.touches[0]) {

      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;

    } else if ('clientX' in e) {

      clientX = e.clientX;
      clientY = e.clientY;

    } else {

      return;

    }

    const x = (clientX - rect.left) * (canvas.width / rect.width);
    const y = (clientY - rect.top) * (canvas.height / rect.height);

    ctx.beginPath();
    ctx.moveTo(x, y);

  }, []);

  // الرسم
  const draw = useCallback((e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {

    if (!isDrawing) {

      return;

    }

    const canvas = canvasRef.current;
    if (!canvas) {

      return;

    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {

      return;

    }

    const rect = canvas.getBoundingClientRect();
    let clientX: number, clientY: number;

    if ('touches' in e && e.touches.length > 0 && e.touches[0]) {

      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;

    } else if ('clientX' in e) {

      clientX = e.clientX;
      clientY = e.clientY;

    } else {

      return;

    }

    const x = (clientX - rect.left) * (canvas.width / rect.width);
    const y = (clientY - rect.top) * (canvas.height / rect.height);

    ctx.lineTo(x, y);
    ctx.stroke();

  }, [isDrawing]);

  // إيقاف الرسم
  const stopDrawing = useCallback(() => {

    setIsDrawing(false);

  }, []);

  // مسح التوقيع
  const clearSignature = useCallback(() => {

    const canvas = canvasRef.current;
    if (!canvas) {

      return;

    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {

      return;

    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);

  }, []);

  // حفظ التوقيع كـ base64
  const saveSignature = useCallback(async () => {

    const canvas = canvasRef.current;
    if (!canvas) {

      return;

    }

    if (!hasSignature && required) {

      toast({
        'title': 'خطأ',
        'description': 'يرجى التوقيع قبل الحفظ',
        'variant': 'destructive'
      });
      return;

    }

    setIsLoading(true);

    try {

      const imageData = canvas.toDataURL('image/png');
      const fileName = `signature_${entityId ?? "unknown"}_${Date.now()}.png`;

      // حساب حجم الملف (تقريبي)
      const base64Length = imageData.length;
      const fileSize = Math.ceil((base64Length * 3) / 4);

      const signatureData: SignatureData = {
        imageData,
        fileName,
        'mimeType': 'image/png',
        fileSize,
        'uploadedAt': new Date().toISOString(),
        'uploadedBy': 'current-user', // يمكن تحديثه لاحقاً
        entityId,
        entityType,
        'status': 'active'
      };

      if (onSave) {

        await onSave(signatureData);

      }

      toast({
        'title': 'تم الحفظ بنجاح',
        'description': 'تم حفظ التوقيع بنجاح'
      });

      if (onCancel) {

        onCancel();

      }

    } catch (error) {

      logger.error('Error saving signature:', error);
      toast({
        'title': 'خطأ في الحفظ',
        'description': 'حدث خطأ أثناء حفظ التوقيع',
        'variant': 'destructive'
      });

    } finally {

      setIsLoading(false);

    }

  }, [hasSignature, required, entityId, entityType, onSave, onCancel, toast]);

  // تحميل التوقيع من ملف
  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {

    const file = event.target.files?.[0];
    if (!file) {

      return;

    }

    if (!file.type.startsWith('image/')) {

      toast({
        'title': 'خطأ في نوع الملف',
        'description': 'يرجى اختيار ملف صورة صالح',
        'variant': 'destructive'
      });
      return;

    }

    const reader = new FileReader();
    reader.onload = (e) => {

      const result = e.target?.result as string;
      if (result) {

        loadExistingSignature(result);

      }

    };
    reader.readAsDataURL(file);

  }, [loadExistingSignature, toast]);

  // تحميل التوقيع كملف
  const downloadSignature = useCallback(() => {

    const canvas = canvasRef.current;
    if (!canvas) {

      return;

    }

    const link = document.createElement('a');
    link.download = `signature_${entityId ?? "unknown"}_${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();

  }, [entityId]);

  // تغيير لون القلم
  const changePenColor = useCallback((color: string) => {

    setDrawingSettings(prev => ({...prev, 'strokeStyle': color}));

  }, []);

  // تغيير سمك القلم
  const changePenWidth = useCallback((width: number) => {

    setDrawingSettings(prev => ({...prev, 'lineWidth': width}));

  }, []);

  if (mode === 'view' && existingSignature) {

    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg p-4 bg-white">
            <img
              src={existingSignature.imageData}
              alt="التوقيع"
              className="w-full h-auto max-h-48 object-contain"
              loading="lazy"
              decoding="async"
              width="640"
              height="192"
            />
          </div>
          <div className="mt-4 text-sm text-gray-600">
            <p>تم التوقيع في: {
  new Date(existingSignature.uploadedAt ?? '').toLocaleDateString('ar-SA')
}</p>
            {existingSignature.fileName && <p>اسم الملف: {existingSignature.fileName}</p>}
          </div>
        </CardContent>
      </Card>
    );

  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PenTool className="h-5 w-5" />
          {title}
        </CardTitle>
        {description && (
          <p className="text-sm text-gray-600">{description}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* أدوات الرسم */}
        <div className="flex items-center gap-2 flex-wrap">
          <Label className="text-sm font-medium">لون القلم:</Label>
          <div className="flex gap-1">
            {['#000000', '#0000FF', '#FF0000', '#008000'].map((color) => (
              <button
                key={color}
                type="button"
                className={`w-6 h-6 rounded-full border-2 ${
                  drawingSettings.strokeStyle === color ? 'border-gray-800' : 'border-gray-300'
                }`}
                style={{'backgroundColor': color}}
                onClick={() => changePenColor(color)}
              />
            ))}
          </div>

          <Label className="text-sm font-medium mr-2">سمك القلم:</Label>
          <div className="flex gap-1">
            {[1, 2, 4, 6].map((width) => (
              <button
                key={width}
                type="button"
                className={`px-2 py-1 text-xs rounded ${
                  drawingSettings.lineWidth === width
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
                onClick={() => changePenWidth(width)}
              >
                {width}px
              </button>
            ))}
          </div>
        </div>

        {/* منطقة التوقيع */}
        <div className="border rounded-lg overflow-hidden">
          <canvas
            ref={canvasRef}
            className="w-full h-48 cursor-crosshair touch-none"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            style={{
              'border': '1px solid #e5e7eb',
              'backgroundColor': '#ffffff'
            }}
          />
        </div>

        {/* رسالة إذا كان التوقيع مطلوب */}
        {required && !hasSignature && (
          <Alert variant="destructive">
            <AlertDescription>
              التوقيع مطلوب لهذا المستند
            </AlertDescription>
          </Alert>
        )}

        {/* أزرار التحكم */}
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={clearSignature}
            disabled={!hasSignature}
          >
            <RotateCcw className="h-4 w-4 mr-1" />
            مسح
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => document.getElementById('file-upload')?.click()}
          >
            <Upload className="h-4 w-4 mr-1" />
            رفع ملف
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={downloadSignature}
            disabled={!hasSignature}
          >
            <Download className="h-4 w-4 mr-1" />
            تحميل
          </Button>

          {onCancel && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onCancel}
            >
              <X className="h-4 w-4 mr-1" />
              إلغاء
            </Button>
          )}

          <Button
            type="button"
            size="sm"
            onClick={saveSignature}
            disabled={isLoading || (required && !hasSignature)}
            className="mr-auto"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1" />
            ) : (
              <Save className="h-4 w-4 mr-1" />
            )}
            حفظ التوقيع
          </Button>
        </div>

        {/* إدخال الملف المخفي */}
        <input
          id="file-upload"
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />
      </CardContent>
    </Card>
  );

}
