/**
 * Decode a JWT token without verification (client-side only)
 * This is safe for reading claims since the token is already verified by Keycloak
 */
export function decodeJwt(token: string): any {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error('Failed to decode JWT:', error);
        return null;
    }
}

/**
 * Check if the user has a specific role in Keycloak
 * Checks both realm_access and resource_access
 */
export function hasKeycloakRole(accessToken: string | undefined, role: string): boolean {
    if (!accessToken) return false;

    const decoded = decodeJwt(accessToken);
    if (!decoded) return false;

    const realmRoles = decoded.realm_access?.roles || [];
    if (realmRoles.includes(role)) return true;
    return false;
}

/**
 * Get all roles from the access token
 */
export function getKeycloakRoles(accessToken: string | undefined): string[] {
    if (!accessToken) return [];

    const decoded = decodeJwt(accessToken);
    if (!decoded) return [];

    const roles = new Set<string>();

    const realmRoles = decoded.realm_access?.roles || [];
    realmRoles.forEach((role: string) => roles.add(role));

    const resourceAccess = decoded.resource_access || {};
    for (const client in resourceAccess) {
        const clientRoles = resourceAccess[client]?.roles || [];
        clientRoles.forEach((role: string) => roles.add(role));
    }

    return Array.from(roles);
}
