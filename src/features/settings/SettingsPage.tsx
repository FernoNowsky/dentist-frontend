import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { apiRequest } from "@/lib/api";
import { useAuth } from "react-oidc-context";
import { Navbar } from "@/components/layout/Navbar";
import { toast } from "sonner";

export function SettingsPage() {
    const auth = useAuth();
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [errors, setErrors] = useState<{
        currentPassword?: string;
        newPassword?: string;
        confirmPassword?: string;
        general?: string;
    }>({});
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});

        let hasError = false;
        const newErrors: typeof errors = {};

        if (newPassword !== confirmPassword) {
            newErrors.confirmPassword = "Nowe hasła nie są identyczne.";
            hasError = true;
        }

        if (newPassword.length < 6) {
            newErrors.newPassword = "Nowe hasło musi mieć co najmniej 6 znaków.";
            hasError = true;
        }

        if (hasError) {
            setErrors(newErrors);
            return;
        }

        setIsLoading(true);
        try {
            const keycloakId = auth.user?.profile.sub;
            if (!keycloakId) throw new Error("User not logged in");

            await apiRequest(`/users/${keycloakId}/reset-password`, {
                method: "put",
                data: {
                    password: currentPassword,
                    newPassword: newPassword
                }
            });

            toast.success("Hasło zostało zmienione pomyślnie.");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (err: any) {
            console.error(err);
            if (err.response?.data?.details === "Old password not correct") {
                setErrors({ currentPassword: "Podano nieprawidłowe hasło." });
            } else if (err.response?.data?.message) {
                setErrors({ general: `Błąd: ${err.response.data.message}` });
            } else {
                setErrors({ general: "Wystąpił błąd podczas zmiany hasła." });
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <main className="container mx-auto min-h-[calc(100vh-80px)] px-4 py-8 flex justify-center items-center">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle>Ustawienia konta</CardTitle>
                        <CardDescription>
                            Tutaj możesz zmienić swoje hasło.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="currentPassword">Obecne hasło</Label>
                                <Input
                                    id="currentPassword"
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    required
                                />
                                {errors.currentPassword && (
                                    <p className="text-sm text-red-500">{errors.currentPassword}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="newPassword">Nowe hasło</Label>
                                <Input
                                    id="newPassword"
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                />
                                {errors.newPassword && (
                                    <p className="text-sm text-red-500">{errors.newPassword}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Potwierdź nowe hasło</Label>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                                {errors.confirmPassword && (
                                    <p className="text-sm text-red-500">{errors.confirmPassword}</p>
                                )}
                            </div>
                            {errors.general && (
                                <p className="text-sm text-red-500 text-center">{errors.general}</p>
                            )}
                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? "Zmienianie..." : "Zmień hasło"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
