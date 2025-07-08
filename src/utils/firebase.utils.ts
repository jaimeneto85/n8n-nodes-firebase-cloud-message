import * as admin from 'firebase-admin';
import { ICredentialDataDecryptedObject } from 'n8n-workflow';
import { GoogleAuth } from 'google-auth-library';

/**
 * OAuth2 token cache to avoid unnecessary requests
 */
const tokenCache = new Map<string, { token: string; expiresAt: number }>();

/**
 * Gets an OAuth2 access token for Google Cloud/Firebase
 * @param credentials The OAuth2 credentials
 * @returns The access token
 */
async function getOAuth2AccessToken(credentials: ICredentialDataDecryptedObject): Promise<string> {
	const clientId = credentials.clientId as string;
	const clientSecret = credentials.clientSecret as string;
	const refreshToken = credentials.refreshToken as string;
	
	// Check cache first
	const cacheKey = `${clientId}:${refreshToken}`;
	const cached = tokenCache.get(cacheKey);
	if (cached && cached.expiresAt > Date.now()) {
		return cached.token;
	}
	
	// Request new token
	const tokenUrl = 'https://oauth2.googleapis.com/token';
	const response = await fetch(tokenUrl, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
		},
		body: new URLSearchParams({
			client_id: clientId,
			client_secret: clientSecret,
			refresh_token: refreshToken,
			grant_type: 'refresh_token',
		}),
	});
	
	if (!response.ok) {
		const errorData = await response.text();
		throw new Error(`OAuth2 token request failed: ${response.status} - ${errorData}`);
	}
	
	const tokenData = await response.json();
	
	if (!tokenData.access_token) {
		throw new Error('No access token in OAuth2 response');
	}
	
	// Cache the token (expires in ~1 hour, cache for 50 minutes to be safe)
	const expiresIn = tokenData.expires_in || 3600;
	const expiresAt = Date.now() + (expiresIn - 600) * 1000; // 10 minutes buffer
	
	tokenCache.set(cacheKey, {
		token: tokenData.access_token,
		expiresAt,
	});
	
	return tokenData.access_token;
}


/**
 * Initializes Firebase Admin SDK with the provided credentials
 * @param credentials The Firebase credentials (OAuth2 or Service Account)
 * @returns The initialized Firebase app instance
 */
export async function initializeFirebase(
	credentials: ICredentialDataDecryptedObject,
): Promise<admin.app.App> {
	try {
		const authType = credentials.authType || 'oauth2';
		let projectId: string;
		let appName: string;
		
		if (authType === 'oauth2') {
			projectId = credentials.projectId as string;
			appName = `oauth2-${projectId}`;
		} else {
			// Service Account (legacy)
			const serviceAccountKey = JSON.parse(credentials.serviceAccountKey as string);
			projectId = serviceAccountKey.project_id;
			appName = `sa-${projectId}`;
		}
		
		// Check if app is already initialized
		try {
			const existingApp = admin.app(appName);
			return existingApp;
		} catch (error) {
			// App doesn't exist, create new one
			let initOptions: admin.AppOptions;
			
			if (authType === 'oauth2') {
				// OAuth2 authentication using Google Auth Library
				const googleAuth = new GoogleAuth({
					credentials: {
						client_id: credentials.clientId as string,
						client_secret: credentials.clientSecret as string,
						refresh_token: credentials.refreshToken as string,
						type: 'authorized_user',
					},
					scopes: [
						'https://www.googleapis.com/auth/cloud-platform',
						'https://www.googleapis.com/auth/firebase.messaging',
					],
				});
				
				// Get auth client
				const authClient = await googleAuth.getClient();
				
				// Create a custom credential that uses the Google Auth client
				const customCredential = {
					getAccessToken: async () => {
						const tokenResponse = await authClient.getAccessToken();
						return { 
							access_token: tokenResponse.token || '',
							expires_in: 3600,
						};
					},
					projectId,
				};
				
				initOptions = {
					credential: customCredential as any,
					projectId,
				};
			} else {
				// Service Account authentication (legacy)
				const serviceAccountKey = JSON.parse(credentials.serviceAccountKey as string);
				initOptions = {
					credential: admin.credential.cert(serviceAccountKey),
					projectId,
				};
			}

			// Initialize Firebase with configured options
			return admin.initializeApp(initOptions, appName);
		}
	} catch (error: any) {
		throw new Error(`Failed to initialize Firebase: ${error.message}`);
	}
}

/**
 * Validates Firebase credentials and returns the initialized app
 * @param credentials The Firebase credentials (OAuth2 or Service Account)
 * @returns The initialized Firebase app instance
 */
export async function validateAndInitializeFirebase(
	credentials: ICredentialDataDecryptedObject,
): Promise<admin.app.App> {
	const authType = credentials.authType || 'oauth2';
	
	if (authType === 'oauth2') {
		// Validate OAuth2 credentials
		const requiredFields = ['projectId', 'clientId', 'clientSecret', 'refreshToken'];
		const missingFields = requiredFields.filter(field => !credentials[field]);
		
		if (missingFields.length > 0) {
			throw new Error(`OAuth2 credentials incomplete. Missing: ${missingFields.join(', ')}`);
		}
		
		// Test OAuth2 token retrieval
		try {
			await getOAuth2AccessToken(credentials);
		} catch (error: any) {
			throw new Error(`OAuth2 authentication failed: ${error.message}`);
		}
	} else {
		// Validate Service Account credentials (legacy)
		if (!credentials.serviceAccountKey) {
			throw new Error('Service Account JSON é obrigatório');
		}
		
		try {
			const serviceAccountKey = JSON.parse(credentials.serviceAccountKey as string);
			
			const requiredFields = ['type', 'project_id', 'private_key_id', 'private_key', 'client_email', 'client_id'];
			const missingFields = requiredFields.filter(field => !serviceAccountKey[field]);
			
			if (missingFields.length > 0) {
				throw new Error(`Service Account JSON inválido. Campos ausentes: ${missingFields.join(', ')}`);
			}
			
			if (serviceAccountKey.type !== 'service_account') {
				throw new Error('Tipo de credencial inválido. Deve ser "service_account"');
			}
		} catch (error: any) {
			if (error.message.includes('Failed to parse') || error.message.includes('Unexpected token')) {
				throw new Error('Formato JSON inválido. Verifique se o JSON está correto');
			}
			throw error;
		}
	}
	
	// Initialize Firebase
	return await initializeFirebase(credentials);
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

/**
 * Clears the OAuth2 token cache (useful for testing or credential changes)
 */
export function clearTokenCache(): void {
	tokenCache.clear();
} 