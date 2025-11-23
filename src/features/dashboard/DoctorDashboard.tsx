import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { apiRequest } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import type { VisitResponseDto } from "@/types/api";
import { format } from "date-fns";
import { pl } from "date-fns/locale";

export function DoctorDashboard() {
    const [date, setDate] = useState<Date | undefined>(new Date());

    const { data: visits } = useQuery({
        queryKey: ["visits", date],
        queryFn: async () => {
            return apiRequest<{ content: VisitResponseDto[] }>("/visits", { params: { size: 100 } });
        },
    });

    const fetchedVisits = visits?.content || [];

    // Mock data
    const mockVisits: VisitResponseDto[] = [
        {
            id: "mock-1",
            patientId: "99072077618",
            doctorId: "doc-1",
            date: new Date().toISOString(), // Today
            status: "SCHEDULED",
            patientName: "Izabela Makłowicz",
        },
        {
            id: "mock-2",
            patientId: "82061671654",
            doctorId: "doc-1",
            date: new Date(new Date().setHours(new Date().getHours() + 1)).toISOString(), // Today + 1h
            status: "SCHEDULED",
            patientName: "Mikołaj Konieczny",
        },
        {
            id: "mock-3",
            patientId: "90010112345",
            doctorId: "doc-1",
            date: new Date(new Date().setHours(new Date().getHours() + 2)).toISOString(),
            status: "SCHEDULED",
            patientName: "Jan Kowalski",
        },
        {
            id: "mock-4",
            patientId: "92030354321",
            doctorId: "doc-1",
            date: new Date(new Date().setHours(new Date().getHours() + 3)).toISOString(),
            status: "SCHEDULED",
            patientName: "Anna Nowak",
        },
        {
            id: "mock-5",
            patientId: "85051509876",
            doctorId: "doc-1",
            date: new Date(new Date().setHours(new Date().getHours() + 4)).toISOString(),
            status: "SCHEDULED",
            patientName: "Piotr Zieliński",
        },
        {
            id: "mock-6",
            patientId: "88080812345",
            doctorId: "doc-1",
            date: new Date(new Date().setHours(new Date().getHours() + 5)).toISOString(),
            status: "SCHEDULED",
            patientName: "Katarzyna Wiśniewska",
        },
        {
            id: "mock-7",
            patientId: "75050598765",
            doctorId: "doc-1",
            date: new Date(new Date().setHours(new Date().getHours() + 6)).toISOString(),
            status: "SCHEDULED",
            patientName: "Marek Wójcik",
        },
        {
            id: "mock-8",
            patientId: "95020211223",
            doctorId: "doc-1",
            date: new Date(new Date().setHours(new Date().getHours() + 7)).toISOString(),
            status: "SCHEDULED",
            patientName: "Magdalena Kamińska",
        },
        {
            id: "mock-9",
            patientId: "80010133445",
            doctorId: "doc-1",
            date: new Date(new Date().setHours(new Date().getHours() + 8)).toISOString(),
            status: "SCHEDULED",
            patientName: "Tomasz Lewandowski",
        },
        {
            id: "mock-10",
            patientId: "98090955667",
            doctorId: "doc-1",
            date: new Date(new Date().setHours(new Date().getHours() + 9)).toISOString(),
            status: "SCHEDULED",
            patientName: "Agnieszka Szymańska",
        },
        {
            id: "mock-11",
            patientId: "83030377889",
            doctorId: "doc-1",
            date: new Date(new Date().setHours(new Date().getHours() + 10)).toISOString(),
            status: "SCHEDULED",
            patientName: "Krzysztof Dąbrowski",
        },
        {
            id: "mock-12",
            patientId: "91040499001",
            doctorId: "doc-1",
            date: new Date(new Date().setHours(new Date().getHours() + 11)).toISOString(),
            status: "SCHEDULED",
            patientName: "Ewa Kozłowska",
        },
    ];

    const displayVisits = fetchedVisits.length > 0 ? fetchedVisits : mockVisits;

    const todayVisits = displayVisits.filter(v => {
        if (!date) return false;
        const visitDate = new Date(v.date);
        return visitDate.toDateString() === date.toDateString();
    });

    return (
        <div className="flex flex-col lg:flex-row gap-8 h-auto lg:h-[calc(100vh-80px)] overflow-hidden pt-8">
            <div className="flex-1 flex flex-col h-full min-h-[500px]">
                <h2 className="text-2xl font-bold mb-2">
                    Zaplanowane wizyty, {date ? format(date, "d MMMM yyyy", { locale: pl }) : "Wybierz datę"}
                </h2>
                <p className="text-muted-foreground mb-6">
                    Tutaj znajdziesz swoje zaplanowane wizyty
                </p>

                <div className="space-y-4 overflow-y-auto flex-1 pr-4">
                    {todayVisits.length === 0 ? (
                        <div className="text-muted-foreground">Brak wizyt na ten dzień.</div>
                    ) : (
                        todayVisits.map((visit) => (
                            <Card key={visit.id}>
                                <CardContent className="p-6 flex justify-between items-center">
                                    <div>
                                        <h3 className="font-bold text-lg">
                                            {visit.patientName || "Pacjent"}, {format(new Date(visit.date), "d MMMM yyyy, HH:mm", { locale: pl })}
                                        </h3>
                                        <p className="text-muted-foreground text-sm">PESEL: {visit.patientId}</p>
                                    </div>
                                    <div className="flex gap-2 flex-col sm:flex-row">
                                        <Button>Przeprowadź wizytę</Button>
                                        <Button variant="outline" className="text-destructive border-destructive hover:bg-destructive/10">
                                            Odwołaj wizytę
                                        </Button>
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
