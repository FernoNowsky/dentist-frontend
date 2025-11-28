import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import { toast } from "sonner";
import type { VisitUpdateDto } from "@/types/api";

export function useCancelVisit() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (visitId: string) => {
            const updateData: VisitUpdateDto = {
                status: "CANCELED",
            };
            return apiRequest(`/visits/${visitId}`, {
                method: "put",
                data: updateData,
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["visits"] });
            queryClient.invalidateQueries({ queryKey: ["patient-visits"] });
            toast.success("Wizyta została odwołana.");
        },
        onError: () => {
            toast.error("Wystąpił błąd podczas odwoływania wizyty.");
        },
    });
}
