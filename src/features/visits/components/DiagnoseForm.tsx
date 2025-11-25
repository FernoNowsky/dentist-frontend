import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { DiagnoseDictionaryResponseDto, ProcedureDictionaryResponseDto } from '@/types/api';

interface DiagnoseFormProps {
    diagnosesDictionary: DiagnoseDictionaryResponseDto[];
    proceduresDictionary: ProcedureDictionaryResponseDto[];
    selectedToothParts: string[];
    onAddDiagnose: (diagnoseId: string, note: string) => void;
    onAddProcedure: (selectedToothParts: string[], procedureId: string, price: number, markAsHealed: boolean) => void;
}

export function DiagnoseForm({
    diagnosesDictionary,
    proceduresDictionary,
    selectedToothParts,
    onAddDiagnose,
    onAddProcedure,
}: DiagnoseFormProps) {
    // Diagnosis tab state
    const [selectedDiagnoseId, setSelectedDiagnoseId] = useState('');
    const [diagnoseNote, setDiagnoseNote] = useState('');

    // Procedure tab state
    const [selectedProcedureId, setSelectedProcedureId] = useState('');
    const [procedurePrice, setProcedurePrice] = useState('');
    const [markAsHealed, setMarkAsHealed] = useState(false);

    const handleAddDiagnose = () => {
        if (selectedDiagnoseId && selectedToothParts.length > 0) {
            onAddDiagnose(selectedDiagnoseId, diagnoseNote);
            setDiagnoseNote('');
        }
    };

    const handleAddProcedure = () => {
        if (selectedProcedureId && procedurePrice && selectedToothParts.length > 0) {
            onAddProcedure(selectedToothParts, selectedProcedureId, parseFloat(procedurePrice), markAsHealed);
            setSelectedProcedureId('');
            setProcedurePrice('');
            setMarkAsHealed(false);
        }
    };

    const handleProcedureSelect = (id: string) => {
        setSelectedProcedureId(id);
        const proc = proceduresDictionary.find(p => p.id.toString() === id);
        if (proc) {
            setProcedurePrice(proc.price.toString());
        }
    };

    return (
        <div className="bg-card p-4 rounded-lg border border-primary/10">
            <Tabs defaultValue="diagnosis" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="diagnosis">Rozpoznanie</TabsTrigger>
                    <TabsTrigger value="procedure">Procedura</TabsTrigger>
                </TabsList>

                <TabsContent value="diagnosis" className="space-y-4 mt-4">
                    <div>
                        <h3 className="font-semibold mb-2">Wybrane części zęba:</h3>
                        {selectedToothParts.length === 0 ? (
                            <p className="text-sm text-muted-foreground">Kliknij na zęby w odontogramie</p>
                        ) : (
                            <div className="flex flex-wrap gap-1">
                                {selectedToothParts.map(part => (
                                    <span key={part} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                                        {part}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium">Rozpoznanie</label>
                        <Select value={selectedDiagnoseId} onValueChange={setSelectedDiagnoseId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Wybierz rozpoznanie" />
                            </SelectTrigger>
                            <SelectContent>
                                {diagnosesDictionary.map(d => (
                                    <SelectItem key={d.id} value={d.id.toString()}>{d.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium">Notatka (opcjonalna)</label>
                        <Textarea
                            value={diagnoseNote}
                            onChange={(e) => setDiagnoseNote(e.target.value)}
                            placeholder="Dodaj notatkę..."
                            rows={3}
                        />
                    </div>

                    <Button
                        onClick={handleAddDiagnose}
                        disabled={!selectedDiagnoseId || selectedToothParts.length === 0}
                        className="w-full"
                    >
                        Dodaj rozpoznanie
                    </Button>
                </TabsContent>

                <TabsContent value="procedure" className="space-y-4 mt-4">
                    <div>
                        <h3 className="font-semibold mb-2">Wybrane części zęba:</h3>
                        {selectedToothParts.length === 0 ? (
                            <p className="text-sm text-muted-foreground">Kliknij na zęby w odontogramie</p>
                        ) : (
                            <div className="flex flex-wrap gap-1">
                                {selectedToothParts.map(part => (
                                    <span key={part} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                                        {part}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium">Procedura</label>
                        <Select value={selectedProcedureId} onValueChange={handleProcedureSelect}>
                            <SelectTrigger>
                                <SelectValue placeholder="Wybierz procedurę" />
                            </SelectTrigger>
                            <SelectContent>
                                {proceduresDictionary.map(p => (
                                    <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium">Cena (PLN)</label>
                        <Input
                            type="number"
                            value={procedurePrice}
                            onChange={(e) => setProcedurePrice(e.target.value)}
                            placeholder="0.00"
                        />
                    </div>

                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="markHealed"
                            checked={markAsHealed}
                            onCheckedChange={(checked: boolean) => setMarkAsHealed(checked)}
                        />
                        <label
                            htmlFor="markHealed"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                            Oznacz ząb jako "Wyleczony"
                        </label>
                    </div>

                    <Button
                        onClick={handleAddProcedure}
                        disabled={!selectedProcedureId || !procedurePrice || selectedToothParts.length === 0}
                        className="w-full"
                    >
                        Dodaj procedurę
                    </Button>
                </TabsContent>
            </Tabs>
        </div>
    );
}
