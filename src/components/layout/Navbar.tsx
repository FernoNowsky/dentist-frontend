import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useAuth } from "react-oidc-context";
import { Menu } from "lucide-react";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { useState } from "react";
import { useUserCheck } from "@/features/auth/hooks/useUserCheck";

export function Navbar() {
    const auth = useAuth();
    const { data: user } = useUserCheck();
    const [isOpen, setIsOpen] = useState(false);

    const isPatient = user?.role === "USER";

    const NavItems = () => (
        <>
            {!isPatient && (
                <>
                    <Button variant="ghost" asChild className="w-full justify-start md:w-auto">
                        <Link to="/dashboard" onClick={() => setIsOpen(false)}>Kalendarz</Link>
                    </Button>
                    <Button variant="ghost" className="w-full justify-start md:w-auto">
                        Wizyty
                    </Button>
                    <Button variant="ghost" asChild className="w-full justify-start md:w-auto">
                        <Link to="/patients" onClick={() => setIsOpen(false)}>Pacjenci</Link>
                    </Button>
                </>
            )}
            <Button
                onClick={() => auth.signoutRedirect()}
                className="w-full md:w-auto"
            >
                Wyloguj się
            </Button>
        </>
    );

    return (
        <header className="border-b bg-background">
            <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <Link to="/dashboard" className="font-bold text-xl">
                        DentistApp
                    </Link>
                    {user && (
                        <div className="hidden md:block text-sm text-muted-foreground ml-4">
                            Witaj, <span className="font-semibold text-foreground">{user.firstName}</span>
                        </div>
                    )}
                </div>

                {/* Desktop Nav */}
                <nav className="hidden md:flex gap-4 items-center">
                    <NavItems />
                </nav>

                {/* Mobile Nav */}
                <Sheet open={isOpen} onOpenChange={setIsOpen}>
                    <SheetTrigger asChild className="md:hidden">
                        <Button variant="ghost" size="icon">
                            <Menu className="h-6 w-6" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="right">
                        <SheetHeader>
                            <SheetTitle>Menu</SheetTitle>
                        </SheetHeader>
                        <div className="flex flex-col gap-4 mt-8">
                            <NavItems />
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
        </header>
    );
}
