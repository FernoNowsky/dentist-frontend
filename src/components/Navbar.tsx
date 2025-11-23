import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import logo from '@/assets/dentist_plus_logo.png';
import { useAuth } from 'react-oidc-context';

export const Navbar = () => {
    const auth = useAuth();

    return (
        <nav className="w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
            <div className="container mx-auto px-4 md:px-6 flex h-16 items-center justify-between">
                <div className="flex items-center gap-2">
                    <Link to="/" className="flex items-center gap-2">
                        <img src={logo} alt="Dentist+ Logo" className="h-10 w-auto bg-transparent" />
                        <span className="text-xl font-bold text-primary hidden sm:inline-block">Dentist+</span>
                    </Link>
                </div>
                <div className="flex items-center gap-4">
                    <Button variant="default" onClick={() => auth.signinRedirect({
                        redirect_uri: window.location.origin + '/dashboard',
                    })}>
                        Zaloguj się
                    </Button>
                </div>
            </div>
        </nav>
    );
};
