import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { usePatients } from "./hooks/usePatients";
import { PatientsTable } from "./components/PatientsTable";
import { Navbar } from "@/components/layout/Navbar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function PatientsPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [inputValue, setInputValue] = useState("");
    const [page, setPage] = useState(0);
    const [size, setSize] = useState(10);

    const { data, isLoading } = usePatients({ page, size, search: searchQuery });

    const patients = data?.content || [];
    const totalPages = data?.totalPages || 0;

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            setSearchQuery(inputValue);
            setPage(0);
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            <main className="container mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold">Pacjenci</h1>
                        <p className="text-muted-foreground">
                            Tutaj możesz wyszukać danego pacjenta
                        </p>
                    </div>
                </div>

                <div className="mb-6">
                    <Input
                        placeholder="Imię/Nazwisko/PESEL/Telefon/UUID"
                        className="max-w-md"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                        Wciśnij Enter, aby wyszukać
                    </p>
                </div>

                <PatientsTable data={patients} isLoading={isLoading} />

                <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Wierszy na stronę:</span>
                        <Select
                            value={size.toString()}
                            onValueChange={(val) => {
                                setSize(Number(val));
                                setPage(0);
                            }}
                        >
                            <SelectTrigger className="w-[70px]">
                                <SelectValue placeholder={size.toString()} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="5">5</SelectItem>
                                <SelectItem value="10">10</SelectItem>
                                <SelectItem value="20">20</SelectItem>
                                <SelectItem value="50">50</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground">
                            Strona {page + 1} z {totalPages || 1}
                        </span>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setPage((p) => Math.max(0, p - 1))}
                                disabled={page === 0 || isLoading}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                                disabled={page >= totalPages - 1 || isLoading}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
