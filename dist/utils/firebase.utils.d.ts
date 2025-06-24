import * as admin from 'firebase-admin';
import { ICredentialDataDecryptedObject } from 'n8n-workflow';
/**
 * Interface for Firebase initialization options
 */
export interface IFirebaseInitOptions {
    serviceAccountKey: string;
    databaseURL?: string;
    storageBucket?: string;
    appName?: string;
}
/**
 * Initializes Firebase Admin SDK with the provided credentials
 * @param credentials The Firebase credentials
 * @returns The initialized Firebase app instance
 */
export declare function initializeFirebase(credentials: ICredentialDataDecryptedObject): Promise<admin.app.App>;
/**
 * Validates Firebase credentials and returns the initialized app
 * @param credentials The Firebase credentials
 * @returns The initialized Firebase app instance
 */
export declare function validateAndInitializeFirebase(credentials: ICredentialDataDecryptedObject): Promise<admin.app.App>;
/**
 * Gets a Firebase messaging instance from an initialized app
 * @param app The Firebase app instance
 * @returns The Firebase messaging instance
 */
export declare function getMessaging(app?: admin.app.App): admin.messaging.Messaging;
