import { Navbar } from '../components/layout/Navbar';
import { Button } from '../components/ui/button';
import { Link } from '@tanstack/react-router';
import { ShieldAlert } from 'lucide-react';
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter,
} from "@/components/ui/card";

export const ForbiddenPage = () => {
    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Navbar />
            <main className="flex-1 container mx-auto px-4 flex flex-col items-center justify-center text-center">
                <Card className="max-w-md w-full animate-in fade-in zoom-in duration-500 border-destructive/20 shadow-lg">
                    <CardHeader className="flex flex-col items-center pb-2">
                        <div className="bg-destructive/10 p-4 rounded-full mb-4">
                            <ShieldAlert className="w-12 h-12 text-destructive" />
                        </div>
                        <CardTitle className="text-2xl font-bold text-foreground">403 - Brak dostępu</CardTitle>
                        <CardDescription className="text-center pt-2">
                            Nie masz wystarczających uprawnień, aby wyświetlić tę stronę.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="text-muted-foreground text-sm">
                        Skontaktuj się z administratorem systemu, jeśli uważasz, że to błąd lub potrzebujesz dostępu do tego zasobu.
                    </CardContent>
                    <CardFooter className="flex justify-center pb-6">
                        <Button asChild className="w-full sm:w-auto">
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
