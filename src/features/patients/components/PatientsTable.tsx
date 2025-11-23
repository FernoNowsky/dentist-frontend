import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import type { UserResponseDto } from "@/types/api";
import { FileText, Plus } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { CreateVisitDialog } from "@/features/visits/components/CreateVisitDialog";

interface PatientsTableProps {
    data: UserResponseDto[];
    isLoading: boolean;
}

export function PatientsTable({ data, isLoading }: PatientsTableProps) {
    const navigate = useNavigate();
    const [selectedPatient, setSelectedPatient] = useState<UserResponseDto | null>(null);
    const [isCreateVisitOpen, setIsCreateVisitOpen] = useState(false);

    const handleCreateVisit = (patient: UserResponseDto) => {
        setSelectedPatient(patient);
        setIsCreateVisitOpen(true);
    };

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Imię</TableHead>
                        <TableHead>Nazwisko</TableHead>
                        <TableHead>PESEL</TableHead>
                        <TableHead>Telefon</TableHead>
                        <TableHead className="text-right">Akcje</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center h-24">
                                Brak pacjentów.
                            </TableCell>
                        </TableRow>
                    ) : (
                        data.map((patient) => (
                            <TableRow key={patient.id}>
                                <TableCell>{patient.firstName}</TableCell>
                                <TableCell>{patient.lastName}</TableCell>
                                <TableCell>{patient.pesel || "-"}</TableCell>
                                <TableCell>{patient.phoneNumber || "-"}</TableCell>
                                <TableCell className="text-right space-x-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => navigate({ to: `/patients/${patient.id}` })}
                                    >
                                        <FileText className="mr-2 h-4 w-4" />
                                        Karta Pacjenta
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleCreateVisit(patient)}
                                    >
                                        <Plus className="mr-2 h-4 w-4" />
                                        Utwórz wizytę
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>

            <CreateVisitDialog
                open={isCreateVisitOpen}
                onOpenChange={setIsCreateVisitOpen}
                patient={selectedPatient}
            />
        </div>
    );
}
