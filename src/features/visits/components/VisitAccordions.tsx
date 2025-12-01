import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { History, FileEdit, Trash2 } from 'lucide-react';
import { DocumentPreview } from './DocumentPreview';
import {
    type DocumentResponseDto,
    type ToothProcedureResponseDto,
    type ToothDiagnoseResponseDto
} from '@/types/api';

interface VisitAccordionsProps {
    documents: DocumentResponseDto[];
    visitProcedures: ToothProcedureResponseDto[];
    visitDiagnoses: ToothDiagnoseResponseDto[];
    historicalDiagnoses?: ToothDiagnoseResponseDto[];

    onRemoveProcedure: (index: number) => void;
    onUpdateProcedurePrice: (index: number, newPrice: number) => void;
    onUploadDocument: (file: File, title: string, description: string) => void;
    onDeleteDocument?: (id: string) => void;
    onUpdateNote: (note: string) => void;

    note: string;
}

const AccordionItem = ({ title, summary, children, isOpen, onClick }: { title: string, summary?: React.ReactNode, children: React.ReactNode, isOpen: boolean, onClick: () => void }) => (
    <div className="border border-primary/20 rounded-md mb-2 overflow-hidden">
        <button
            className="w-full text-left p-4 font-semibold bg-background text-foreground hover:bg-muted transition-all duration-200 flex justify-between items-center border-b border-primary/10"
            onClick={onClick}
        >
            <div className="flex items-center gap-2">
                <span>{title}</span>
                {summary && <span className="text-sm font-normal text-muted-foreground">{summary}</span>}
            </div>
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
    historicalDiagnoses = [],
    onRemoveProcedure,
    onUpdateProcedurePrice,
    onUploadDocument,
    onDeleteDocument,
    onUpdateNote,
    note,
    readOnly = false
}: VisitAccordionsProps & { readOnly?: boolean }) => {
    const [openSection, setOpenSection] = useState<string | null>('diagnoses');

    const [file, setFile] = useState<File | null>(null);
    const [docTitle, setDocTitle] = useState('');
    const [docDesc, setDocDesc] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const toggleSection = (section: string) => {
        setOpenSection(openSection === section ? null : section);
    };

    const handleUploadDocument = () => {
        if (file && docTitle && docDesc) {
            onUploadDocument(file, docTitle, docDesc);
            setFile(null);
            setDocTitle('');
            setDocDesc('');
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const diagnosesCount = visitDiagnoses.length;
    const proceduresCount = visitProcedures.length;
    const proceduresCost = visitProcedures.reduce((acc, curr) => acc + curr.cost, 0);
    const documentsCount = documents.length;

    return (
        <div className="w-full space-y-2">
            <AccordionItem
                title="Rozpoznania"
                summary={diagnosesCount > 0 ? `(${diagnosesCount})` : null}
                isOpen={openSection === 'diagnoses'}
                onClick={() => toggleSection('diagnoses')}
            >
                {visitDiagnoses.length === 0 && historicalDiagnoses.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center">Brak rozpoznań</p>
                ) : (
                    <div className={cn(
                        "grid gap-4",
                        historicalDiagnoses.length > 0 ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"
                    )}>
                        {/* Historical Diagnoses - Left Side (only if present) */}
                        {historicalDiagnoses.length > 0 && (
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground px-2 pb-2 border-b">
                                    <History className="h-4 w-4" />
                                    <span>Stan przed wizytą</span>
                                </div>
                                <div className="space-y-1">
                                    {historicalDiagnoses.map((d, i) => (
                                        <div key={`hist-${i}`} className="flex justify-between items-center p-3 bg-slate-50 rounded-md text-sm border border-slate-200">
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
                            </div>
                        )}

                        {/* Visit Diagnoses - Right Side (or full width if no historical) */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm font-semibold text-primary px-2 pb-2 border-b border-primary/30">
                                <FileEdit className="h-4 w-4" />
                                <span>{historicalDiagnoses.length > 0 ? "Zmiany podczas wizyty" : "Rozpoznania"}</span>
                            </div>
                            {visitDiagnoses.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-4">Brak zmian</p>
                            ) : (
                                <div className="space-y-1">
                                    {visitDiagnoses.map((d, i) => (
                                        <div key={i} className="flex justify-between items-center p-3 bg-primary/10 rounded-md text-sm border border-primary/30">
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
                    </div>
                )}
            </AccordionItem>

            <AccordionItem
                title="Procedury"
                summary={proceduresCount > 0 ? `${proceduresCount} (${proceduresCost.toFixed(2)} PLN)` : null}
                isOpen={openSection === 'procedures'}
                onClick={() => toggleSection('procedures')}
            >
                <div className="space-y-4">
                    <div className="flex justify-between items-center mb-2">
                        <h4 className="font-bold">Lista procedur</h4>
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
                                        {readOnly ? (
                                            <span className="font-bold">{p.cost} PLN</span>
                                        ) : (
                                            <>
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
                                            </>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </AccordionItem>

            <AccordionItem
                title="Dokumenty"
                summary={documentsCount > 0 ? `(${documentsCount})` : null}
                isOpen={openSection === 'documents'}
                onClick={() => toggleSection('documents')}
            >
                <div className="space-y-4">
                    {!readOnly && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-4">
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-medium">Plik</label>
                                    <Input
                                        type="file"
                                        ref={fileInputRef}
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
                                    disabled={!file || !docTitle || !docDesc}
                                    className="w-full"
                                >
                                    Wgraj dokument
                                </Button>
                            </div>
                            <div className="flex items-center justify-center border rounded-md bg-muted/20 p-4">
                                {file ? (
                                    <div className="w-full h-full flex flex-col items-center">
                                        <p className="text-sm font-medium mb-2">Podgląd wybranego pliku</p>
                                        <DocumentPreview file={file} className="w-full max-h-[200px] object-contain" />
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground">Wybierz plik aby zobaczyć podgląd</p>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="mt-4">
                        <h4 className="font-bold mb-2">Lista dokumentów</h4>
                        {documents.length === 0 ? (
                            <p className="text-sm text-gray-500 text-center">Brak dokumentów</p>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                {documents.map((doc, i) => (
                                    <div key={i} className="border rounded-md overflow-hidden bg-card shadow-sm flex flex-col">
                                        <div className="aspect-video w-full bg-muted">
                                            <DocumentPreview documentId={doc.id} title={doc.title} className="w-full h-full" />
                                        </div>
                                        <div className="p-3 flex flex-col flex-1">
                                            <div className="font-bold text-sm truncate" title={doc.title}>{doc.title}</div>
                                            {doc.description && <div className="text-xs text-muted-foreground line-clamp-2 mb-2">{doc.description}</div>}

                                            {!readOnly && onDeleteDocument && (
                                                <div className="mt-auto pt-2 flex justify-end">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 px-2"
                                                        onClick={() => onDeleteDocument(doc.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4 mr-1" />
                                                        Usuń
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </AccordionItem>

            <AccordionItem
                title="Notatki"
                isOpen={openSection === 'notes'}
                onClick={() => toggleSection('notes')}
            >
                <NoteInput
                    value={note}
                    onChange={onUpdateNote}
                    readOnly={readOnly}
                />
            </AccordionItem>
        </div>
    );
};

const NoteInput = ({ value, onChange, readOnly }: { value: string, onChange: (val: string) => void, readOnly?: boolean }) => {
    const [localValue, setLocalValue] = useState(value);

    useEffect(() => {
        setLocalValue(value);
    }, [value]);

    return (
        <Textarea
            value={localValue}
            onChange={(e) => setLocalValue(e.target.value)}
            onBlur={() => onChange(localValue)}
            placeholder={readOnly ? "Brak notatki" : "Dodaj notatkę do wizyty..."}
            rows={5}
            readOnly={readOnly}
            className={readOnly ? "bg-muted" : ""}
        />
    );
};
