import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import type { VisitUpdateDto } from "@/types/api";

export function useStartVisit() {
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    return useMutation({
        mutationFn: async (visitId: string) => {
            const updateData: VisitUpdateDto = {
                status: "STARTED",
            };
            return apiRequest(`/visits/${visitId}`, {
                method: "put",
                data: updateData,
            });
        },
        onSuccess: (_, visitId) => {
            queryClient.invalidateQueries({ queryKey: ["visits"] });
            queryClient.invalidateQueries({ queryKey: ["visits-started"] });
            queryClient.invalidateQueries({ queryKey: ["visits-page"] });
            queryClient.invalidateQueries({ queryKey: ["patient-visits"] });
            toast.success("Wizyta rozpoczęta.");
            navigate({ to: "/visits/$visitId/execution", params: { visitId } });
        },
        onError: () => {
            toast.error("Wystąpił błąd podczas rozpoczynania wizyty.");
        },
    });
}
