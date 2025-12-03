import { useParams } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import { getBirthDateFromPesel, getGenderFromPesel } from "@/lib/utils";
import type { PatientUpdateDto, UserResponseDto } from "@/types/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Navbar } from "@/components/layout/Navbar";

import { ScheduledVisits } from "@/features/patients/components/ScheduledVisits";
import { VisitHistory } from "@/features/patients/components/VisitHistory";
import { PatientDocuments } from "@/features/patients/components/PatientDocuments";
import { Spinner } from "@/components/ui/spinner";
import { ForbiddenPage } from "@/routes/ForbiddenPage";
import { PatientNotFound } from "@/features/patients/components/PatientNotFound";
import { CreateVisitDialog } from "@/features/visits/components/CreateVisitDialog";
import { useUserCheck } from "@/features/auth/hooks/useUserCheck";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import { validatePatientForm, type ValidationErrors } from "@/features/patients/utils/validation";

 

export function PatientDetailsPage() {
    const { id } = useParams({ from: "/patients/$id" });
    const { data: currentUser } = useUserCheck();
    const [isCreateVisitOpen, setIsCreateVisitOpen] = useState(false);
    const queryClient = useQueryClient();

    const [formData, setFormData] = useState<PatientUpdateDto>({
        username: "",
        firstName: "",
        lastName: "",
        email: "",
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
    
    const validateForm = (): boolean => {
        const newErrors = validatePatientForm(formData);
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const updatePatientMutation = useMutation({
        mutationFn: async (data: PatientUpdateDto) => {
            await apiRequest(`/users/patient/${id}`, { method: "put", data });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["patient", id] });
            toast.success("Zaktualizowano dane pacjenta.");
        },
        onError: () => {
            toast.error("Wystąpił błąd podczas zapisywania profilu.");
        },
    });
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        updatePatientMutation.mutate(formData);
    };
    
    const updateField = (field: keyof PatientUpdateDto, value: string) => {
        if (field === "pesel") {
            const birthDate = getBirthDateFromPesel(value) || "";
            const gender = getGenderFromPesel(value) || formData.gender || "";
            setFormData({ ...formData, pesel: value, birthday: birthDate, gender });
        } else {
            setFormData({ ...formData, [field]: value });
        }
        // Clear error for this field when user starts typing
        if (errors[field]) {
            setErrors({ ...errors, [field]: "" });
        }
    };

    const { data: patient, isLoading, error } = useQuery({
        queryKey: ["patient", id],
        queryFn: async () => {
            return apiRequest<UserResponseDto>(`/users/${id}`);
        },
        retry: (failureCount, error) => {
            if ((error as any)?.response?.status === 403) {
                return false;
            }
            return failureCount < 3;
        },
    });

    // Prefill form once patient is loaded
    if (patient && !formData.username) {
        setFormData({
            username: patient.username || "",
            firstName: patient.firstName || "",
            lastName: patient.lastName || "",
            email: patient.email || "",
            pesel: patient.pesel || "",
            phone: patient.phone || "",
            birthday: patient.birthday || "",
            gender: patient.pesel ? (getGenderFromPesel(patient.pesel) || "") : "",
            street: patient.street || "",
            houseNumber: patient.houseNumber || "",
            flatNumber: patient.flatNumber || "",
            city: patient.city || "",
            postalCode: patient.postalCode || "",
        });
    }

    if (isLoading) {
        return <Spinner size="lg" className="min-h-screen" />;
    }

    if (error) {
        const status = (error as any)?.response?.status;
        if (status === 403) {
            return <ForbiddenPage />;
        }
        if (status === 404) {
            return <PatientNotFound />;
        }
    }

    if (!patient) {
        return <PatientNotFound />;
    }

    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            <main className="container mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-primary">Karta pacjenta</h1>
                        <p className="text-muted-foreground">
                            {patient.firstName} {patient.lastName} | PESEL: {patient.pesel || "Brak"}
                        </p>
                    </div>
                    {currentUser?.role === "ADMIN" && (
                        <Button onClick={() => setIsCreateVisitOpen(true)}>
                            Utwórz wizytę
                        </Button>
                    )}
                </div>

                <Tabs defaultValue="personal" className="w-full">
                    <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
                        <TabsTrigger value="personal" className="data-[state=active]:text-primary rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2">Dane osobowe</TabsTrigger>
                        <TabsTrigger value="scheduled" className="data-[state=active]:text-primary rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2">Umówione wizyty</TabsTrigger>
                        <TabsTrigger value="documents" className="data-[state=active]:text-primary rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2">Dokumenty</TabsTrigger>
                        <TabsTrigger value="history" className="data-[state=active]:text-primary rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2">Historia wizyt</TabsTrigger>
                    </TabsList>

                    <TabsContent value="personal" className="mt-6">
                        <form onSubmit={handleSubmit}>
                            <div className="grid grid-cols-2 gap-12">
                                <div className="space-y-6">
                                    <h3 className="font-semibold text-lg">Dane pacjenta</h3>
                                    <div className="space-y-2">
                                        <Label htmlFor="firstName">Imię *</Label>
                                        <Input id="firstName" value={formData.firstName} onChange={(e) => updateField("firstName", e.target.value)} />
                                        {errors.firstName && <p className="text-red-500 text-sm">{errors.firstName}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="lastName">Nazwisko *</Label>
                                        <Input id="lastName" value={formData.lastName} onChange={(e) => updateField("lastName", e.target.value)} />
                                        {errors.lastName && <p className="text-red-500 text-sm">{errors.lastName}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email *</Label>
                                        <Input id="email" type="email" value={formData.email} onChange={(e) => updateField("email", e.target.value)} />
                                        {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="pesel">PESEL *</Label>
                                        <Input id="pesel" value={formData.pesel} onChange={(e) => updateField("pesel", e.target.value)} maxLength={11} />
                                        {errors.pesel && <p className="text-red-500 text-sm">{errors.pesel}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Data urodzenia</Label>
                                        <Input value={formData.birthday || "-"} readOnly />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Płeć</Label>
                                        <Input value={formData.gender || "-"} readOnly />
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <h3 className="font-semibold text-lg">Dane kontaktowe</h3>
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Telefon *</Label>
                                        <Input id="phone" value={formData.phone || ""} onChange={(e) => updateField("phone", e.target.value)} maxLength={9} />
                                        {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
                                    </div>

                                    <h3 className="font-semibold text-lg mt-8">Adres zamieszkania</h3>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="col-span-1 space-y-2">
                                            <Label htmlFor="street">Ulica *</Label>
                                            <Input id="street" value={formData.street || ""} onChange={(e) => updateField("street", e.target.value)} />
                                            {errors.street && <p className="text-red-500 text-sm">{errors.street}</p>}
                                        </div>
                                        <div className="col-span-1 space-y-2">
                                            <Label htmlFor="houseNumber">Numer domu *</Label>
                                            <Input id="houseNumber" value={formData.houseNumber || ""} onChange={(e) => updateField("houseNumber", e.target.value)} />
                                            {errors.houseNumber && <p className="text-red-500 text-sm">{errors.houseNumber}</p>}
                                        </div>
                                        <div className="col-span-1 space-y-2">
                                            <Label htmlFor="flatNumber">Numer mieszkania</Label>
                                            <Input id="flatNumber" value={formData.flatNumber || ""} onChange={(e) => updateField("flatNumber", e.target.value)} />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="col-span-1 space-y-2">
                                            <Label htmlFor="city">Miejscowość *</Label>
                                            <Input id="city" value={formData.city || ""} onChange={(e) => updateField("city", e.target.value)} />
                                            {errors.city && <p className="text-red-500 text-sm">{errors.city}</p>}
                                        </div>
                                        <div className="col-span-1 space-y-2">
                                            <Label htmlFor="postalCode">Kod pocztowy *</Label>
                                            <Input id="postalCode" value={formData.postalCode || ""} onChange={(e) => updateField("postalCode", e.target.value)} placeholder="00-000" maxLength={6} />
                                            {errors.postalCode && <p className="text-red-500 text-sm">{errors.postalCode}</p>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-6">
                                <Button type="submit" disabled={updatePatientMutation.isPending}>
                                    {updatePatientMutation.isPending ? "Zapisywanie..." : "Zapisz zmiany"}
                                </Button>
                            </div>
                        </form>
                    </TabsContent>
                    <TabsContent value="scheduled" className="mt-6">
                        <ScheduledVisits patientId={patient.id} />
                    </TabsContent>
                    <TabsContent value="documents" className="mt-6">
                        <PatientDocuments patientId={patient.id} />
                    </TabsContent>
                    <TabsContent value="history" className="mt-6">
                        <VisitHistory patientId={patient.id} />
                    </TabsContent>
                </Tabs>
            </main>
            {currentUser?.role === "ADMIN" && patient && (
                <CreateVisitDialog
                    open={isCreateVisitOpen}
                    onOpenChange={setIsCreateVisitOpen}
                    patient={patient}
                />
            )}
        </div>
    );
}
