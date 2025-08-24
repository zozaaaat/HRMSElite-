import {SharedLayout} from '../components/shared-layout';
import {useTranslation} from 'react-i18next';

export default function AttendancePage() {
  const {t} = useTranslation();
  return (
    <SharedLayout
      userRole="employee"
      userName={t('attendance.userName')}
      companyName={t('attendance.companyName')}
    >
      <div className="p-4">
        <h1 className="text-3xl font-bold mb-4">{t('attendance.title')}</h1>
        <p>{t('attendance.description')}</p>
      </div>
    </SharedLayout>
  );
}
