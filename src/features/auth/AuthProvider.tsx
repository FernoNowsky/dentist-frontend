import React from 'react';
import { AuthProvider as OidcProvider, type AuthProviderProps } from 'react-oidc-context';

const oidcConfig: AuthProviderProps = {
    authority: 'http://localhost:5000/realms/dentist',
    client_id: 'dentist-frontend',
    redirect_uri: window.location.origin,
    onSigninCallback: () => {
        window.history.replaceState({}, document.title, window.location.pathname);
    },
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    return <OidcProvider {...oidcConfig}>{children}</OidcProvider>;
};
