import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import type { ToothHistoryPageRequestDto, ToothHistoryItemResponseDto, PageResponseDto } from "@/types/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { pl } from "date-fns/locale";

interface ToothHistoryProps {
    patientId: string;
    tooth: string;
    location: string;
}

export function ToothHistory({ patientId, tooth, location }: ToothHistoryProps) {
    const [page, setPage] = useState(0);
    const size = 10;

    const { data: historyResponse, isLoading } = useQuery({
        queryKey: ["tooth-history", patientId, tooth, location, page],
        queryFn: async () => {
            const params: ToothHistoryPageRequestDto = {
                patientId,
                tooth,
                location,
                page,
                size,
                sortBy: "createdAt",
                sortDirection: "DESC"
            };
            return apiRequest<PageResponseDto<ToothHistoryItemResponseDto>>("/tooth-history", { params });
        },
        enabled: !!patientId && !!tooth,
    });

    const history = historyResponse?.content || [];
    const totalPages = historyResponse?.totalPages || 0;

    // Helper function to generate color from diagnose name
    const stringToColor = (str: string) => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        const c = (hash & 0x00ffffff).toString(16).toUpperCase();
        return '#' + '00000'.substring(0, 6 - c.length) + c;
    };

    return (
        <Card className="max-h-[400px] overflow-y-auto">
            <CardHeader>
                <CardTitle className="text-lg">
                    Historia zęba {tooth} - {location.toUpperCase()}
                </CardTitle>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                ) : history.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        Brak historii dla tego zęba.
                    </div>
                ) : (
                    <>
                        <div className="space-y-4 pr-2">
                            {history.map((item, index) => (
                                <div
                                    key={`${item.visitId}-${index}`}
                                    className="border rounded-lg p-4 space-y-2"
                                >
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="w-4 h-4 rounded-full flex-shrink-0"
                                            style={{
                                                backgroundColor: item.diagnose?.diagnoseDictionary?.name
                                                    ? stringToColor(item.diagnose.diagnoseDictionary.name)
                                                    : '#6b7280'
                                            }}
                                        />
                                        <span className="text-sm font-medium">
                                            {format(new Date(item.visitStartDateTime), "d MMMM yyyy, HH:mm", { locale: pl })}
                                        </span>
                                    </div>

                                    {item.isDiagnose && item.diagnose && (
                                        <div className="ml-6">
                                            <p className="text-sm font-semibold text-primary">
                                                Diagnoza: {item.diagnose.diagnoseDictionary.name}
                                            </p>
                                            {item.diagnose.comment && (
                                                <p className="text-sm text-muted-foreground">
                                                    {item.diagnose.comment}
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    {item.isProcedure && item.procedure && (
                                        <div className="ml-6">
                                            <p className="text-sm font-semibold text-primary">
                                                Zabieg: {item.procedure.procedureDictionary.name}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                Koszt: {item.procedure.cost} PLN
                                            </p>
                                            {item.procedure.comment && (
                                                <p className="text-sm text-muted-foreground">
                                                    {item.procedure.comment}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {totalPages > 1 && (
                            <div className="flex items-center justify-between pt-4 border-t mt-4">
                                <span className="text-sm text-muted-foreground">
                                    Strona {page + 1} z {totalPages}
                                </span>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => setPage((p) => Math.max(0, p - 1))}
                                        disabled={page === 0}
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                                        disabled={page >= totalPages - 1}
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    );
}
