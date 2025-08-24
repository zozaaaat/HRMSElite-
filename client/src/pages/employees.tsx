import {useTranslation} from 'react-i18next';
import {SharedLayout} from '../components/shared-layout';

export default function EmployeesPage() {
  const {t} = useTranslation();
  return (
    <SharedLayout
      userRole="company_manager"
      userName={t('user.manager')}
      companyName={t('company.blueNileJewelry')}
    >
      <div className="p-4">
        <h1 className="text-3xl font-bold">{t('employees.title')}</h1>
      </div>
    </SharedLayout>
  );
}
