import { createRouter, RouterProvider, createRootRoute, createRoute, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import { AuthProvider } from './features/auth/AuthProvider';
import { LandingPage } from './routes/LandingPage';
import { Dashboard } from './features/dashboard/Dashboard';
import { PatientsPage } from './features/patients/PatientsPage';
import { PatientDetailsPage } from './features/patients/PatientDetailsPage';
import { AboutPage } from './routes/AboutPage';

const rootRoute = createRootRoute({
    component: () => (
        <AuthProvider>
            <Outlet />
            <TanStackRouterDevtools />
        </AuthProvider>
    ),
});

const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    component: LandingPage,
});

const aboutRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/about',
    component: AboutPage,
});

const dashboardRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/dashboard',
    component: Dashboard,
});

const patientsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/patients',
    component: PatientsPage,
});

const patientDetailsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/patients/$id',
    component: PatientDetailsPage,
});

const routeTree = rootRoute.addChildren([indexRoute, aboutRoute, dashboardRoute, patientsRoute, patientDetailsRoute]);

export const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
    interface Register {
        router: typeof router;
    }
}
