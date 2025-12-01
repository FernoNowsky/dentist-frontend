import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import type { VisitResponseDto, PageResponseDto, VisitPageRequestDto, UserResponseDto, PageResponseDto as UserPageResponseDto } from "@/types/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { Loader2, CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DateRange } from "react-day-picker";
import { Link } from "@tanstack/react-router";

interface VisitHistoryProps {
    patientId: string;
}

export function VisitHistory({ patientId }: VisitHistoryProps) {
    const [selectedDoctorId, setSelectedDoctorId] = useState<string>("");
    const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

    const { data: doctorsResponse } = useQuery({
        queryKey: ["doctors"],
        queryFn: async () => {
            return apiRequest<UserPageResponseDto<UserResponseDto>>("/users", {
                params: { role: "ADMIN", size: 100 }
            });
        },
    });

    const { data: visitsResponse, isLoading } = useQuery({
        queryKey: ["patient-visit-history", patientId, selectedDoctorId, dateRange],
        queryFn: async () => {
            const now = new Date();
            const params: VisitPageRequestDto = {
                status: "COMPLETED",
                dateTimeEnd: now.toISOString(),
                patientId: patientId,
                size: 100,
                sortBy: "dateTimeStart",
                sortDirection: "DESC"
            };

            if (selectedDoctorId) {
                params.doctorId = selectedDoctorId;
            }

            if (dateRange?.from) {
                const startOfDay = new Date(dateRange.from);
                startOfDay.setHours(0, 0, 0, 0);
                params.dateTimeStart = startOfDay.toISOString();

                if (dateRange.to) {
                    const endOfDay = new Date(dateRange.to);
                    endOfDay.setHours(23, 59, 59, 999);
                    params.dateTimeEnd = endOfDay.toISOString();
                } else {
                    const endOfDay = new Date(dateRange.from);
                    endOfDay.setHours(23, 59, 59, 999);
                    params.dateTimeEnd = endOfDay.toISOString();
                }
            }

            return apiRequest<PageResponseDto<VisitResponseDto>>("/visits", { params });
        },
    });

    const visits = visitsResponse?.content || [];
    const doctors = doctorsResponse?.content || [];

    const getStatusLabel = (status: string) => {
        switch (status) {
            case "COMPLETED":
                return "Zakończona";
            case "CANCELED":
                return "Odwołana";
            case "STARTED":
                return "W trakcie";
            default:
                return status;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "COMPLETED":
                return "text-green-600";
            case "CANCELED":
                return "text-destructive";
            case "STARTED":
                return "text-blue-600";
            default:
                return "text-muted-foreground";
        }
    };

    const formatDateRange = () => {
        if (!dateRange?.from) return "Wybierz datę";
        if (!dateRange.to) return format(dateRange.from, "PPP", { locale: pl });
        return `${format(dateRange.from, "PPP", { locale: pl })} - ${format(dateRange.to, "PPP", { locale: pl })}`;
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4 flex-wrap">
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

                <div className="flex items-center gap-4">
                    <Label className="whitespace-nowrap">Filtruj po dacie:</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className={cn(
                                    "w-[300px] justify-start text-left font-normal",
                                    !dateRange?.from && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {formatDateRange()}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="range"
                                selected={dateRange}
                                onSelect={setDateRange}
                                locale={pl}
                                initialFocus
                                numberOfMonths={2}
                                disabled={{ after: new Date() }}
                            />
                            {dateRange?.from && (
                                <div className="p-3 border-t">
                                    <Button
                                        variant="outline"
                                        className="w-full"
                                        onClick={() => setDateRange(undefined)}
                                    >
                                        Wyczyść filtr
                                    </Button>
                                </div>
                            )}
                        </PopoverContent>
                    </Popover>
                </div>
            </div>

            {isLoading && (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            )}

            {!isLoading && visits.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                    <p className="text-muted-foreground">Brak wizyt w historii</p>
                </div>
            )}

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
                                            Dentysta: {visit.doctor.firstName} {visit.doctor.lastName}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            Czas trwania: {format(new Date(visit.dateTimeStart), "HH:mm")} - {format(new Date(visit.dateTimeEnd), "HH:mm")}
                                        </p>
                                        <p className={`text-sm font-semibold mt-2 ${getStatusColor(visit.status)}`}>
                                            Status: {getStatusLabel(visit.status)}
                                        </p>
                                    </div>

                                    {visit.status === "COMPLETED" && (
                                        <Button asChild>
                                            <Link to="/visits/$visitId/details" params={{ visitId: visit.id }}>
                                                Szczegóły wizyty
                                            </Link>
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
