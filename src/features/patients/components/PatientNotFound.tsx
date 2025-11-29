import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Link } from '@tanstack/react-router';
import { UserX } from 'lucide-react';
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter,
} from "@/components/ui/card";

export const PatientNotFound = () => {
    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Navbar />
            <main className="flex-1 container mx-auto px-4 flex flex-col items-center justify-center text-center">
                <Card className="max-w-md w-full animate-in fade-in zoom-in duration-500 shadow-lg">
                    <CardHeader className="flex flex-col items-center pb-2">
                        <div className="bg-muted p-4 rounded-full mb-4">
                            <UserX className="w-12 h-12 text-muted-foreground" />
                        </div>
                        <CardTitle className="text-2xl font-bold text-foreground">Nie znaleziono pacjenta</CardTitle>
                        <CardDescription className="text-center pt-2">
                            Pacjent, którego szukasz, nie istnieje w naszej bazie danych.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="text-muted-foreground text-sm">
                        Upewnij się, że adres URL jest poprawny lub pacjent nie został usunięty z systemu.
                    </CardContent>
                    <CardFooter className="flex flex-col sm:flex-row gap-3 justify-center pb-6">
                        <Button asChild variant="default" className="w-full sm:w-auto">
                            <Link to="/patients">
                                Lista pacjentów
                            </Link>
                        </Button>
                        <Button asChild variant="outline" className="w-full sm:w-auto">
                            <Link to="/dashboard">
                                Wróć do panelu
                            </Link>
                        </Button>
                    </CardFooter>
                </Card>
            </main>
        </div>
    );
};
