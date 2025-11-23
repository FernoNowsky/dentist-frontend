import { useQuery } from "@tanstack/react-query";
import { useAuth } from "react-oidc-context";
import { apiRequest } from "@/lib/api";
import type { UserResponseDto } from "@/types/api";

export function useUserCheck() {
    const auth = useAuth();
    const keycloakId = auth.user?.profile.sub;

    return useQuery({
        queryKey: ["user", keycloakId],
        queryFn: async () => {
            if (!keycloakId) throw new Error("No user logged in");
            return apiRequest<UserResponseDto>(`/users/keycloak/${keycloakId}`);
        },
        enabled: !!keycloakId,
        retry: (failureCount, error) => {
            if ((error as any)?.response?.status === 404) return false;
            return failureCount < 3;
        },
        refetchOnWindowFocus: false,
    });
}
