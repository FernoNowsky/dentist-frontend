import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { useState } from "react";
import type { UserResponseDto } from "@/types/api";
import { apiRequest } from "@/lib/api";

interface CreateVisitDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    patient: UserResponseDto | null;
}

export function CreateVisitDialog({ open, onOpenChange, patient }: CreateVisitDialogProps) {
    const [date, setDate] = useState<Date | undefined>(undefined);
    const [time, setTime] = useState<string>("09:00");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!date || !patient) return;

        setIsLoading(true);
        try {
            // Combine date and time
            const [hours, minutes] = time.split(":").map(Number);
            const visitDate = new Date(date);
            visitDate.setHours(hours, minutes);

            await apiRequest("/visits", {
                method: "post",
                data: {
                    patientId: patient.id,
                    doctorId: "current-doctor-id", // TODO: Get from auth context
                    date: visitDate.toISOString(),
                }
            });
            onOpenChange(false);
            // TODO: Invalidate queries
        } catch (error) {
            console.error("Failed to create visit", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Utwórz nową wizytę</DialogTitle>
                    <DialogDescription>
                        Zaplanuj wizytę dla pacjenta {patient?.firstName} {patient?.lastName}.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">
                                Pacjent
                            </Label>
                            <Input
                                id="name"
                                value={`${patient?.firstName} ${patient?.lastName}`}
                                disabled
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Data</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                            "col-span-3 justify-start text-left font-normal",
                                            !date && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {date ? format(date, "PPP", { locale: pl }) : <span>Wybierz datę</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={date}
                                        onSelect={setDate}
                                        initialFocus
                                        locale={pl}
                                        disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="time" className="text-right">
                                Godzina
                            </Label>
                            <Input
                                id="time"
                                type="time"
                                value={time}
                                onChange={(e) => setTime(e.target.value)}
                                className="col-span-3"
                                required
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={isLoading || !date}>
                            {isLoading ? "Tworzenie..." : "Utwórz wizytę"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
