import { Navbar } from '../components/layout/Navbar';
import { Button } from '../components/ui/button';
import { Link } from '@tanstack/react-router';
import { MapPinOff } from 'lucide-react';

export const NotFoundPage = () => {
    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Navbar />
            <main className="flex-1 container mx-auto px-4 flex flex-col items-center justify-center text-center">
                <div className="bg-card p-8 rounded-lg shadow-lg border border-border max-w-md w-full flex flex-col items-center animate-in fade-in zoom-in duration-500">
                    <div className="bg-primary/10 p-4 rounded-full mb-6">
                        <MapPinOff className="w-16 h-16 text-primary" />
                    </div>
                    <h1 className="text-4xl font-bold text-foreground mb-2">404</h1>
                    <h2 className="text-xl font-semibold text-foreground mb-4">
                        Taka strona nie istnieje
                    </h2>
                    <p className="text-muted-foreground mb-8">
                        Wygląda na to, że zabłądziłeś. Strona, której szukasz, nie została odnaleziona w naszym systemie.
                    </p>
                    <Button asChild className="w-full sm:w-auto">
                        <Link to="/">
                            Wróć na stronę główną
                        </Link>
                    </Button>
                </div>
            </main>
        </div>
    );
};
