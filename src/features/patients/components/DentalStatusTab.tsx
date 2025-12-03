import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import { Odontogram } from "@/features/visits/components/Odontogram";
import { ToothHistory } from "@/features/visits/components/ToothHistory";
import { Spinner } from "@/components/ui/spinner";
import type { TeethDiagnosesResponseDto } from "@/types/api";

interface DentalStatusTabProps {
    patientId: string;
}

const ALL_TEETH = [
    "18", "17", "16", "15", "14", "13", "12", "11",
    "21", "22", "23", "24", "25", "26", "27", "28",
    "48", "47", "46", "45", "44", "43", "42", "41",
    "31", "32", "33", "34", "35", "36", "37", "38"
];

const LOCATIONS = ['top', 'bottom', 'left', 'right', 'center'];

function stringToColor(str: string) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const c = (hash & 0x00ffffff).toString(16).toUpperCase();
    return '#' + '00000'.substring(0, 6 - c.length) + c;
}

export function DentalStatusTab({ patientId }: DentalStatusTabProps) {
    const [selectedTooth, setSelectedTooth] = useState<{ tooth: string; location: string } | null>(null);

    const { data: diagnosesResponse, isLoading } = useQuery({
        queryKey: ["teeth-diagnoses", patientId],
        queryFn: async () => {
            const toothParams = ALL_TEETH.map(t => `toothMap=${t}`).join('&');
            const locationParams = LOCATIONS.map(l => `locationMap=${l}`).join('&');
            // No dueToVisitId means we get the current status
            const url = `/teeth-diagnoses/patients/${patientId}?${toothParams}&${locationParams}`;

            return apiRequest<TeethDiagnosesResponseDto>(url, {
                method: 'get'
            });
        },
        enabled: !!patientId,
    });

    const odontogramDiagnoses: Record<string, string> = {};

    if (diagnosesResponse?.currentDiagnsoses) {
        diagnosesResponse.currentDiagnsoses.forEach(d => {
            if (d.found && d.diagnoseDictionary?.name) {
                const color = stringToColor(d.diagnoseDictionary.name);
                const location = d.location.toLowerCase();
                const tooth = d.tooth.toString();
                odontogramDiagnoses[`${tooth}-${location}`] = color;
            }
        });
    }

    if (isLoading) {
        return (
            <div className="flex justify-center py-12">
                <Spinner size="lg" />
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 flex flex-col items-center justify-center bg-card p-4 rounded-lg border border-primary/10 min-h-[400px]">
                <Odontogram
                    diagnoses={odontogramDiagnoses}
                    onToothClick={(tooth, part) => setSelectedTooth({ tooth, location: part })}
                />
                <div className="mt-4 text-sm text-muted-foreground">
                    Kliknij na część zęba, aby zobaczyć jego historię.
                </div>
            </div>
            <div className="lg:col-span-1">
                {selectedTooth ? (
                    <ToothHistory
                        patientId={patientId}
                        tooth={selectedTooth.tooth}
                        location={selectedTooth.location}
                    />
                ) : (
                    <div className="h-full flex items-center justify-center p-8 border rounded-lg bg-muted/20 text-muted-foreground text-center">
                        Wybierz ząb na schemacie, aby zobaczyć historię leczenia.
                    </div>
                )}
            </div>
        </div>
    );
}
