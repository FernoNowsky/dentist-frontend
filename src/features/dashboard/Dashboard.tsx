import { useUserCheck } from "../auth/hooks/useUserCheck";
import { CompleteProfileDialog } from "../auth/components/CompleteProfileDialog";
import { DoctorDashboard } from "./DoctorDashboard";
import { PatientDashboard } from "./PatientDashboard";
import { Navbar } from "@/components/layout/Navbar";

import { useAuth } from "react-oidc-context";
import { hasKeycloakRole } from "@/lib/auth-utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import { type DentistCreateDto } from "@/types/api";
import { useEffect, useRef } from "react";

export function Dashboard() {
    const auth = useAuth();
    const { data: user, isLoading, isError, error } = useUserCheck();
    const queryClient = useQueryClient();

    const dentistCreationInitiated = useRef(false);

    const isAdmin = hasKeycloakRole(auth.user?.access_token, "ADMIN");

    const createDentistMutation = useMutation({
        mutationFn: async (data: DentistCreateDto) => {
            return await apiRequest("/users/doctor", { method: "post", data });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["user"] });
        },
        onError: () => {
            dentistCreationInitiated.current = false;
        },
    });

    // If 404 (user not found) and not admin, show dialog
    const showCompleteProfile = isError && (error as any)?.response?.status === 404 && !isAdmin;
    const shouldCreateDentist = isAdmin && isError && (error as any)?.response?.status === 404;

    useEffect(() => {
        // Only proceed if we should create dentist AND haven't already initiated creation
        if (shouldCreateDentist && auth.user?.profile && !dentistCreationInitiated.current) {
            const firstName = (auth.user.profile.given_name as string) || "";
            const lastName = (auth.user.profile.family_name as string) || "";
            const email = (auth.user.profile.email as string) || "";
            const keycloakId = auth.user.profile.sub || "";
            const username = auth.user.profile.preferred_username || "";

            if (firstName && lastName && email && keycloakId) {
                dentistCreationInitiated.current = true;

                createDentistMutation.mutate({
                    firstName,
                    lastName,
                    email,
                    keycloakId,
                    username,
                });
            }
        }
    }, [shouldCreateDentist, auth.user?.profile]);

    useEffect(() => {
        if (!auth.isLoading && !auth.isAuthenticated) {
            auth.signinRedirect();
        }
    }, [auth.isLoading, auth.isAuthenticated, auth]);

    if (auth.isLoading || !auth.isAuthenticated) {
        return <div>Loading authentication...</div>;
    }

    if (isLoading) {
        return <div>Loading user data...</div>;
    }

    // If user needs to complete profile
    if (showCompleteProfile) {
        return <CompleteProfileDialog open={true} />;
    }

    // If admin with 404, show doctor dashboard (dentist will be created via useEffect)
    if (isAdmin && isError) {
        return (
            <div className="min-h-screen bg-background">
                <Navbar />
                <main className="container mx-auto px-4">
                    <DoctorDashboard />
                </main>
            </div>
        );
    }

    // Type guard: ensure user is defined
    if (!user) {
        return <div>Error: User data not available</div>;
    }

    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            <main className="container mx-auto px-4">
                {!isAdmin ? (
                    <PatientDashboard user={user} />
                ) : (
                    <DoctorDashboard />
                )}
            </main>
        </div>
    );
}
