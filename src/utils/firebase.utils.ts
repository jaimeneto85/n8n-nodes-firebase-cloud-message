import * as admin from 'firebase-admin';
import { ICredentialDataDecryptedObject, NodeOperationError } from 'n8n-workflow';

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
export async function initializeFirebase(
	credentials: ICredentialDataDecryptedObject,
): Promise<admin.app.App> {
	try {
		// Parse service account key
		const serviceAccountKey = JSON.parse(credentials.serviceAccountKey as string);
		const projectId = serviceAccountKey.project_id;
		
		// Use project ID as app name for multiple app support
		const appName = projectId;
		
		// Check if app is already initialized
		try {
			const existingApp = admin.app(appName);
			return existingApp;
		} catch (error) {
			// App doesn't exist, create new one
			const initOptions: admin.AppOptions = {
				credential: admin.credential.cert(serviceAccountKey),
			};

			// Add optional configurations if provided
			if (credentials.databaseURL) {
				initOptions.databaseURL = credentials.databaseURL as string;
			}

			if (credentials.storageBucket) {
				initOptions.storageBucket = credentials.storageBucket as string;
			}

			// Initialize Firebase with all configured options
			return admin.initializeApp(initOptions, appName);
		}
	} catch (error: any) {
		throw new Error(`Failed to initialize Firebase: ${error.message}`);
	}
}

/**
 * Validates Firebase credentials and returns the initialized app
 * @param credentials The Firebase credentials
 * @returns The initialized Firebase app instance
 */
export async function validateAndInitializeFirebase(
	credentials: ICredentialDataDecryptedObject,
): Promise<admin.app.App> {
	// Validate service account key
	if (!credentials.serviceAccountKey) {
		throw new Error('Service Account Key is required');
	}
	
	try {
		// Parse service account key to validate JSON format
		const serviceAccountKey = JSON.parse(credentials.serviceAccountKey as string);
		
		// Check required fields
		const requiredFields = ['type', 'project_id', 'private_key_id', 'private_key', 'client_email', 'client_id'];
		const missingFields = requiredFields.filter(field => !serviceAccountKey[field]);
		
		if (missingFields.length > 0) {
			throw new Error(`Service Account JSON is missing required fields: ${missingFields.join(', ')}`);
		}
		
		// Validate that it's a service account
		if (serviceAccountKey.type !== 'service_account') {
			throw new Error('Invalid credential type. Must be a service_account.');
		}
		
		// Initialize Firebase
		return await initializeFirebase(credentials);
	} catch (error: any) {
		if (error.message.includes('Failed to parse')) {
			throw new Error('Invalid Service Account JSON format');
		}
		throw error;
	}
}

/**
 * Gets a Firebase messaging instance from an initialized app
 * @param app The Firebase app instance
 * @returns The Firebase messaging instance
 */
export function getMessaging(app?: admin.app.App): admin.messaging.Messaging {
	try {
		return app ? admin.messaging(app) : admin.messaging();
	} catch (error: any) {
		throw new Error(`Failed to get Firebase messaging instance: ${error.message}`);
	}
} 