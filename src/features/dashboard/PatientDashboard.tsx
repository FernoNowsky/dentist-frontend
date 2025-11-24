import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import type { UserResponseDto } from "@/types/api";
import { useState } from "react";
import { ChangePasswordDialog } from "../auth/components/ChangePasswordDialog";

interface PatientDashboardProps {
    user: UserResponseDto;
}

export function PatientDashboard({ user }: PatientDashboardProps) {
    const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

    return (
        <div className="container mx-auto px-4 py-8 h-[calc(100vh-80px)] flex items-center justify-center">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
                <Card className="h-64 flex flex-col justify-between">
                    <CardHeader>
                        <CardTitle className="text-center text-xl text-primary">Twoja karta pacjenta</CardTitle>
                    </CardHeader>
                    <CardContent className="flex justify-center pb-8">
                        <Button asChild>
                            <Link to="/patients/$id" params={{ id: user.id }}>Przejdź do karty pacjenta</Link>
                        </Button>
                    </CardContent>
                </Card>

                <Card className="h-64 flex flex-col justify-between">
                    <CardHeader>
                        <CardTitle className="text-center text-xl text-primary">Twoje wizyty</CardTitle>
                    </CardHeader>
                    <CardContent className="flex justify-center pb-8">
                        <Button asChild>
                            {/* TODO: Pass state/query to open visits tab */}
                            <Link to="/patients/$id" params={{ id: user.id }}>Przejdź do wizyt</Link>
                        </Button>
                    </CardContent>
                </Card>

                <Card className="h-64 flex flex-col justify-between">
                    <CardHeader>
                        <CardTitle className="text-center text-xl text-primary">Twoje dokumenty</CardTitle>
                    </CardHeader>
                    <CardContent className="flex justify-center pb-8">
                        <Button asChild>
                            {/* TODO: Pass state/query to open documents tab */}
                            <Link to="/patients/$id" params={{ id: user.id }}>Przejdź do dokumentów</Link>
                        </Button>
                    </CardContent>
                </Card>

                <Card className="h-64 flex flex-col justify-between">
                    <CardHeader>
                        <CardTitle className="text-center text-xl text-primary">Ustawienia</CardTitle>
                    </CardHeader>
                    <CardContent className="flex justify-center pb-8">
                        <Button
                            onClick={() => setIsChangePasswordOpen(true)}
                        >
                            Przejdź do ustawień
                        </Button>
                    </CardContent>
                </Card>
            </div>
            <ChangePasswordDialog open={isChangePasswordOpen} onOpenChange={setIsChangePasswordOpen} />
        </div>
    );
}
