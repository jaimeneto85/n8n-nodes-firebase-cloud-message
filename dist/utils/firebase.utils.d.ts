import * as admin from 'firebase-admin';
import { ICredentialDataDecryptedObject } from 'n8n-workflow';
/**
 * Initializes Firebase Admin SDK with the provided credentials
 * @param credentials The Firebase credentials (OAuth2 or Service Account)
 * @returns The initialized Firebase app instance
 */
export declare function initializeFirebase(credentials: ICredentialDataDecryptedObject): Promise<admin.app.App>;
/**
 * Validates Firebase credentials and returns the initialized app
 * @param credentials The Firebase credentials (OAuth2 or Service Account)
 * @returns The initialized Firebase app instance
 */
export declare function validateAndInitializeFirebase(credentials: ICredentialDataDecryptedObject): Promise<admin.app.App>;
/**
 * Gets a Firebase messaging instance from an initialized app
 * @param app The Firebase app instance
 * @returns The Firebase messaging instance
 */
export declare function getMessaging(app?: admin.app.App): admin.messaging.Messaging;
/**
 * Clears the OAuth2 token cache (useful for testing or credential changes)
 */
export declare function clearTokenCache(): void;
