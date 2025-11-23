import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Calendar, Users, ClipboardList, Activity } from 'lucide-react';
import heroImage from '@/assets/dental_clinic.png';
import { Link, useNavigate } from '@tanstack/react-router';
import { useAuth } from 'react-oidc-context';

export const LandingPage = () => {
    const auth = useAuth();
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Navbar />

            <section className="relative flex-1 flex items-center overflow-hidden py-12 lg:py-24 bg-gradient-to-b from-accent/20 to-background">
                <div className="container mx-auto px-4 md:px-6 flex flex-col lg:flex-row items-center gap-12 lg:gap-24">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="lg:w-1/2 space-y-6 text-center lg:text-left"
                    >
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-primary leading-tight">
                            Nowoczesny system <br />
                            <span className="text-foreground">zarządzania placówką dentystyczną</span>
                        </h1>
                        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto lg:mx-0">
                            Ten system wspiera zarządzanie placówką dentystyczną poprzez kompleksową obsługę pacjentów, wizyt oraz personelu. Zwiększ efektywność swojego gabinetu już dziś.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                            <Button
                                size="lg"
                                className="text-lg px-8 w-full sm:w-auto"
                                onClick={() => {
                                    if (auth.isAuthenticated) {
                                        navigate({ to: '/dashboard' });
                                    } else {
                                        auth.signinRedirect();
                                    }
                                }}
                            >
                                Rozpocznij
                            </Button>
                            <Link to="/about">
                                <Button variant="outline" size="lg" className="text-lg px-8 w-full sm:w-auto border-primary text-primary hover:bg-primary/10">
                                    Dowiedz się więcej
                                </Button>
                            </Link>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                        className="lg:w-1/2 w-full relative"
                    >
                        <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-primary/20 aspect-video lg:aspect-auto lg:h-[500px]">
                            <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent z-10" />
                            <img
                                src={heroImage}
                                alt="Modern Dental Clinic"
                                className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
                            />
                        </div>
                        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-secondary/20 rounded-full blur-3xl -z-10" />
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl -z-10" />
                    </motion.div>
                </div>
            </section>

            <section className="py-20 bg-muted/30">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="text-center mb-16 space-y-4">
                        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-primary">Kluczowe Funkcjonalności</h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
                            Poznaj narzędzia, które usprawnią pracę Twojego gabinetu i podniosą jakość obsługi pacjentów.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <FeatureCard
                            icon={<Calendar className="h-10 w-10 text-primary" />}
                            title="Inteligentny Kalendarz"
                            description="Łatwe planowanie wizyt, zarządzanie grafikami lekarzy i automatyczne przypomnienia."
                            delay={0.1}
                        />
                        <FeatureCard
                            icon={<Users className="h-10 w-10 text-primary" />}
                            title="Baza Pacjentów"
                            description="Kompleksowa kartoteka pacjentów z historią leczenia, zdjęciami i dokumentacją."
                            delay={0.2}
                        />
                        <FeatureCard
                            icon={<ClipboardList className="h-10 w-10 text-primary" />}
                            title="Dokumentacja Medyczna"
                            description="Elektroniczna dokumentacja medyczna zgodna z wymogami, dostępna w każdej chwili."
                            delay={0.3}
                        />
                        <FeatureCard
                            icon={<Activity className="h-10 w-10 text-primary" />}
                            title="Statystyki i Raporty"
                            description="Monitoruj wydajność gabinetu dzięki zaawansowanym raportom i analizom."
                            delay={0.4}
                        />
                    </div>
                </div>
            </section>

            <footer className="py-8 border-t bg-primary/5">
                <div className="container mx-auto px-4 text-center text-muted-foreground text-sm">
                    &copy; {new Date().getFullYear()} Dentist+. Wszelkie prawa zastrzeżone.
                </div>
            </footer>
        </div>
    );
};

const FeatureCard = ({ icon, title, description, delay }: { icon: React.ReactNode, title: string, description: string, delay: number }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay }}
        >
            <Card className="h-full hover:shadow-xl transition-all duration-300 border-primary/10 bg-card hover:border-primary/30">
                <CardHeader className="flex items-center gap-4">
                    <div className="mb-4 p-3 bg-accent/20 w-fit rounded-xl">
                        {icon}
                    </div>
                    <CardTitle className="text-xl text-foreground">{title}</CardTitle>
                </CardHeader>
                <CardContent>
                    <CardDescription className="text-base">
                        {description}
                    </CardDescription>
                </CardContent>
            </Card>
        </motion.div>
    );
};
