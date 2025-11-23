import { useState } from "react";
import { Input } from "@/components/ui/input";
import { usePatients } from "./hooks/usePatients";
import { PatientsTable } from "./components/PatientsTable";
import { Navbar } from "@/components/layout/Navbar";

export function PatientsPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [inputValue, setInputValue] = useState("");
    const { data, isLoading } = usePatients({ page: 0, size: 10, search: searchQuery });

    // Mock data
    const patients = data?.content || [];

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            setSearchQuery(inputValue);
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
                        placeholder="Imię/Nazwisko/PESEL"
                        className="max-w-md"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                </div>

                <PatientsTable data={patients} isLoading={isLoading} />
            </main>
        </div>
    );
}
