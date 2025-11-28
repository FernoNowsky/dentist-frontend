import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
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
import { apiRequest } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import type { VisitResponseDto, PageResponseDto, VisitPageRequestDto } from "@/types/api";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { useUserCheck } from "@/features/auth/hooks/useUserCheck";
import { useCancelVisit } from "@/features/visits/hooks/useCancelVisit";
import { useStartVisit } from "@/features/visits/hooks/useStartVisit";
import { Stethoscope } from "lucide-react";

export function DoctorDashboard() {
    const [date, setDate] = useState<Date | undefined>(new Date());
    const { data: currentUser } = useUserCheck();


    const { data: visitsResponse, isLoading } = useQuery({
        queryKey: ["visits", date, currentUser?.id],
        queryFn: async () => {
            if (!date || !currentUser?.id) return null;

            const now = new Date();
            const isToday = date.toDateString() === now.toDateString();

            const startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0);
            const dateTimeStart = isToday ? now : startOfDay;

            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);

            const params: VisitPageRequestDto = {
                dateTimeStart: dateTimeStart.toISOString(),
                dateTimeEnd: endOfDay.toISOString(),
                doctorId: currentUser.id,
                status: "PLANNED",
                size: 100,
            };

            return apiRequest<PageResponseDto<VisitResponseDto>>("/visits", { params });
        },
        enabled: !!date && !!currentUser?.id,
    });

    const cancelVisitMutation = useCancelVisit();
    const startVisitMutation = useStartVisit();

    const visits = visitsResponse?.content || [];

    return (
        <div className="flex flex-col lg:flex-row gap-8 h-auto lg:h-[calc(100vh-80px)] overflow-hidden pt-8">
            <div className="flex-1 flex flex-col h-full min-h-[500px]">
                <h2 className="text-2xl font-bold text-primary">
                    Zaplanowane wizyty, {date ? format(date, "d MMMM yyyy", { locale: pl }) : "Wybierz datę"}
                </h2>
                <p className="text-muted-foreground mb-6">
                    Tutaj znajdziesz swoje zaplanowane wizyty
                </p>

                <div className="space-y-4 overflow-y-auto flex-1 pr-4">
                    {isLoading ? (
                        <div className="text-muted-foreground">Ładowanie...</div>
                    ) : visits.length === 0 ? (
                        <div className="text-muted-foreground">Brak wizyt na ten dzień.</div>
                    ) : (
                        visits.map((visit) => (
                            <Card key={visit.id}>
                                <CardContent className="p-6 flex flex-col justify-between">
                                    <div>
                                        <h3 className="font-bold text-lg">
                                            {visit.patient.firstName} {visit.patient.lastName}, {format(new Date(visit.dateTimeStart), "d MMMM yyyy, HH:mm", { locale: pl })}
                                        </h3>
                                        <p className="text-muted-foreground text-sm">PESEL: {visit.patient.pesel || "Brak"}</p>
                                    </div>
                                    <div className="flex gap-2 flex-col sm:flex-row mt-4 justify-between">
                                        <Button onClick={() => startVisitMutation.mutate(visit.id)}>
                                            <Stethoscope className="mr-2 h-4 w-4" />
                                            Przeprowadź wizytę
                                        </Button>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="outline" className="text-destructive border-destructive hover:text-destructive hover:bg-destructive/10">
                                                    Odwołaj wizytę
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
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </div>

            <div className="w-full lg:w-fit flex justify-center lg:block">
                <Card>
                    <CardContent className="p-4">
                        <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            locale={pl}
                            className="rounded-md border w-full"
                            classNames={{
                                month: "space-y-4 w-full",
                                table: "w-full border-collapse space-y-1",
                                head_row: "flex",
                                row: "flex w-full mt-2",
                                cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                                day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100",
                                day_selected:
                                    "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                                day_today: "bg-accent text-accent-foreground",
                                day_outside:
                                    "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
                                day_disabled: "text-muted-foreground opacity-50",
                                day_range_middle:
                                    "aria-selected:bg-accent aria-selected:text-accent-foreground",
                                day_hidden: "invisible",
                            }}
                        />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
