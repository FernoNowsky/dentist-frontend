import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import type { VisitResponseDto, PageResponseDto, VisitPageRequestDto, UserResponseDto, PageResponseDto as UserPageResponseDto } from "@/types/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { Loader2 } from "lucide-react";

interface ScheduledVisitsProps {
    patientId: string;
}

export function ScheduledVisits({ patientId }: ScheduledVisitsProps) {
    const [selectedDoctorId, setSelectedDoctorId] = useState<string>("");

    // Fetch all doctors
    const { data: doctorsResponse } = useQuery({
        queryKey: ["doctors"],
        queryFn: async () => {
            return apiRequest<UserPageResponseDto<UserResponseDto>>("/users", {
                params: { role: "ADMIN", size: 100 }
            });
        },
    });

    // Fetch visits
    const { data: visitsResponse, isLoading } = useQuery({
        queryKey: ["patient-visits", patientId, selectedDoctorId],
        queryFn: async () => {
            const now = new Date();
            const params: VisitPageRequestDto = {
                dateTimeStart: now.toISOString(),
                patientId: patientId,
                status: "PLANNED",
                size: 100,
            };

            if (selectedDoctorId) {
                params.doctorId = selectedDoctorId;
            }

            return apiRequest<PageResponseDto<VisitResponseDto>>("/visits", { params });
        },
    });

    const visits = visitsResponse?.content || [];
    const doctors = doctorsResponse?.content || [];

    return (
        <div className="space-y-6">
            {/* Doctor Filter */}
            <div className="flex items-center gap-4">
                <Label htmlFor="doctor-filter" className="whitespace-nowrap">Filtruj po lekarzu:</Label>
                <select
                    id="doctor-filter"
                    value={selectedDoctorId}
                    onChange={(e) => setSelectedDoctorId(e.target.value)}
                    className="flex h-10 w-full max-w-xs rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                    <option value="">Wszyscy</option>
                    {doctors.map((doctor) => (
                        <option key={doctor.id} value={doctor.id}>
                            {doctor.firstName} {doctor.lastName}
                        </option>
                    ))}
                </select>
            </div>

            {/* Loading State */}
            {isLoading && (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            )}

            {/* Empty State */}
            {!isLoading && visits.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                    <p className="text-muted-foreground">Brak umówionych wizyt</p>
                </div>
            )}

            {/* Visit Cards */}
            {!isLoading && visits.length > 0 && (
                <div className="space-y-4">
                    {visits.map((visit) => (
                        <Card key={visit.id}>
                            <CardContent className="p-6">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h3 className="font-bold text-lg text-primary">
                                            {format(new Date(visit.dateTimeStart), "d MMMM yyyy, HH:mm", { locale: pl })}
                                        </h3>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Lekarz: {visit.doctor.firstName} {visit.doctor.lastName}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            Czas trwania: {format(new Date(visit.dateTimeStart), "HH:mm")} - {format(new Date(visit.dateTimeEnd), "HH:mm")}
                                        </p>
                                    </div>

                                    <Button variant="outline" className="text-destructive border-destructive hover:text-destructive hover:bg-destructive/10">
                                        Odwołaj wizytę
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
