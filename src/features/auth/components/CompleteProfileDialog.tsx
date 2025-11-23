import { useState } from "react";
import { useAuth } from "react-oidc-context";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
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
import type { PatientCreateDto } from "@/types/api";

interface CompleteProfileDialogProps {
    open: boolean;
}

interface ValidationErrors {
    [key: string]: string;
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
        apartmentNumber: "",
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
        },
    });

    const validatePesel = (pesel: string): boolean => {
        if (!/^\d{11}$/.test(pesel)) return false;

        // Validate PESEL checksum
        const weights = [1, 3, 7, 9, 1, 3, 7, 9, 1, 3];
        const digits = pesel.split('').map(Number);
        const sum = weights.reduce((acc, weight, i) => acc + weight * digits[i], 0);
        const checksum = (10 - (sum % 10)) % 10;

        return checksum === digits[10];
    };

    const validatePhone = (phone: string): boolean => {
        return /^\d{9}$/.test(phone);
    };

    const validateEmail = (email: string): boolean => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const validatePostalCode = (code: string): boolean => {
        return /^\d{2}-\d{3}$/.test(code);
    };

    const validateForm = (): boolean => {
        const newErrors: ValidationErrors = {};

        if (!formData.firstName.trim()) {
            newErrors.firstName = "Imię jest wymagane";
        }

        if (!formData.lastName.trim()) {
            newErrors.lastName = "Nazwisko jest wymagane";
        }

        if (!validateEmail(formData.email)) {
            newErrors.email = "Nieprawidłowy adres email";
        }

        if (!validatePesel(formData.pesel)) {
            newErrors.pesel = "PESEL musi składać się z 11 cyfr i być poprawny";
        }

        if (!validatePhone(formData.phone)) {
            newErrors.phone = "Numer telefonu musi składać się z 9 cyfr";
        }

        if (!formData.birthday) {
            newErrors.birthday = "Data urodzenia jest wymagana";
        }

        if (!formData.gender) {
            newErrors.gender = "Płeć jest wymagana";
        }

        if (!formData.street?.trim()) {
            newErrors.street = "Ulica jest wymagana";
        }

        if (!formData.houseNumber?.trim()) {
            newErrors.houseNumber = "Numer domu jest wymagany";
        }

        if (!formData.city?.trim()) {
            newErrors.city = "Miejscowość jest wymagana";
        }

        if (formData.postalCode && !validatePostalCode(formData.postalCode)) {
            newErrors.postalCode = "Kod pocztowy musi być w formacie XX-XXX";
        }

        if (!formData.postalCode?.trim()) {
            newErrors.postalCode = "Kod pocztowy jest wymagany";
        }

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
                                    onChange={(e) => updateField("pesel", e.target.value)}
                                    maxLength={11}
                                    required
                                />
                                {errors.pesel && <p className="text-red-500 text-sm">{errors.pesel}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="birthday">Data urodzenia *</Label>
                                <Input
                                    id="birthday"
                                    type="date"
                                    value={formData.birthday}
                                    onChange={(e) => updateField("birthday", e.target.value)}
                                    required
                                />
                                {errors.birthday && <p className="text-red-500 text-sm">{errors.birthday}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="gender">Płeć *</Label>
                                <select
                                    id="gender"
                                    value={formData.gender}
                                    onChange={(e) => updateField("gender", e.target.value)}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    required
                                >
                                    <option value="">Wybierz płeć</option>
                                    <option value="Mężczyzna">Mężczyzna</option>
                                    <option value="Kobieta">Kobieta</option>
                                </select>
                                {errors.gender && <p className="text-red-500 text-sm">{errors.gender}</p>}
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
                                    <Label htmlFor="apartmentNumber">Numer mieszkania</Label>
                                    <Input
                                        id="apartmentNumber"
                                        value={formData.apartmentNumber}
                                        onChange={(e) => updateField("apartmentNumber", e.target.value)}
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
