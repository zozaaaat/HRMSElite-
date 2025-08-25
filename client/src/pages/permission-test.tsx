import {PermissionTest} from '../components/shared/PermissionTest';
import {ProtectedRoute} from '../components/shared/ProtectedRoute';

export default function PermissionTestPage () {

  return (
    <ProtectedRoute pageId="dashboard">
      <main role="main" className="container mx-auto py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">اختبار نظام الصلاحيات</h1>
          <p className="text-muted-foreground mt-2">
            عرض واختبار نظام الأدوار والصلاحيات في التطبيق
          </p>
        </div>

        <PermissionTest />
    </main>
  </ProtectedRoute>
  );

}
