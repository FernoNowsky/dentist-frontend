import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import type { PageResponseDto, UserResponseDto, UserPageRequestDto } from "@/types/api";

interface UsePatientsOptions {
    page?: number;
    size?: number;
    search?: string;
}

export function usePatients({ page = 0, size = 10, search = "" }: UsePatientsOptions = {}) {
    return useQuery({
        queryKey: ["patients", page, size, search],
        queryFn: async () => {
            const isUUID = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(search);

            if (isUUID) {
                try {
                    const user = await apiRequest<UserResponseDto>(`/users/${search}`);
                    return {
                        content: [user],
                        page: 0,
                        size: 1,
                        totalElements: 1,
                        totalPages: 1,
                        last: true
                    } as PageResponseDto<UserResponseDto>;
                } catch (error) {
                    // If UUID search fails (e.g. 404), return empty page
                    return {
                        content: [],
                        page: 0,
                        size: size,
                        totalElements: 0,
                        totalPages: 0,
                        last: true
                    } as PageResponseDto<UserResponseDto>;
                }
            }

            const params: UserPageRequestDto = {
                page,
                size,
                role: 'USER'
            };

            params.filter = search;

            return apiRequest<PageResponseDto<UserResponseDto>>("/users", {
                params,
            });
        },
        placeholderData: keepPreviousData,
    });
}
