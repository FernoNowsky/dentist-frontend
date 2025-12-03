import { useState } from "react";
import { useAuth } from "react-oidc-context";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import { getBirthDateFromPesel, getGenderFromPesel } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
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
import type { PatientCreateDto } from "@/types/api";
import { validatePatientForm, type ValidationErrors } from "@/features/patients/utils/validation";
interface CompleteProfileDialogProps {
    open: boolean;
}

export function CompleteProfileDialog({ open }: CompleteProfileDialogProps) {
    const auth = useAuth();
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState<PatientCreateDto>({
        keycloakId: auth.user?.profile.sub || "",
        username: auth.user?.profile.preferred_username || "",
        firstName: auth.user?.profile.given_name || "",
        lastName: auth.user?.profile.family_name || "",
        email: auth.user?.profile.email || "",
        pesel: "",
        phone: "",
        birthday: "",
        gender: "",
        street: "",
        houseNumber: "",
        flatNumber: "",
        city: "",
        postalCode: "",
    });

    const [errors, setErrors] = useState<ValidationErrors>({});

    const createPatientMutation = useMutation({
        mutationFn: async (data: PatientCreateDto) => {
            await apiRequest("/users/patient", { method: "post", data });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["user"] });
            toast.success("Profil został uzupełniony pomyślnie!");
        },
        onError: () => {
            toast.error("Wystąpił błąd podczas zapisywania profilu.");
        },
    });

    const validateForm = (): boolean => {
        const newErrors = validatePatientForm(formData);
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        createPatientMutation.mutate(formData);
    };

    const updateField = (field: keyof PatientCreateDto, value: string) => {
        setFormData({ ...formData, [field]: value });
        // Clear error for this field when user starts typing
        if (errors[field]) {
            setErrors({ ...errors, [field]: "" });
        }
    };

    return (
        <Dialog open={open}>
            <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto" onInteractOutside={(e) => e.preventDefault()}>
                <DialogHeader>
                    <DialogTitle>Uzupełnij swój profil</DialogTitle>
                    <DialogDescription>
                        Podaj dodatkowe informacje, aby dokończyć rejestrację.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-2 gap-8 py-4">
                        {/* Left Column: Personal Data */}
                        <div className="space-y-4">
                            <h3 className="font-semibold text-lg">Dane pacjenta</h3>

                            <div className="space-y-2">
                                <Label htmlFor="firstName">Imię *</Label>
                                <Input
                                    id="firstName"
                                    value={formData.firstName}
                                    onChange={(e) => updateField("firstName", e.target.value)}
                                    required
                                />
                                {errors.firstName && <p className="text-red-500 text-sm">{errors.firstName}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="lastName">Nazwisko *</Label>
                                <Input
                                    id="lastName"
                                    value={formData.lastName}
                                    onChange={(e) => updateField("lastName", e.target.value)}
                                    required
                                />
                                {errors.lastName && <p className="text-red-500 text-sm">{errors.lastName}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email *</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => updateField("email", e.target.value)}
                                    required
                                />
                                {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="pesel">PESEL *</Label>
                                <Input
                                    id="pesel"
                                    value={formData.pesel}
                                    onChange={(e) => {
                                        const newPesel = e.target.value;
                                        const birthDate = getBirthDateFromPesel(newPesel);
                                        const gender = getGenderFromPesel(newPesel);
                                        setFormData(prev => ({
                                            ...prev,
                                            pesel: newPesel,
                                            birthday: birthDate || "",
                                            gender: gender || prev.gender
                                        }));
                                        if (errors.pesel) setErrors({ ...errors, pesel: "" });
                                    }}
                                    maxLength={11}
                                    required
                                />
                                {errors.pesel && <p className="text-red-500 text-sm">{errors.pesel}</p>}
                            </div>




                        </div>

                        <div className="space-y-4">
                            <h3 className="font-semibold text-lg">Dane kontaktowe</h3>

                            <div className="space-y-2">
                                <Label htmlFor="phone">Telefon *</Label>
                                <Input
                                    id="phone"
                                    value={formData.phone}
                                    onChange={(e) => updateField("phone", e.target.value)}
                                    maxLength={9}
                                    placeholder="123456789"
                                    required
                                />
                                {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
                            </div>

                            <h3 className="font-semibold text-lg mt-6">Adres zamieszkania</h3>

                            <div className="grid grid-cols-3 gap-4">
                                <div className="col-span-1 space-y-2">
                                    <Label htmlFor="street">Ulica *</Label>
                                    <Input
                                        id="street"
                                        value={formData.street}
                                        onChange={(e) => updateField("street", e.target.value)}
                                        required
                                    />
                                    {errors.street && <p className="text-red-500 text-sm">{errors.street}</p>}
                                </div>
                                <div className="col-span-1 space-y-2">
                                    <Label htmlFor="houseNumber">Numer domu *</Label>
                                    <Input
                                        id="houseNumber"
                                        value={formData.houseNumber}
                                        onChange={(e) => updateField("houseNumber", e.target.value)}
                                        required
                                    />
                                    {errors.houseNumber && <p className="text-red-500 text-sm">{errors.houseNumber}</p>}
                                </div>
                                <div className="col-span-1 space-y-2">
                                    <Label htmlFor="flatNumber">Numer mieszkania</Label>
                                    <Input
                                        id="flatNumber"
                                        value={formData.flatNumber}
                                        onChange={(e) => updateField("flatNumber", e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-1 space-y-2">
                                    <Label htmlFor="city">Miejscowość *</Label>
                                    <Input
                                        id="city"
                                        value={formData.city}
                                        onChange={(e) => updateField("city", e.target.value)}
                                        required
                                    />
                                    {errors.city && <p className="text-red-500 text-sm">{errors.city}</p>}
                                </div>
                                <div className="col-span-1 space-y-2">
                                    <Label htmlFor="postalCode">Kod pocztowy *</Label>
                                    <Input
                                        id="postalCode"
                                        value={formData.postalCode}
                                        onChange={(e) => updateField("postalCode", e.target.value)}
                                        placeholder="00-000"
                                        maxLength={6}
                                        required
                                    />
                                    {errors.postalCode && <p className="text-red-500 text-sm">{errors.postalCode}</p>}
                                </div>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={createPatientMutation.isPending}>
                            {createPatientMutation.isPending ? "Zapisywanie..." : "Zapisz zmiany"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
