import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { ShieldCheck, Clock, Database, Smartphone } from 'lucide-react';
import { Link, useNavigate } from '@tanstack/react-router';
import { useAuth } from 'react-oidc-context';

export const AboutPage = () => {
    const auth = useAuth();
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Navbar />

            <main className="flex-1 container mx-auto px-4 md:px-6 py-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="max-w-4xl mx-auto space-y-12"
                >
                    <section className="text-center space-y-6">
                        <h1 className="text-4xl font-bold tracking-tight text-primary">O Systemie Dentist+</h1>
                        <p className="text-xl text-muted-foreground">
                            Kompleksowe rozwiązanie do zarządzania nowoczesną placówką stomatologiczną.
                        </p>
                    </section>

                    <section className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-4 p-6 rounded-2xl bg-accent/10 border border-accent/20">
                            <h2 className="text-2xl font-semibold text-primary">Dla Lekarzy i Personelu</h2>
                            <p className="text-muted-foreground">
                                Nasz system oferuje intuicyjne narzędzia do codziennej pracy. Zarządzaj swoim grafikiem, przeglądaj historię leczenia pacjentów i prowadź dokumentację medyczną w jednym miejscu.
                            </p>
                            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                                <li>Elektroniczna dokumentacja medyczna</li>
                                <li>Zaawansowany kalendarz wizyt</li>
                                <li>Szybki dostęp do danych pacjenta</li>
                            </ul>
                        </div>
                        <div className="space-y-4 p-6 rounded-2xl bg-secondary/10 border border-secondary/20">
                            <h2 className="text-2xl font-semibold text-secondary-foreground">Dla Pacjentów</h2>
                            <p className="text-muted-foreground h-[96px]">
                                Dbamy o komfort pacjentów poprzez usprawnienie procesu rejestracji i komunikacji. System zapewnia bezpieczeństwo danych osobowych i medycznych.
                            </p>
                            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                                <li>Historia wizyt i leczenia</li>
                                <li>Bezpieczeństwo danych</li>
                            </ul>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-6 text-center text-primary">Dlaczego warto wybrać Dentist+?</h2>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            <FeatureItem
                                icon={<ShieldCheck className="h-8 w-8 text-primary" />}
                                title="Bezpieczeństwo"
                                description="Autoryzacja użytkownika zapewnia najwyższy standard bezpieczeństwa danych."
                            />
                            <FeatureItem
                                icon={<Clock className="h-8 w-8 text-primary" />}
                                title="Oszczędność Czasu"
                                description="Automatyzacja powtarzalnych czynności pozwala skupić się na leczeniu."
                            />
                            <FeatureItem
                                icon={<Database className="h-8 w-8 text-primary" />}
                                title="Centralna Baza"
                                description="Wszystkie dane w jednym miejscu, dostępne z każdego urządzenia."
                            />
                            <FeatureItem
                                icon={<Smartphone className="h-8 w-8 text-primary" />}
                                title="Mobilność"
                                description="Responsywny design pozwala na pracę na tabletach i telefonach."
                            />
                        </div>
                    </section>

                    <div className="text-center pt-8">
                        <Button
                            size="lg"
                            className="text-lg px-8"
                            onClick={() => {
                                if (auth.isAuthenticated) {
                                    navigate({ to: '/dashboard' });
                                } else {
                                    auth.signinRedirect();
                                }
                            }}
                        >
                            Rozpocznij pracę z systemem
                        </Button>
                    </div>
                </motion.div>
            </main>

            <footer className="py-8 border-t bg-primary/5 mt-auto">
                <div className="container mx-auto px-4 text-center text-muted-foreground text-sm">
                    &copy; {new Date().getFullYear()} Dentist+. Wszelkie prawa zastrzeżone.
                </div>
            </footer>
        </div>
    );
};

const FeatureItem = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
    <Card className="bg-card border-primary/10 hover:border-primary/30 transition-colors">
        <CardHeader>
            <div className="mb-2 flex justify-center p-2 bg-accent/20 rounded-full w-fit mx-auto">{icon}</div>
            <CardTitle className="text-lg text-center">{title}</CardTitle>
        </CardHeader>
        <CardContent>
            <p className="text-sm text-muted-foreground text-center">{description}</p>
        </CardContent>
    </Card>
);
