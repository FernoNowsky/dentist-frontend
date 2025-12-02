import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import type { UserResponseDto } from "@/types/api";
import { User, Calendar, Settings, ArrowRight } from "lucide-react";

import patientCardBg from "@/assets/patient-card-bg.png";
import visitsBg from "@/assets/visits-bg.png";
import settingsBg from "@/assets/settings-bg.png";

interface PatientDashboardProps {
    user: UserResponseDto;
}

export function PatientDashboard({ user }: PatientDashboardProps) {
    const cards = [
        {
            title: "Twoja karta pacjenta",
            description: "Sprawdź swoje dane osobowe i historię leczenia",
            icon: <User className="w-8 h-8 text-primary" />,
            bgImage: patientCardBg,
            action: (
                <Button asChild className="w-full group-hover:bg-primary/90 transition-colors">
                    <Link to="/patients/$id" params={{ id: user.id }} className="flex items-center justify-center gap-2">
                        Przejdź do karty <ArrowRight className="w-4 h-4" />
                    </Link>
                </Button>
            ),
        },
        {
            title: "Twoje wizyty",
            description: "Zarządzaj swoimi wizytami i planuj nowe",
            icon: <Calendar className="w-8 h-8 text-primary" />,
            bgImage: visitsBg,
            action: (
                <Button asChild className="w-full group-hover:bg-primary/90 transition-colors">
                    <Link to="/visits" search={{ patientId: user.id }} className="flex items-center justify-center gap-2">
                        Przejdź do wizyt <ArrowRight className="w-4 h-4" />
                    </Link>
                </Button>
            ),
        },
        {
            title: "Ustawienia",
            description: "Zmień hasło i ustawienia konta",
            icon: <Settings className="w-8 h-8 text-primary" />,
            bgImage: settingsBg,
            action: (
                <Button asChild className="w-full group-hover:bg-primary/90 transition-colors">
                    <Link to="/settings" className="flex items-center justify-center gap-2">
                        Przejdź do ustawień <ArrowRight className="w-4 h-4" />
                    </Link>
                </Button>
            ),
        },
    ];

    return (
        <div className="container mx-auto px-4 py-8 min-h-[calc(100vh-80px)] flex flex-col">
            <div className="text-center space-y-2 mt-8">
                <h1 className="text-3xl font-bold tracking-tight text-primary">Witaj, {user.firstName}!</h1>
                <p className="text-muted-foreground text-lg">Wybierz, co chcesz dzisiaj zrobić.</p>
            </div>

            <div className="flex-1 flex items-center justify-center w-full">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl">
                    {cards.map((card, index) => (
                        <Card key={index} className="relative h-80 overflow-hidden group border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 rounded-2xl">
                            <div
                                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                                style={{ backgroundImage: `url(${card.bgImage})` }}
                            />

                            <div className="absolute inset-0 bg-white/70 group-hover:bg-white/50 transition-colors duration-500 backdrop-blur-[2px] group-hover:backdrop-blur-none" />

                            <CardContent className="relative z-10 h-full flex flex-col justify-between p-8">
                                <div className="space-y-4">
                                    <div className="bg-white/80 w-fit p-3 rounded-xl shadow-sm backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
                                        {card.icon}
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-2xl font-bold text-slate-900 group-hover:text-primary transition-colors duration-300">
                                            {card.title}
                                        </h3>
                                        <p className="text-slate-600 font-medium leading-relaxed">
                                            {card.description}
                                        </p>
                                    </div>
                                </div>

                                <div className="transform translate-y-2 opacity-90 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                                    {card.action}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
