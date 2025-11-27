import { createRouter, createRootRoute, createRoute, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import { AuthProvider } from './features/auth/AuthProvider';
import { LandingPage } from './routes/LandingPage';
import { Dashboard } from './features/dashboard/Dashboard';
import { PatientsPage } from './features/patients/PatientsPage';
import { PatientDetailsPage } from './features/patients/PatientDetailsPage';
import { AboutPage } from './routes/AboutPage';
import { VisitExecutionPage } from './features/visits/VisitExecutionPage';
import { VisitDetailsPage } from './features/visits/VisitDetailsPage';
import { Navbar } from './components/layout/Navbar';

import { Toaster } from 'sonner';

const rootRoute = createRootRoute({
    component: () => (
        <AuthProvider>
            <Outlet />
            <Toaster />
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

const visitExecutionRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/visits/$visitId/execution',
    component: () => (
        <div className="min-h-screen bg-background">
            <Navbar />
            <main className="container mx-auto px-4">
                <VisitExecutionPage />
            </main>
        </div>
    ),
});

const visitDetailsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/visits/$visitId/details',
    component: () => (
        <div className="min-h-screen bg-background">
            <Navbar />
            <main className="container mx-auto px-4">
                <VisitDetailsPage />
            </main>
        </div>
    ),
});

const routeTree = rootRoute.addChildren([
    indexRoute,
    aboutRoute,
    dashboardRoute,
    patientsRoute,
    patientDetailsRoute,
    visitExecutionRoute,
    visitDetailsRoute
]);

export const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
    interface Register {
        router: typeof router;
    }
}
