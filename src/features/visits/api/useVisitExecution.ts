import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/api';
import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { useRouter } from '@tanstack/react-router';
import type {
    VisitResponseDto,
    DiagnoseDictionaryResponseDto,
    ProcedureDictionaryResponseDto,
    DocumentResponseDto,
    VisitUpdateDto,
    ToothDiagnoseCreateDto,
    ToothProcedureCreateDto
} from '@/types/api';

export const useVisitExecution = (visitId: string) => {
    const queryClient = useQueryClient();
    const router = useRouter();

    const visitQuery = useQuery({
        queryKey: ['visit', visitId],
        queryFn: () => apiRequest<VisitResponseDto>(`/visits/${visitId}`),
        enabled: !!visitId,
    });

    const diagnosesQuery = useQuery({
        queryKey: ['diagnoses-dictionary'],
        queryFn: () => apiRequest<DiagnoseDictionaryResponseDto[]>('/diagnose-dictionary/all'),
    });

    const proceduresQuery = useQuery({
        queryKey: ['procedures-dictionary'],
        queryFn: () => apiRequest<ProcedureDictionaryResponseDto[]>('/procedure-dictionary/all'),
    });

    const updateVisitMutation = useMutation({
        mutationFn: (data: VisitUpdateDto) =>
            apiRequest<VisitResponseDto>(`/visits/${visitId}`, {
                method: 'put',
                data,
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['visit', visitId] });
            toast.success('Wizyta zakończona pomyślnie');
            router.navigate({ to: '/dashboard' });
        },
        onError: () => {
            toast.error('Błąd podczas zapisywania wizyty');
        }
    });

    const uploadDocumentMutation = useMutation({
        mutationFn: async ({ file, data }: { file: File; data: { title: string; description: string; visitId: string } }) => {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('data', JSON.stringify(data));

            return apiRequest<DocumentResponseDto>('/documents', {
                method: 'post',
                data: formData,
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['visit', visitId] });
            toast.success('Dokument wgrany');
        },
        onError: () => {
            toast.error('Błąd podczas wgrywania dokumentu');
        }
    });

    const [localDiagnoses, setLocalDiagnoses] = useState<ToothDiagnoseCreateDto[]>([]);
    const [localProcedures, setLocalProcedures] = useState<ToothProcedureCreateDto[]>([]);
    const [note, setNote] = useState('');
    const [isInitialized, setIsInitialized] = useState(false);

    const originalData = useRef<{
        diagnoses: ToothDiagnoseCreateDto[];
        procedures: ToothProcedureCreateDto[];
        note: string;
    } | null>(null);

    useEffect(() => {
        if (visitQuery.data && !isInitialized) {
            const initialDiagnoses = visitQuery.data.diagnoses.map(d => ({
                tooth: d.tooth,
                location: d.location,
                comment: d.comment,
                diagnoseDictionaryId: d.diagnoseDictionary.id
            }));
            const initialProcedures: ToothProcedureCreateDto[] = [];
            const initialNote = visitQuery.data.comment || '';

            setLocalDiagnoses(initialDiagnoses);
            setLocalProcedures(initialProcedures);
            setNote(initialNote);

            originalData.current = {
                diagnoses: JSON.parse(JSON.stringify(initialDiagnoses)),
                procedures: JSON.parse(JSON.stringify(initialProcedures)),
                note: initialNote
            };

            setIsInitialized(true);
        }
    }, [visitQuery.data, isInitialized]);

    const handleAddDiagnose = (selectedToothParts: string[], diagnoseId: string, diagnoseNote: string) => {
        const newDiagnoses = [...localDiagnoses];
        selectedToothParts.forEach(partKey => {
            const [tooth, location] = partKey.split('-');
            const existingIndex = newDiagnoses.findIndex(d => d.tooth === tooth && d.location === location);
            const newDiagnose: ToothDiagnoseCreateDto = {
                tooth,
                location,
                comment: diagnoseNote,
                diagnoseDictionaryId: Number(diagnoseId)
            };
            if (existingIndex >= 0) {
                newDiagnoses[existingIndex] = newDiagnose;
            } else {
                newDiagnoses.push(newDiagnose);
            }
        });
        setLocalDiagnoses(newDiagnoses);
        toast.success('Dodano rozpoznanie');
    };

    const handleAddProcedure = (selectedToothParts: string[], procedureId: string, totalPrice: number, markAsHealed: boolean) => {
        const newProcedures = [...localProcedures];
        const newDiagnoses = [...localDiagnoses];

        const pricePerTooth = totalPrice / selectedToothParts.length;

        selectedToothParts.forEach(partKey => {
            const [tooth, location] = partKey.split('-');

            newProcedures.push({
                tooth,
                location,
                comment: '',
                cost: pricePerTooth,
                procedureDictionaryId: Number(procedureId)
            });

            if (markAsHealed && diagnosesQuery.data) {
                const wyleczonyDiagnosis = diagnosesQuery.data.find(d => d.name === 'Wyleczony');
                if (wyleczonyDiagnosis) {
                    const existingIndex = newDiagnoses.findIndex(d => d.tooth === tooth && d.location === location);
                    const healedDiagnose: ToothDiagnoseCreateDto = {
                        tooth,
                        location,
                        comment: '',
                        diagnoseDictionaryId: wyleczonyDiagnosis.id
                    };
                    if (existingIndex >= 0) {
                        newDiagnoses[existingIndex] = healedDiagnose;
                    } else {
                        newDiagnoses.push(healedDiagnose);
                    }
                }
            }
        });

        setLocalProcedures(newProcedures);
        if (markAsHealed) {
            setLocalDiagnoses(newDiagnoses);
        }
        toast.success('Dodano procedurę');
    };

    const handleRemoveProcedure = (index: number) => {
        setLocalProcedures(prev => prev.filter((_, i) => i !== index));
        toast.success('Usunięto procedurę');
    };

    const handleUpdateProcedurePrice = (index: number, newPrice: number) => {
        setLocalProcedures(prev => prev.map((p, i) =>
            i === index ? { ...p, cost: newPrice } : p
        ));
    };

    const handleUpdateNote = (newNote: string) => {
        setNote(newNote);
    };

    const detectChanges = () => {
        if (!originalData.current) return null;

        const changes = {
            addedDiagnoses: [] as ToothDiagnoseCreateDto[],
            removedDiagnoses: [] as ToothDiagnoseCreateDto[],
            modifiedDiagnoses: [] as { old: ToothDiagnoseCreateDto; new: ToothDiagnoseCreateDto }[],
            addedProcedures: [] as ToothProcedureCreateDto[],
            removedProcedures: [] as ToothProcedureCreateDto[],
            modifiedProcedures: [] as { old: ToothProcedureCreateDto; new: ToothProcedureCreateDto }[],
            noteChanged: originalData.current.note !== note,
            oldNote: originalData.current.note,
            newNote: note
        };

        localDiagnoses.forEach(current => {
            const original = originalData.current!.diagnoses.find(
                d => d.tooth === current.tooth && d.location === current.location
            );
            if (!original) {
                changes.addedDiagnoses.push(current);
            } else if (JSON.stringify(original) !== JSON.stringify(current)) {
                changes.modifiedDiagnoses.push({ old: original, new: current });
            }
        });

        originalData.current.diagnoses.forEach(original => {
            const current = localDiagnoses.find(
                d => d.tooth === original.tooth && d.location === original.location
            );
            if (!current) {
                changes.removedDiagnoses.push(original);
            }
        });

        localProcedures.forEach((current, idx) => {
            const original = originalData.current!.procedures[idx];
            if (!original) {
                changes.addedProcedures.push(current);
            } else if (JSON.stringify(original) !== JSON.stringify(current)) {
                changes.modifiedProcedures.push({ old: original, new: current });
            }
        });

        if (localProcedures.length < originalData.current.procedures.length) {
            changes.removedProcedures = originalData.current.procedures.slice(localProcedures.length);
        }

        return changes;
    };

    const handleFinishVisit = async () => {
        const changes = detectChanges();

        if (changes) {
            console.log('=== CHANGES DETECTED ===');
            console.log('Added Diagnoses:', changes.addedDiagnoses);
            console.log('Removed Diagnoses:', changes.removedDiagnoses);
            console.log('Modified Diagnoses:', changes.modifiedDiagnoses);
            console.log('Added Procedures:', changes.addedProcedures);
            console.log('Removed Procedures:', changes.removedProcedures);
            console.log('Modified Procedures:', changes.modifiedProcedures);
            console.log('Note Changed:', changes.noteChanged);
            if (changes.noteChanged) {
                console.log('Old Note:', changes.oldNote);
                console.log('New Note:', changes.newNote);
            }
            console.log('========================');
        }

        await updateVisitMutation.mutateAsync({
            status: 'COMPLETED',
            toothDiagnoses: localDiagnoses,
            toothProcedures: localProcedures,
        });
    };

    const currentVisit = visitQuery.data ? {
        ...visitQuery.data,
        comment: note,
        diagnoses: localDiagnoses.map(d => {
            const dict = diagnosesQuery.data?.find(x => x.id === d.diagnoseDictionaryId);
            return {
                tooth: d.tooth,
                location: d.location,
                comment: d.comment,
                createdAt: '',
                diagnoseDictionary: dict || { id: d.diagnoseDictionaryId, name: 'Unknown' }
            };
        }),
        procedures: localProcedures.map(p => {
            const dict = proceduresQuery.data?.find(x => x.id === p.procedureDictionaryId);
            return {
                id: '',
                tooth: p.tooth,
                location: p.location,
                comment: p.comment,
                cost: p.cost,
                createdAt: '',
                procedureDictionary: dict || { id: p.procedureDictionaryId, name: 'Unknown', price: 0, isActive: true }
            };
        }),
        totalCost: localProcedures.reduce((sum, p) => sum + p.cost, 0)
    } : undefined;

    const handleUploadDocumentWrapper = async (file: File, title: string, description: string) => {
        await uploadDocumentMutation.mutateAsync({
            file,
            data: { title, description, visitId }
        });
    };

    return {
        visit: currentVisit,
        isLoading: visitQuery.isLoading || diagnosesQuery.isLoading || proceduresQuery.isLoading,
        diagnosesDictionary: diagnosesQuery.data || [],
        proceduresDictionary: proceduresQuery.data || [],
        handleAddDiagnose,
        handleAddProcedure,
        handleRemoveProcedure,
        handleUpdateProcedurePrice,
        handleUploadDocument: handleUploadDocumentWrapper,
        handleUpdateNote,
        handleFinishVisit,
        isFinishing: updateVisitMutation.isPending
    };
};
