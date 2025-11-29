import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import type { VisitResponseDto, PageResponseDto, VisitPageRequestDto, UserResponseDto, PageResponseDto as UserPageResponseDto, UserPageRequestDto } from "@/types/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { Loader2, ChevronLeft, ChevronRight, Play, Trash2, FileText, CalendarIcon, Stethoscope } from "lucide-react";
import { Link, useSearch } from "@tanstack/react-router";
import { useUserCheck } from "@/features/auth/hooks/useUserCheck";
import { useCancelVisit } from "@/features/visits/hooks/useCancelVisit";
import { cn } from "@/lib/utils";
import type { DateRange } from "react-day-picker";
import { useDebounce } from "@/hooks/useDebounce";
import { useStartVisit } from "@/features/visits/hooks/useStartVisit";

export function VisitsPage() {
    const { data: currentUser } = useUserCheck();
    const search = useSearch({ from: "/visits" });
    const patientIdFromUrl = (search as any)?.patientId;

    const [selectedDoctorId, setSelectedDoctorId] = useState<string>("all");
    const [status, setStatus] = useState<string>("all");
    const [page, setPage] = useState(0);
    const [size, setSize] = useState(20);
    const [patientFilter, setPatientFilter] = useState("");
    const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
    const cancelVisitMutation = useCancelVisit();
    const startVisitMutation = useStartVisit();

    const debouncedPatientFilter = useDebounce(patientFilter, 500);

    // If patientId is provided in URL or user is a patient, use it
    const effectivePatientId = patientIdFromUrl || (currentUser?.role === "USER" ? currentUser.id : undefined);
    const isPatientView = !!effectivePatientId;

    if (!selectedDoctorId && currentUser?.id) {
        setSelectedDoctorId(currentUser.id);
    }

    const { data: doctorsResponse } = useQuery({
        queryKey: ["doctors"],
        queryFn: async () => {
            return apiRequest<UserPageResponseDto<UserResponseDto>>("/users", {
                params: { role: "ADMIN", size: 100 }
            });
        },
    });

    const { data: patientSearchResponse, isLoading: isPatientSearchLoading } = useQuery({
        queryKey: ["patient-search", debouncedPatientFilter],
        queryFn: async () => {
            if (!debouncedPatientFilter) return null;
            const params: UserPageRequestDto = {
                filter: debouncedPatientFilter,
                role: "USER",
                size: 1
            };
            return apiRequest<PageResponseDto<UserResponseDto>>("/users", { params });
        },
        enabled: !!debouncedPatientFilter && !effectivePatientId,
    });

    const searchedPatientId = patientSearchResponse?.content?.[0]?.id;

    const { data: startedVisitsResponse, isLoading: isStartedLoading } = useQuery({
        queryKey: ["visits-started", selectedDoctorId],
        queryFn: async () => {
            const params: VisitPageRequestDto = {
                status: "STARTED",
                size: 100,
                sortBy: "dateTimeStart",
                sortDirection: "DESC"
            };

            if (selectedDoctorId && selectedDoctorId !== "all") {
                params.doctorId = selectedDoctorId;
            }

            return apiRequest<PageResponseDto<VisitResponseDto>>("/visits", { params });
        },
        enabled: !isPatientView,
    });

    const { data: visitsResponse, isLoading } = useQuery({
        queryKey: ["visits-page", selectedDoctorId, status, page, size, searchedPatientId, debouncedPatientFilter, dateRange, effectivePatientId],
        queryFn: async () => {
            // if filter is typed but no patient found, return empty list
            if (debouncedPatientFilter && !searchedPatientId && !isPatientSearchLoading && !effectivePatientId) {
                return {
                    content: [],
                    page: 0,
                    size,
                    totalElements: 0,
                    totalPages: 0,
                    last: true
                } as PageResponseDto<VisitResponseDto>;
            }

            const params: VisitPageRequestDto = {
                page,
                size,
                sortBy: "dateTimeStart",
                sortDirection: "DESC"
            };

            if (selectedDoctorId && selectedDoctorId !== "all") {
                params.doctorId = selectedDoctorId;
            }

            if (status && status !== "all") {
                params.status = status as any;
            }

            if (effectivePatientId) {
                params.patientId = effectivePatientId;
            } else if (searchedPatientId) {
                params.patientId = searchedPatientId;
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
            } else {
                if (!searchedPatientId && !effectivePatientId) {
                    params.dateTimeEnd = new Date().toISOString();
                }
            }

            return apiRequest<PageResponseDto<VisitResponseDto>>("/visits", { params });
        },
        enabled: (!debouncedPatientFilter || (!!debouncedPatientFilter && !isPatientSearchLoading)) || !!effectivePatientId,
    });

    const startedVisits = startedVisitsResponse?.content || [];
    const visits = visitsResponse?.content || [];
    const doctors = doctorsResponse?.content || [];
    const totalPages = visitsResponse?.totalPages || 0;

    const getStatusLabel = (status: string) => {
        switch (status) {
            case "COMPLETED":
                return "Zakończona";
            case "CANCELED":
                return "Odwołana";
            case "STARTED":
                return "W trakcie";
            case "PLANNED":
                return "Zaplanowana";
            default:
                return status;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "COMPLETED":
                return "text-green-600 bg-green-100";
            case "CANCELED":
                return "text-destructive bg-destructive/10";
            case "STARTED":
                return "text-blue-600 bg-blue-100";
            case "PLANNED":
                return "text-primary bg-primary/10";
            default:
                return "text-muted-foreground bg-muted";
        }
    };

    const formatDateRange = () => {
        if (!dateRange?.from) return "Wybierz datę";
        if (!dateRange.to) return format(dateRange.from, "PPP", { locale: pl });
        return `${format(dateRange.from, "PPP", { locale: pl })} - ${format(dateRange.to, "PPP", { locale: pl })}`;
    };

    const renderVisitTable = (visitsData: VisitResponseDto[], showPagination = false) => (
        <>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Data i godzina</TableHead>
                            <TableHead>Pacjent</TableHead>
                            <TableHead>Kontakt</TableHead>
                            <TableHead>Lekarz</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Akcje</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {visitsData.map((visit) => (
                            <TableRow key={visit.id}>
                                <TableCell className="font-medium">
                                    {format(new Date(visit.dateTimeStart), "d MMM yyyy, HH:mm", { locale: pl })}
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-medium">{visit.patient.firstName} {visit.patient.lastName}</span>
                                        <span className="text-xs text-muted-foreground">PESEL: {visit.patient.pesel || "-"}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    {visit.patient.phone || "-"}
                                </TableCell>
                                <TableCell>
                                    {visit.doctor.firstName} {visit.doctor.lastName}
                                </TableCell>
                                <TableCell>
                                    <span className={`inline-flex items-center justify-center w-[100px] px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(visit.status)}`}>
                                        {getStatusLabel(visit.status)}
                                    </span>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        {visit.status === "PLANNED" && (
                                            <>
                                                <Button size="sm" onClick={() => startVisitMutation.mutate(visit.id)}>
                                                    <Stethoscope className="mr-2 h-4 w-4" />
                                                    Przeprowadź
                                                </Button>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button size="sm" variant="destructive">
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            Odwołaj
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Czy na pewno chcesz odwołać tą wizytę?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Po tej akcji nie będzie można zmienić statusu tej wizyty.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Anuluj</AlertDialogCancel>
                                                            <AlertDialogAction
                                                                onClick={() => cancelVisitMutation.mutate(visit.id)}
                                                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                            >
                                                                Potwierdź
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </>
                                        )}
                                        {visit.status === "STARTED" && (
                                            <Button size="sm" asChild>
                                                <Link to="/visits/$visitId/execution" params={{ visitId: visit.id }}>
                                                    <Stethoscope className="mr-2 h-4 w-4" />
                                                    Przeprowadź
                                                </Link>
                                            </Button>
                                        )}
                                        {visit.status === "COMPLETED" && (
                                            <Button size="sm" variant="outline" asChild>
                                                <Link to="/visits/$visitId/details" params={{ visitId: visit.id }}>
                                                    <FileText className="mr-2 h-4 w-4" />
                                                    Szczegóły wizyty
                                                </Link>
                                            </Button>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {showPagination && (
                <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Wierszy na stronę:</span>
                        <Select
                            value={size.toString()}
                            onValueChange={(val) => {
                                setSize(Number(val));
                                setPage(0);
                            }}
                        >
                            <SelectTrigger className="w-[70px]">
                                <SelectValue placeholder={size.toString()} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="5">5</SelectItem>
                                <SelectItem value="10">10</SelectItem>
                                <SelectItem value="20">20</SelectItem>
                                <SelectItem value="50">50</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground">
                            Strona {page + 1} z {totalPages || 1}
                        </span>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setPage((p) => Math.max(0, p - 1))}
                                disabled={page === 0 || isLoading}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                                disabled={page >= totalPages - 1 || isLoading}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );

    return (
        <div className="space-y-6 py-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold text-primary">Wizyty</h1>
                <p className="text-muted-foreground">
                    Przeglądaj i zarządzaj wizytami w systemie.
                </p>
            </div>

            {startedVisits.length > 0 && (
                <Card className="border-blue-200 bg-blue-50/30">
                    <CardHeader>
                        <CardTitle className="text-primary flex items-center gap-2">
                            <Play className="h-5 w-5" />
                            Wizyty w trakcie
                        </CardTitle>
                        <CardDescription>
                            Wizyty, które aktualnie trwają.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isStartedLoading ? (
                            <div className="flex items-center justify-center py-4">
                                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                            </div>
                        ) : (
                            renderVisitTable(startedVisits, false)
                        )}
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Historia i planowane wizyty</CardTitle>
                    <CardDescription>
                        Lista wszystkich wizyt w systemie.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-4 mb-6 flex-wrap">
                        <div className="flex flex-col gap-2 w-[250px]">
                            <Label htmlFor="doctor-filter">Lekarz</Label>
                            <Select
                                value={selectedDoctorId}
                                onValueChange={(val) => {
                                    setSelectedDoctorId(val);
                                    setPage(0);
                                }}
                            >
                                <SelectTrigger id="doctor-filter">
                                    <SelectValue placeholder="Wybierz lekarza" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Wszyscy</SelectItem>
                                    {doctors.map((doctor) => (
                                        <SelectItem key={doctor.id} value={doctor.id}>
                                            {doctor.firstName} {doctor.lastName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex flex-col gap-2 w-[200px]">
                            <Label htmlFor="status-filter">Status</Label>
                            <Select
                                value={status}
                                onValueChange={(val) => {
                                    setStatus(val);
                                    setPage(0);
                                }}
                            >
                                <SelectTrigger id="status-filter">
                                    <SelectValue placeholder="Wybierz status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Wszystkie</SelectItem>
                                    <SelectItem value="PLANNED">Zaplanowana</SelectItem>
                                    <SelectItem value="STARTED">W trakcie</SelectItem>
                                    <SelectItem value="COMPLETED">Zakończona</SelectItem>
                                    <SelectItem value="CANCELED">Odwołana</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {!effectivePatientId && (
                            <div className="flex flex-col gap-2 w-[200px]">
                                <Label htmlFor="patient-filter">Nazwisko/PESEL/Telefon</Label>
                                <Input
                                    id="patient-filter"
                                    placeholder=""
                                    value={patientFilter}
                                    onChange={(e) => {
                                        setPatientFilter(e.target.value);
                                        setPage(0);
                                    }}
                                />
                            </div>
                        )}

                        <div className="flex flex-col gap-2 w-[250px]">
                            <Label>Data</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            "w-full justify-start text-left font-normal",
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
                                        onSelect={(range) => {
                                            setDateRange(range);
                                            setPage(0);
                                        }}
                                        locale={pl}
                                        initialFocus
                                        numberOfMonths={2}
                                    />
                                    {dateRange?.from && (
                                        <div className="p-3 border-t">
                                            <Button
                                                variant="outline"
                                                className="w-full"
                                                onClick={() => setDateRange(undefined)}
                                            >
                                                Wyczyść datę
                                            </Button>
                                        </div>
                                    )}
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>

                    {isLoading || (debouncedPatientFilter && isPatientSearchLoading) ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : visits.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            {debouncedPatientFilter && !searchedPatientId ? "Nie znaleziono pacjenta o podanym numerze PESEL." : "Brak wizyt spełniających kryteria."}
                        </div>
                    ) : (
                        renderVisitTable(visits, true)
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
