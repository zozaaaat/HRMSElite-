import { Route } from 'wouter';
import { ProtectedRoute } from '../components/shared';
import { routes } from '../lib/routes';
import {
  Companies,
  Reports,
  Settings,
  AccountingSystems,
  GovernmentForms,
} from '../pages/lazy-pages';

const AdminRoutes = () => (
  <>
    <Route path={routes.functional.companies}>
      <ProtectedRoute pageId="companies" requiredRole="super_admin">
        <Companies />
      </ProtectedRoute>
    </Route>
    <Route path={routes.functional.reports}>
      <ProtectedRoute pageId="reports" requiredRole="company_manager">
        <Reports />
      </ProtectedRoute>
    </Route>
    <Route path={routes.functional.settings}>
      <ProtectedRoute pageId="settings">
        <Settings />
      </ProtectedRoute>
    </Route>
    <Route path={routes.functional.accounting_systems}>
      <ProtectedRoute pageId="accounting-systems">
        <AccountingSystems />
      </ProtectedRoute>
    </Route>
    <Route path={routes.functional.government_forms}>
      <ProtectedRoute pageId="government-forms">
        <GovernmentForms />
      </ProtectedRoute>
    </Route>
  </>
);

export default AdminRoutes;
