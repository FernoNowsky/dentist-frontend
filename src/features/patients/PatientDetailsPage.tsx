import { useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import type { UserResponseDto } from "@/types/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Navbar } from "@/components/layout/Navbar";
import { CreateVisitDialog } from "@/features/visits/components/CreateVisitDialog";

export function PatientDetailsPage() {
    const { id } = useParams({ from: "/patients/$id" });

    const { data: patient, isLoading } = useQuery({
        queryKey: ["patient", id],
        queryFn: async () => {
            return apiRequest<UserResponseDto>(`/users/${id}`);
        },
    });

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (!patient) {
        return <div>Patient not found</div>;
    }

    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            <main className="container mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold">Karta pacjenta</h1>
                        <p className="text-muted-foreground">
                            {patient.firstName} {patient.lastName} | PESEL: {patient.pesel || "Brak"}
                        </p>
                    </div>
                    <CreateVisitDialog
                        patientId={patient.id}
                        patientName={`${patient.firstName} ${patient.lastName}`}
                    />
                </div>

                <Tabs defaultValue="personal" className="w-full">
                    <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
                        <TabsTrigger value="personal" className="rounded-none border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:bg-transparent px-4 py-2">Dane osobowe</TabsTrigger>
                        <TabsTrigger value="scheduled" className="rounded-none border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:bg-transparent px-4 py-2">Umówione wizyty</TabsTrigger>
                        <TabsTrigger value="documents" className="rounded-none border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:bg-transparent px-4 py-2">Dokumenty</TabsTrigger>
                        <TabsTrigger value="history" className="rounded-none border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:bg-transparent px-4 py-2">Historia wizyt</TabsTrigger>
                    </TabsList>

                    <TabsContent value="personal" className="mt-6">
                        <div className="grid grid-cols-2 gap-12">
                            <div className="space-y-6">
                                <h3 className="font-semibold text-lg">Dane pacjenta</h3>
                                <div className="space-y-2">
                                    <Label>Imię</Label>
                                    <Input value={patient.firstName} readOnly />
                                </div>
                                <div className="space-y-2">
                                    <Label>Nazwisko</Label>
                                    <Input value={patient.lastName} readOnly />
                                </div>
                                <div className="space-y-2">
                                    <Label>PESEL</Label>
                                    <Input value={patient.pesel || ""} readOnly />
                                </div>
                                <div className="space-y-2">
                                    <Label>Data urodzenia</Label>
                                    <Input value={patient.birthday || "-"} readOnly />
                                </div>
                                <div className="space-y-2">
                                    <Label>Płeć</Label>
                                    <Input value="-" readOnly />
                                </div>
                            </div>

                            <div className="space-y-6">
                                <h3 className="font-semibold text-lg">Dane kontaktowe</h3>
                                <div className="space-y-2">
                                    <Label>Telefon</Label>
                                    <Input value={patient.phone || ""} readOnly />
                                </div>

                                <h3 className="font-semibold text-lg mt-8">Adres zamieszkania</h3>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="col-span-1 space-y-2">
                                        <Label>Ulica</Label>
                                        <Input value={patient.street || "-"} readOnly />
                                    </div>
                                    <div className="col-span-1 space-y-2">
                                        <Label>Numer domu</Label>
                                        <Input value={patient.houseNumber || "-"} readOnly />
                                    </div>
                                    <div className="col-span-1 space-y-2">
                                        <Label>Numer mieszkania</Label>
                                        <Input value={patient.flatNumber || "-"} readOnly />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-1 space-y-2">
                                        <Label>Miejscowość</Label>
                                        <Input value={patient.city || "-"} readOnly />
                                    </div>
                                    <div className="col-span-1 space-y-2">
                                        <Label>Kod pocztowy</Label>
                                        <Input value={patient.postalCode || "-"} readOnly />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </TabsContent>
                    <TabsContent value="scheduled">
                        <div className="py-4">Umówione wizyty - placeholder</div>
                    </TabsContent>
                    <TabsContent value="documents">
                        <div className="py-4">Dokumenty - placeholder</div>
                    </TabsContent>
                    <TabsContent value="history">
                        <div className="py-4">Historia wizyt - placeholder</div>
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    );
}
