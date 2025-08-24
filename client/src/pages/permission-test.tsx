import {PermissionTest} from '../components/shared/PermissionTest';
import {ProtectedRoute} from '../components/shared/ProtectedRoute';
import { t } from "i18next";

export default function PermissionTestPage () {

  return (
    <ProtectedRoute pageId="dashboard">
      <div className="container mx-auto py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">{t('auto.permission-test.1')}</h1>
          <p className="text-muted-foreground mt-2">
            {t('auto.permission-test.2')}</p>
        </div>

        <PermissionTest />
      </div>
    </ProtectedRoute>
  );

}
