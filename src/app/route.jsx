
import pageRoutes from 'app/pages/PageRoutes';

import MatxLayout from 'base/components/MatxLayout/MatxLayout';
import NotFound from 'base/components/NotFound/NotFound';
import Signout from 'base/components/Signout/Signout';
import { Navigate } from 'react-router-dom';
import dashboardRoutes from './pages/dashboard/DashboardRoutes';

const routes = [
  {
    element: (
      // <AuthGuard>
      <MatxLayout />
      // </AuthGuard>
    ),
    children: [
      ...dashboardRoutes,
      ...pageRoutes,
      { path: '/', element: <Navigate to='dashboard/default' /> },
      { path: '*', element: <NotFound /> },
      // , ...chartsRoute
      // , ...materialRoutes
    ],
  },
  { path: '/signout.html/', element: <Signout /> },
];

export default routes;
