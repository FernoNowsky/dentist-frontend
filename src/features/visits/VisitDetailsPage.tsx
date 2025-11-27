import { useParams } from "@tanstack/react-router";
import { VisitAccordions } from "@/features/visits/components/VisitAccordions";
import { Odontogram } from "@/features/visits/components/Odontogram";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import type { VisitResponseDto, TeethDiagnosesResponseDto, ToothDiagnoseResponseDto } from "@/types/api";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { Loader2 } from "lucide-react";

function stringToColor(str: string) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const c = (hash & 0x00ffffff).toString(16).toUpperCase();
    return '#' + '00000'.substring(0, 6 - c.length) + c;
}

const ALL_TEETH = [
    "18", "17", "16", "15", "14", "13", "12", "11",
    "21", "22", "23", "24", "25", "26", "27", "28",
    "48", "47", "46", "45", "44", "43", "42", "41",
    "31", "32", "33", "34", "35", "36", "37", "38"
];

const LOCATIONS = ['top', 'bottom', 'left', 'right', 'center'];

export function VisitDetailsPage() {
    const { visitId } = useParams({ from: "/visits/$visitId/details" });

    const { data: visit, isLoading: isVisitLoading } = useQuery({
        queryKey: ["visit", visitId],
        queryFn: async () => {
            return apiRequest<VisitResponseDto>(`/visits/${visitId}`);
        },
    });

    const { data: diagnosesResponse, isLoading: isDiagnosesLoading } = useQuery({
        queryKey: ["visit-tooth-diagnoses", visitId, visit?.patient?.id],
        queryFn: async () => {
            if (!visit?.patient?.id) return null;

            const toothParams = ALL_TEETH.map(t => `toothMap=${t}`).join('&');
            const locationParams = LOCATIONS.map(l => `locationMap=${l}`).join('&');
            const url = `/teeth-diagnoses/patients/${visit.patient.id}?${toothParams}&${locationParams}&dueToVisitId=${visitId}`;

            return apiRequest<TeethDiagnosesResponseDto>(url, {
                method: 'get'
            });
        },
        enabled: !!visit?.patient?.id,
    });

    const isLoading = isVisitLoading || isDiagnosesLoading;

    const toothDiagnoses = diagnosesResponse?.currentDiagnsoses || [];
    const historicalDiagnoses: ToothDiagnoseResponseDto[] = [];
    const odontogramDiagnoses: Record<string, string> = {};

    // (state before this visit)
    toothDiagnoses.forEach(d => {
        if (d.found && d.diagnoseDictionary?.name) {
            const color = stringToColor(d.diagnoseDictionary.name);
            const location = d.location.toLowerCase();
            const tooth = d.tooth.toString();
            odontogramDiagnoses[`${tooth}-${location}`] = color;
            historicalDiagnoses.push(d);
        }
    });

    // (changes made during this visit - override historical)
    if (visit) {
        visit.diagnoses.forEach(d => {
            const color = stringToColor(d.diagnoseDictionary.name);
            const location = d.location.toLowerCase();
            const tooth = d.tooth.toString();
            odontogramDiagnoses[`${tooth}-${location}`] = color;
        });
    }

    if (isLoading) {
        return (
            <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!visit) {
        return <div className="p-8 text-center text-muted-foreground">Nie znaleziono wizyty</div>;
    }

    return (
        <div className="space-y-6 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-primary/20 pb-4">
                <div>
                    <h1 className="text-2xl font-bold text-primary">
                        Szczegóły wizyty | {format(new Date(visit.dateTimeStart), "d MMMM yyyy, HH:mm", { locale: pl })}
                    </h1>
                    <p className="text-muted-foreground">
                        {visit.patient.firstName} {visit.patient.lastName} | Dentysta: {visit.doctor.firstName} {visit.doctor.lastName}
                    </p>
                </div>
            </div>

            <div className="space-y-6">
                <div className="flex justify-center bg-card p-4 rounded-lg border border-primary/10">
                    <Odontogram
                        diagnoses={odontogramDiagnoses}
                        onToothClick={() => { }} // Read-only, no action on click
                    />
                </div>

                <VisitAccordions
                    documents={visit.documents}
                    visitProcedures={visit.procedures}
                    visitDiagnoses={visit.diagnoses}
                    historicalDiagnoses={historicalDiagnoses}
                    onRemoveProcedure={() => { }}
                    onUpdateProcedurePrice={() => { }}
                    onUploadDocument={() => { }}
                    onUpdateNote={() => { }}
                    note={visit.comment || ""}
                    readOnly={true}
                />
            </div>
        </div>
    );
}