import { useParams } from "@tanstack/react-router";
import { useVisitExecution } from "./api/useVisitExecution";
import { Odontogram } from "./components/Odontogram";
import { VisitAccordions } from "./components/VisitAccordions";
import { DiagnoseForm } from "./components/DiagnoseForm";
import { ToothHistory } from "./components/ToothHistory";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { useState } from "react";
import { History } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

export function VisitExecutionPage() {
    const { visitId } = useParams({ from: "/visits/$visitId/execution" });
    const {
        visit,
        isLoading,
        diagnosesDictionary,
        proceduresDictionary,
        teethDiagnoses,
        handleAddDiagnose,
        handleAddProcedure,
        handleRemoveProcedure,
        handleUpdateProcedurePrice,
        handleUploadDocument,
        handleDeleteDocument,
        handleUpdateNote,
        handleFinishVisit,
        isFinishing
    } = useVisitExecution(visitId);

    const [selectedToothParts, setSelectedToothParts] = useState<string[]>([]);
    const [historyMode, setHistoryMode] = useState(false);
    const [selectedTooth, setSelectedTooth] = useState<{ tooth: string; location: string } | null>(null);

    if (isLoading || !visit) {
        return <Spinner size="lg" className="min-h-screen" />;
    }

    const handleToothClick = (toothId: string, part: string) => {
        const key = `${toothId}-${part}`;

        if (historyMode) {
            setSelectedTooth({ tooth: toothId, location: part });
            return;
        }

        setSelectedToothParts(prev => {
            if (prev.includes(key)) {
                return prev.filter(p => p !== key);
            } else {
                return [...prev, key];
            }
        });
    };

    const odontogramDiagnoses: Record<string, string> = {};

    teethDiagnoses.forEach(d => {
        if (d.found && d.diagnoseDictionary?.name) {
            const color = stringToColor(d.diagnoseDictionary.name);
            const location = d.location.toLowerCase();
            const tooth = d.tooth.toString();
            odontogramDiagnoses[`${tooth}-${location}`] = color;
        }
    });

    visit.diagnoses.forEach(d => {
        const color = stringToColor(d.diagnoseDictionary.name);
        odontogramDiagnoses[`${d.tooth}-${d.location}`] = color;
    });

    selectedToothParts.forEach(part => {
        odontogramDiagnoses[part] = '#ff0000';
    });

    const onAddDiagnoseWrapper = (diagnoseId: string, note: string) => {
        handleAddDiagnose(selectedToothParts, diagnoseId, note);
        setSelectedToothParts([]);
    };

    return (
        <div className="space-y-6 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-primary/20 pb-4">
                <div>
                    <h1 className="text-2xl font-bold text-primary">
                        Przeprowadzanie wizyty | {format(new Date(visit.dateTimeStart), "d MMMM yyyy, HH:mm", { locale: pl })}
                    </h1>
                    <p className="text-muted-foreground">
                        {visit.patient.firstName} {visit.patient.lastName} | PESEL: {visit.patient.pesel || "Brak"}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="text-lg font-bold text-primary">
                        Koszt: {visit.totalCost} PLN
                    </div>
                    <Button onClick={handleFinishVisit} disabled={isFinishing}>
                        {isFinishing ? "Zapisywanie..." : "Zakończ wizytę"}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 flex flex-col items-center justify-center bg-card p-4 rounded-lg border border-primary/10 min-h-[400px]">
                    <Odontogram
                        diagnoses={odontogramDiagnoses}
                        onToothClick={handleToothClick}
                    />
                    <div className="mt-4 w-full flex justify-center">
                        <Button
                            variant={historyMode ? "default" : "outline"}
                            size="sm"
                            onClick={() => setHistoryMode(!historyMode)}
                            className="gap-2"
                        >
                            <History className="h-4 w-4" />
                            {historyMode ? "Tryb historii aktywny" : "Historia zęba"}
                        </Button>
                    </div>
                </div>
                <div className="lg:col-span-1">
                    {historyMode && selectedTooth ? (
                        <ToothHistory
                            patientId={visit.patient.id}
                            tooth={selectedTooth.tooth}
                            location={selectedTooth.location}
                        />
                    ) : (
                        <DiagnoseForm
                            diagnosesDictionary={diagnosesDictionary}
                            proceduresDictionary={proceduresDictionary}
                            selectedToothParts={selectedToothParts}
                            onAddDiagnose={onAddDiagnoseWrapper}
                            onAddProcedure={(parts, id, price, healed) => {
                                handleAddProcedure(parts, id, price, healed);
                                setSelectedToothParts([]);
                            }}
                        />
                    )}
                </div>
            </div>

            <div className="w-full">
                <VisitAccordions
                    documents={visit.documents}
                    visitProcedures={visit.procedures}
                    visitDiagnoses={visit.diagnoses}
                    onRemoveProcedure={handleRemoveProcedure}
                    onUpdateProcedurePrice={handleUpdateProcedurePrice}
                    onUploadDocument={handleUploadDocument}
                    onDeleteDocument={handleDeleteDocument}
                    onUpdateNote={handleUpdateNote}
                    note={visit.comment || ""}
                />
            </div>
        </div>
    );
}

// Helper for colors
function stringToColor(str: string) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const c = (hash & 0x00ffffff).toString(16).toUpperCase();
    return '#' + '00000'.substring(0, 6 - c.length) + c;
}
