import React from 'react';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { useI18n } from '../hooks/useI18n';

export const I18nTest: React.FC = () => {
  const { t } = useTranslation();
  const { currentLanguage, isRTL, formatDate, formatNumber, formatCurrency } = useI18n();

  const testDate = new Date();
  const testNumber = 1234.56;
  const testAmount = 5000;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('common.dashboard')}</h1>
        <LanguageSwitcher />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">{t('common.employees')}</h2>
          <div className="space-y-2">
            <p><strong>{t('employees.form.name')}:</strong> {t('employees.form.name')}</p>
            <p><strong>{t('employees.form.email')}:</strong> {t('employees.form.email')}</p>
            <p><strong>{t('employees.form.position')}:</strong> {t('employees.form.position')}</p>
            <p><strong>{t('employees.form.department')}:</strong> {t('employees.form.department')}</p>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">{t('common.attendance')}</h2>
          <div className="space-y-2">
            <p><strong>{t('attendance.checkIn')}:</strong> {t('attendance.checkIn')}</p>
            <p><strong>{t('attendance.checkOut')}:</strong> {t('attendance.checkOut')}</p>
            <p><strong>{t('attendance.present')}:</strong> {t('attendance.present')}</p>
            <p><strong>{t('attendance.absent')}:</strong> {t('attendance.absent')}</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">{t('common.reports')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border rounded">
            <p><strong>{t('reports.employeeReport')}</strong></p>
            <p>{t('reports.generateReport')}</p>
          </div>
          <div className="p-4 border rounded">
            <p><strong>{t('reports.attendanceReport')}</strong></p>
            <p>{t('reports.exportReport')}</p>
          </div>
          <div className="p-4 border rounded">
            <p><strong>{t('reports.payrollReport')}</strong></p>
            <p>{t('reports.dateRange')}</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">{t('common.settings')}</h2>
        <div className="space-y-2">
          <p><strong>{t('settings.language')}:</strong> {currentLanguage}</p>
          <p><strong>RTL:</strong> {isRTL ? 'Yes' : 'No'}</p>
          <p><strong>{t('dateTime.today')}:</strong> {formatDate(testDate)}</p>
          <p><strong>{t('numbers.decimal')}:</strong> {formatNumber(testNumber)}</p>
          <p><strong>{t('numbers.currency')}:</strong> {formatCurrency(testAmount)}</p>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">{t('validation.title')}</h2>
        <div className="space-y-2">
          <p className="text-red-600">{t('validation.required')}</p>
          <p className="text-red-600">{t('validation.email')}</p>
          <p className="text-red-600">{t('validation.phone')}</p>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">{t('messages.title')}</h2>
        <div className="space-y-2">
          <p className="text-green-600">{t('messages.saveSuccess')}</p>
          <p className="text-green-600">{t('messages.updateSuccess')}</p>
          <p className="text-red-600">{t('messages.operationFailed')}</p>
        </div>
      </div>
    </div>
  );
};
