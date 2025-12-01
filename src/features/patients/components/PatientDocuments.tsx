import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import type { DocumentResponseDto, PageResponseDto, VisitResponseDto } from "@/types/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { Link } from "@tanstack/react-router";
import { DocumentPreview } from "@/features/visits/components/DocumentPreview";
import { useState } from "react";

interface PatientDocumentsProps {
    patientId: string;
}

const DOCUMENTS_PER_PAGE = 12;

export function PatientDocuments({ patientId }: PatientDocumentsProps) {
    const [currentPage, setCurrentPage] = useState(0);

    const { data: documentsResponse, isLoading: documentsLoading } = useQuery({
        queryKey: ["patient-documents", patientId, currentPage],
        queryFn: async () => {
            return apiRequest<PageResponseDto<DocumentResponseDto>>("/documents", {
                params: {
                    patientId,
                    page: currentPage,
                    size: DOCUMENTS_PER_PAGE,
                    sortBy: "createdAt",
                    sortDirection: "DESC"
                }
            });
        },
    });

    const { data: visitsResponse, isLoading: visitsLoading } = useQuery({
        queryKey: ["patient-visits-for-documents", patientId],
        queryFn: async () => {
            return apiRequest<PageResponseDto<VisitResponseDto>>("/visits", {
                params: { patientId, size: 100 }
            });
        },
    });

    const documents = documentsResponse?.content || [];
    const visits = visitsResponse?.content || [];
    const totalPages = documentsResponse?.totalPages || 0;

    const isLoading = documentsLoading || visitsLoading;

    if (isLoading && currentPage === 0) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (documents.length === 0 && currentPage === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <p className="text-muted-foreground">Brak dokumentów dla tego pacjenta</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                {documents.map((doc) => {
                    const visit = visits.find(v => v.id === doc.visitId);

                    return (
                        <Card key={doc.id} className="overflow-hidden">
                            <div className="aspect-video w-full bg-muted">
                                <DocumentPreview documentId={doc.id} title={doc.title} className="w-full h-full" />
                            </div>
                            <CardContent className="p-4 space-y-3">
                                <div>
                                    <h3 className="font-bold text-lg truncate" title={doc.title}>
                                        {doc.title}
                                    </h3>
                                    {doc.description && (
                                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                                            {doc.description}
                                        </p>
                                    )}
                                </div>

                                {visit && (
                                    <div className="pt-3 border-t space-y-1">
                                        <p className="text-sm">
                                            <span className="font-medium">Data wizyty:</span>{" "}
                                            {format(new Date(visit.dateTimeStart), "d MMMM yyyy, HH:mm", { locale: pl })}
                                        </p>
                                        <p className="text-sm">
                                            <span className="font-medium">Dentysta:</span>{" "}
                                            {visit.doctor.firstName} {visit.doctor.lastName}
                                        </p>
                                    </div>
                                )}

                                {visit && (
                                    <Button asChild className="w-full mt-2">
                                        <Link to="/visits/$visitId/details" params={{ visitId: visit.id }}>
                                            Szczegóły wizyty
                                        </Link>
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-6">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                        disabled={currentPage === 0 || documentsLoading}
                    >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Poprzednia
                    </Button>
                    <span className="text-sm text-muted-foreground px-4">
                        Strona {currentPage + 1} z {totalPages}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                        disabled={currentPage >= totalPages - 1 || documentsLoading}
                    >
                        Następna
                        <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                </div>
            )}
        </div>
    );
}
