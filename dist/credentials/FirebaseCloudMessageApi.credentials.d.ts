import { IAuthenticateGeneric, ICredentialDataDecryptedObject, ICredentialTestRequest, ICredentialType, INodeProperties } from 'n8n-workflow';
/**
 * Token Manager for Firebase Authentication
 * Handles caching, refresh, and cleanup of tokens
 */
declare class TokenManager {
    private static instance;
    private tokenCache;
    private refreshTimers;
    private retryAttempts;
    private readonly MAX_RETRY_ATTEMPTS;
    private readonly REFRESH_BUFFER_MS;
    private readonly TOKEN_EXPIRY_MS;
    private constructor();
    static getInstance(): TokenManager;
    /**
     * Get a token from cache or generate a new one
     * @param projectId Firebase project ID
     * @param generateTokenFn Function to generate a new token
     */
    getToken(projectId: string, generateTokenFn: () => Promise<string>): Promise<string>;
    /**
     * Set a token in the cache and schedule refresh
     * @param projectId Firebase project ID
     * @param token The token to cache
     */
    private setToken;
    /**
     * Handle token generation errors with retry logic
     * @param projectId Firebase project ID
     * @param generateTokenFn Function to generate a new token
     * @param error The error that occurred
     */
    private handleTokenError;
    /**
     * Clean up expired tokens and timers
     */
    cleanupExpiredTokens(): void;
    /**
     * Support for multiple Firebase projects
     * @param projectIds Array of project IDs to pre-initialize
     * @param generateTokenFn Function to generate tokens for each project
     */
    initializeProjects(projectIds: string[], generateTokenFn: (projectId: string) => Promise<string>): Promise<void>;
}
export declare class FirebaseCloudMessageApi implements ICredentialType {
    name: string;
    displayName: string;
    documentationUrl: string;
    properties: INodeProperties[];
    authenticate: IAuthenticateGeneric;
    test: ICredentialTestRequest;
    validateCredentials(credentials: ICredentialDataDecryptedObject): Promise<{
        isValid: boolean;
        errorMessage?: string;
    }>;
    /**
     * Get the token manager instance
     */
    getTokenManager(): TokenManager;
}
export {};
