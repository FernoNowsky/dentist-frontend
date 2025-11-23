import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { apiRequest } from "@/lib/api";
import { useAuth } from "react-oidc-context";

interface ChangePasswordDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ChangePasswordDialog({ open, onOpenChange }: ChangePasswordDialogProps) {
    const auth = useAuth();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);

        if (password !== confirmPassword) {
            setError("Hasła nie są identyczne.");
            return;
        }

        if (password.length < 8) {
            setError("Hasło musi mieć co najmniej 8 znaków.");
            return;
        }

        setIsLoading(true);
        try {
            const keycloakId = auth.user?.profile.sub;
            if (!keycloakId) throw new Error("User not logged in");

            await apiRequest(`/users/${keycloakId}/reset-password`, {
                method: "put",
                data: {
                    value: password
                }
            });
            setSuccess(true);
            setTimeout(() => {
                onOpenChange(false);
                setSuccess(false);
                setPassword("");
                setConfirmPassword("");
            }, 2000);
        } catch (err) {
            console.error(err);
            setError("Wystąpił błąd podczas zmiany hasła.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Zmień hasło</DialogTitle>
                    <DialogDescription>
                        Wprowadź nowe hasło do swojego konta.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="password" className="text-right">
                                Nowe hasło
                            </Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="col-span-3"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="confirmPassword" className="text-right">
                                Potwierdź
                            </Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="col-span-3"
                                required
                            />
                        </div>
                        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                        {success && <p className="text-green-500 text-sm text-center">Hasło zostało zmienione pomyślnie.</p>}
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={isLoading} className="bg-black text-white hover:bg-gray-800">
                            {isLoading ? "Zmienianie..." : "Zmień hasło"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
