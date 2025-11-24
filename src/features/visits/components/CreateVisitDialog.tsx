import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUserCheck } from "@/features/auth/hooks/useUserCheck";
import { Plus, Calendar, Clock, User, Stethoscope } from "lucide-react";
import { type VisitCreateDto, type UserResponseDto } from "@/types/api";

interface CreateVisitDialogProps {
    patientId?: string;
    patientName?: string;
    patient?: UserResponseDto | null;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export function CreateVisitDialog({
    patientId: propPatientId,
    patientName: propPatientName,
    patient,
    open: propOpen,
    onOpenChange: propOnOpenChange
}: CreateVisitDialogProps) {
    const [internalOpen, setInternalOpen] = useState(false);
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");

    const isControlled = propOpen !== undefined;
    const open = isControlled ? propOpen : internalOpen;
    const setOpen = isControlled ? (propOnOpenChange || (() => { })) : setInternalOpen;

    const effectivePatientId = patient?.id || propPatientId;
    const effectivePatientName = patient ? `${patient.firstName} ${patient.lastName}` : propPatientName;

    const { data: currentUser } = useUserCheck();
    const queryClient = useQueryClient();
    const createVisitMutation = useMutation({
        mutationFn: async (data: VisitCreateDto) => {
            return apiRequest("/visits", {
                method: "post",
                data,
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["visits"] });
            if (effectivePatientId) {
                queryClient.invalidateQueries({ queryKey: ["patient-visits", effectivePatientId] });
            }
            setOpen(false);
            setDate("");
            setTime("");
            toast.success("Wizyta została utworzona pomyślnie!");
        },
        onError: () => {
            toast.error("Wystąpił błąd podczas tworzenia wizyty.");
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!currentUser?.id || !date || !time || !effectivePatientId) {
            console.error("Missing required fields:", {
                currentUserId: currentUser?.id,
                date,
                time,
                effectivePatientId
            });
            return;
        }

        const startDateTime = new Date(`${date}T${time}:00`);
        const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000);

        createVisitMutation.mutate({
            patientId: effectivePatientId,
            doctorId: currentUser.id,
            dateTimeStart: startDateTime.toISOString(),
            dateTimeEnd: endDateTime.toISOString(),
        });
    };

    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const minDate = `${year}-${month}-${day}`;

    const currentHours = String(now.getHours()).padStart(2, '0');
    const currentMinutes = String(now.getMinutes()).padStart(2, '0');
    const minTime = date === minDate ? `${currentHours}:${currentMinutes}` : undefined;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            {!isControlled && (
                <DialogTrigger asChild>
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> Utwórz wizytę
                    </Button>
                </DialogTrigger>
            )}
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Utwórz nową wizytę</DialogTitle>
                    <DialogDescription>
                        Umów wizytę dla pacjenta. Czas trwania wizyty to domyślnie 1 godzina.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="patient" className="text-right">
                            Pacjent
                        </Label>
                        <div className="col-span-3 relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                            <Input
                                id="patient"
                                value={effectivePatientName || ""}
                                disabled
                                className="pl-10"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="doctor" className="text-right">
                            Lekarz
                        </Label>
                        <div className="col-span-3 relative">
                            <Stethoscope className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                            <Input
                                id="doctor"
                                value={currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : "Ładowanie..."}
                                disabled
                                className="pl-10"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="date" className="text-right">
                            Data
                        </Label>
                        <div className="col-span-3 relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                            <Input
                                id="date"
                                type="date"
                                value={date}
                                min={minDate}
                                onChange={(e) => setDate(e.target.value)}
                                onClick={(e) => e.currentTarget.showPicker()}
                                className="pl-10"
                                required
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="time" className="text-right">
                            Godzina
                        </Label>
                        <div className="col-span-3 relative">
                            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                            <Input
                                id="time"
                                type="time"
                                value={time}
                                min={minTime}
                                onChange={(e) => setTime(e.target.value)}
                                onClick={(e) => e.currentTarget.showPicker()}
                                className="pl-10"
                                required
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={createVisitMutation.isPending || !effectivePatientId || !currentUser}>
                            {createVisitMutation.isPending ? "Tworzenie..." : "Utwórz wizytę"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
