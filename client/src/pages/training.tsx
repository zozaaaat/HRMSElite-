import {useTranslation} from 'react-i18next';
import {SharedLayout} from '../components/shared-layout';

export default function Training () {
  const {t} = useTranslation();
  return (
    <SharedLayout
      userRole="company_manager"
      userName={t('user.manager')}
      companyName={t('company.blueNileJewelry')}
    >
      <div className="p-4">
        <h1 className="text-3xl font-bold">{t('training.pageTitle')}</h1>
      </div>
    </SharedLayout>
  );
}
