import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import {
    type DocumentResponseDto,
    type ToothProcedureResponseDto,
    type ToothDiagnoseResponseDto
} from '@/types/api';

interface VisitAccordionsProps {
    documents: DocumentResponseDto[];
    visitProcedures: ToothProcedureResponseDto[];
    visitDiagnoses: ToothDiagnoseResponseDto[];

    onRemoveProcedure: (index: number) => void;
    onUpdateProcedurePrice: (index: number, newPrice: number) => void;
    onUploadDocument: (file: File, title: string, description: string) => void;
    onUpdateNote: (note: string) => void;

    note: string;
}

const AccordionItem = ({ title, children, isOpen, onClick }: { title: string, children: React.ReactNode, isOpen: boolean, onClick: () => void }) => (
    <div className="border border-primary/20 rounded-md mb-2 overflow-hidden">
        <button
            className="w-full text-left p-4 font-semibold bg-background text-foreground hover:bg-muted transition-all duration-200 flex justify-between items-center border-b border-primary/10"
            onClick={onClick}
        >
            <span>{title}</span>
            <span className="transition-transform duration-200" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
        </button>
        <div
            className={cn(
                "grid transition-all duration-200 ease-in-out",
                isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
            )}
        >
            <div className="overflow-hidden">
                <div className="p-4 bg-card">{children}</div>
            </div>
        </div>
    </div>
);

export const VisitAccordions = ({
    documents,
    visitProcedures,
    visitDiagnoses,
    onRemoveProcedure,
    onUpdateProcedurePrice,
    onUploadDocument,
    onUpdateNote,
    note
}: VisitAccordionsProps) => {
    const [openSection, setOpenSection] = useState<string | null>('diagnoses');

    const [file, setFile] = useState<File | null>(null);
    const [docTitle, setDocTitle] = useState('');
    const [docDesc, setDocDesc] = useState('');

    const toggleSection = (section: string) => {
        setOpenSection(openSection === section ? null : section);
    };

    const handleUploadDocument = () => {
        if (file && docTitle) {
            onUploadDocument(file, docTitle, docDesc);
            setFile(null);
            setDocTitle('');
            setDocDesc('');
        }
    };

    return (
        <div className="w-full space-y-2">
            <AccordionItem
                title="Rozpoznania"
                isOpen={openSection === 'diagnoses'}
                onClick={() => toggleSection('diagnoses')}
            >
                <div className="space-y-4">
                    <div className="flex justify-between text-xs text-muted-foreground px-2">
                        <span>Oznaczenie zęba</span>
                        <span>Rozpoznanie</span>
                    </div>
                    {visitDiagnoses.length === 0 ? (
                        <p className="text-sm text-gray-500 text-center">Brak rozpoznań</p>
                    ) : (
                        <div className="space-y-1">
                            {visitDiagnoses.map((d, i) => (
                                <div key={i} className="flex justify-between items-center p-3 bg-muted/30 rounded-md text-sm">
                                    <div className="font-medium">
                                        {d.tooth} ({d.location})
                                    </div>
                                    <div className="text-right">
                                        <div>{d.diagnoseDictionary.name}</div>
                                        {d.comment && <div className="text-xs text-muted-foreground">{d.comment}</div>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </AccordionItem>

            <AccordionItem
                title="Procedury"
                isOpen={openSection === 'procedures'}
                onClick={() => toggleSection('procedures')}
            >
                <div className="space-y-4">
                    <div className="flex justify-between items-center mb-2">
                        <h4 className="font-bold">Lista procedur</h4>
                        {visitProcedures.length > 0 && (
                            <span className="text-sm font-medium">
                                ({visitProcedures.length}) {visitProcedures.reduce((acc, curr) => acc + curr.cost, 0).toFixed(2)} PLN
                            </span>
                        )}
                    </div>

                    {visitProcedures.length === 0 ? (
                        <p className="text-sm text-gray-500 text-center">Brak procedur</p>
                    ) : (
                        <ul className="space-y-2">
                            {visitProcedures.map((p, i) => (
                                <li key={i} className="text-sm p-3 rounded bg-primary text-primary-foreground flex justify-between items-center gap-3">
                                    <div className="flex-1">
                                        <div className="font-medium">{p.procedureDictionary.name}</div>
                                        {p.tooth && (
                                            <div className="text-xs opacity-80">
                                                Ząb: {p.tooth} ({p.location})
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Input
                                            type="number"
                                            value={p.cost}
                                            onChange={(e) => onUpdateProcedurePrice(i, parseFloat(e.target.value) || 0)}
                                            className="w-24 h-8 bg-primary-foreground text-primary text-right"
                                        />
                                        <span className="text-xs">PLN</span>
                                        <button
                                            onClick={() => onRemoveProcedure(i)}
                                            className="text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M3 6h18"></path>
                                                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                                                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                                            </svg>
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </AccordionItem>

            <AccordionItem
                title="Dokumenty"
                isOpen={openSection === 'documents'}
                onClick={() => toggleSection('documents')}
            >
                <div className="space-y-4">
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium">Plik</label>
                        <Input
                            type="file"
                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium">Tytuł</label>
                        <Input
                            value={docTitle}
                            onChange={(e) => setDocTitle(e.target.value)}
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium">Opis</label>
                        <Input
                            value={docDesc}
                            onChange={(e) => setDocDesc(e.target.value)}
                        />
                    </div>

                    <Button
                        onClick={handleUploadDocument}
                        disabled={!file || !docTitle}
                        className="w-full"
                    >
                        Wgraj dokument
                    </Button>

                    <div className="mt-4">
                        <h4 className="font-bold mb-2">Lista dokumentów</h4>
                        {documents.length === 0 ? (
                            <p className="text-sm text-gray-500 text-center">Brak dokumentów</p>
                        ) : (
                            <ul className="space-y-2">
                                {documents.map((doc, i) => (
                                    <li key={i} className="text-sm border p-2 rounded bg-gray-50">
                                        <div className="font-bold">{doc.title}</div>
                                        {doc.description && <div className="text-xs text-gray-500">{doc.description}</div>}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </AccordionItem>

            <AccordionItem
                title="Notatki"
                isOpen={openSection === 'notes'}
                onClick={() => toggleSection('notes')}
            >
                <Textarea
                    value={note}
                    onChange={(e) => onUpdateNote(e.target.value)}
                    placeholder="Dodaj notatkę do wizyty..."
                    rows={5}
                />
            </AccordionItem>
        </div>
    );
};
