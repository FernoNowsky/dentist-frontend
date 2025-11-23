import { useQuery } from "@tanstack/react-query";
import type { UserResponseDto } from "@/types/api";

interface UsePatientsOptions {
    page?: number;
    size?: number;
    search?: string;
}

export function usePatients({ page = 0, size = 10, search }: UsePatientsOptions = {}) {
    return useQuery({
        queryKey: ["patients", page, size, search],
        queryFn: async () => {
            // Mock data
            const mockPatients: UserResponseDto[] = [
                {
                    id: "1",
                    keycloakId: "mock-k-1",
                    firstName: "Jan",
                    lastName: "Kowalski",
                    email: "jan.kowalski@example.com",
                    role: "USER",
                    pesel: "90010112345",
                    phoneNumber: "123456789"
                },
                {
                    id: "2",
                    keycloakId: "mock-k-2",
                    firstName: "Anna",
                    lastName: "Nowak",
                    email: "anna.nowak@example.com",
                    role: "USER",
                    pesel: "92030354321",
                    phoneNumber: "987654321"
                },
                {
                    id: "3",
                    keycloakId: "mock-k-3",
                    firstName: "Piotr",
                    lastName: "Zieliński",
                    email: "piotr.zielinski@example.com",
                    role: "USER",
                    pesel: "85051509876",
                    phoneNumber: "555666777"
                }
            ];

            // Simulate loading
            await new Promise(resolve => setTimeout(resolve, 500));

            return {
                content: mockPatients,
                totalPages: 1,
                totalElements: 3,
                size: 10,
                number: 0
            };
        },
    });
}
