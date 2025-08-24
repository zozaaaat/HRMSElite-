import {useTranslation} from 'react-i18next';
import {SharedLayout} from '../components/shared-layout';

export default function PayrollPage() {
  const {t} = useTranslation();
  return (
    <SharedLayout
      userRole="employee"
      userName={t('user.ahmed')}
      companyName={t('company.blueNileJewelry')}
    >
      <div className="p-4">
        <h1 className="text-3xl font-bold">{t('payroll.title')}</h1>
      </div>
    </SharedLayout>
  );
}
