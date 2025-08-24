import { Route } from 'wouter';
import { routes } from '../lib/routes';
import { CompanySelection, Login } from '../pages/lazy-pages';
import { t } from "i18next";

const AuthRoutes = () => (
  <>
    <Route path={routes.public.home}>
      <CompanySelection />
    </Route>
    <Route path={routes.public.login}>
      <Login />
    </Route>
  </>
);

export default AuthRoutes;
