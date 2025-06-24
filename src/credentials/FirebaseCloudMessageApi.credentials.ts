import {
	IAuthenticateGeneric,
	ICredentialDataDecryptedObject,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

/**
 * Token Manager for Firebase Authentication
 * Handles caching, refresh, and cleanup of tokens
 */
class TokenManager {
	private static instance: TokenManager;
	private tokenCache: Map<string, { token: string; expiry: number }>;
	private refreshTimers: Map<string, NodeJS.Timeout>;
	private retryAttempts: Map<string, number>;
	private readonly MAX_RETRY_ATTEMPTS = 3;
	private readonly REFRESH_BUFFER_MS = 5 * 60 * 1000; // 5 minutes before expiry
	private readonly TOKEN_EXPIRY_MS = 60 * 60 * 1000; // 1 hour default expiry

	private constructor() {
		this.tokenCache = new Map();
		this.refreshTimers = new Map();
		this.retryAttempts = new Map();
	}

	public static getInstance(): TokenManager {
		if (!TokenManager.instance) {
			TokenManager.instance = new TokenManager();
		}
		return TokenManager.instance;
	}

	/**
	 * Get a token from cache or generate a new one
	 * @param projectId Firebase project ID
	 * @param generateTokenFn Function to generate a new token
	 */
	public async getToken(projectId: string, generateTokenFn: () => Promise<string>): Promise<string> {
		const cachedToken = this.tokenCache.get(projectId);
		
		// Return cached token if it exists and is not expired
		if (cachedToken && cachedToken.expiry > Date.now()) {
			return cachedToken.token;
		}
		
		// Generate new token
		try {
			const token = await generateTokenFn();
			this.setToken(projectId, token);
			return token;
		} catch (error) {
			return this.handleTokenError(projectId, generateTokenFn, error);
		}
	}

	/**
	 * Set a token in the cache and schedule refresh
	 * @param projectId Firebase project ID
	 * @param token The token to cache
	 */
	private setToken(projectId: string, token: string): void {
		const expiry = Date.now() + this.TOKEN_EXPIRY_MS;
		
		// Store token in cache
		this.tokenCache.set(projectId, { token, expiry });
		
		// Reset retry counter on successful token generation
		this.retryAttempts.set(projectId, 0);
		
		// Clear any existing refresh timer
		if (this.refreshTimers.has(projectId)) {
			clearTimeout(this.refreshTimers.get(projectId));
		}
		
		// Schedule token refresh before expiry
		const refreshTime = this.TOKEN_EXPIRY_MS - this.REFRESH_BUFFER_MS;
		const timer = setTimeout(() => {
			this.tokenCache.delete(projectId);
		}, refreshTime);
		
		this.refreshTimers.set(projectId, timer);
	}

	/**
	 * Handle token generation errors with retry logic
	 * @param projectId Firebase project ID
	 * @param generateTokenFn Function to generate a new token
	 * @param error The error that occurred
	 */
	private async handleTokenError(
		projectId: string, 
		generateTokenFn: () => Promise<string>, 
		error: unknown
	): Promise<string> {
		// Initialize or increment retry counter
		const currentAttempts = this.retryAttempts.get(projectId) || 0;
		this.retryAttempts.set(projectId, currentAttempts + 1);
		
		// If under max retries, try again
		if (currentAttempts < this.MAX_RETRY_ATTEMPTS) {
			// Exponential backoff
			const backoffMs = Math.pow(2, currentAttempts) * 1000;
			await new Promise(resolve => setTimeout(resolve, backoffMs));
			
			try {
				const token = await generateTokenFn();
				this.setToken(projectId, token);
				return token;
			} catch (retryError) {
				// If still failing after retry, throw error
				if (currentAttempts + 1 >= this.MAX_RETRY_ATTEMPTS) {
					throw retryError;
				}
				return this.handleTokenError(projectId, generateTokenFn, retryError);
			}
		}
		
		// Max retries exceeded
		throw error;
	}

	/**
	 * Clean up expired tokens and timers
	 */
	public cleanupExpiredTokens(): void {
		const now = Date.now();
		
		// Clean up expired tokens
		for (const [projectId, { expiry }] of this.tokenCache.entries()) {
			if (expiry <= now) {
				this.tokenCache.delete(projectId);
				
				// Clear associated refresh timer
				if (this.refreshTimers.has(projectId)) {
					clearTimeout(this.refreshTimers.get(projectId));
					this.refreshTimers.delete(projectId);
				}
			}
		}
	}

	/**
	 * Support for multiple Firebase projects
	 * @param projectIds Array of project IDs to pre-initialize
	 * @param generateTokenFn Function to generate tokens for each project
	 */
	public async initializeProjects(
		projectIds: string[], 
		generateTokenFn: (projectId: string) => Promise<string>
	): Promise<void> {
		const tokenPromises = projectIds.map(async (projectId) => {
			try {
				const token = await generateTokenFn(projectId);
				this.setToken(projectId, token);
			} catch (error) {
				console.error(`Failed to initialize token for project ${projectId}:`, error);
			}
		});
		
		await Promise.all(tokenPromises);
	}
}

/**
 * Validates Firebase Service Account JSON
 * @param serviceAccountJson The JSON string to validate
 */
function validateFirebaseServiceAccountJson(serviceAccountJson: string): {
	isValid: boolean;
	errorMessage?: string;
} {
	try {
		const parsedJson = JSON.parse(serviceAccountJson);
		
		// Check for required fields
		const requiredFields = [
			'type',
			'project_id',
			'private_key_id',
			'private_key',
			'client_email',
			'client_id',
		];
		
		const missingFields = requiredFields.filter(field => !parsedJson[field]);
		
		if (missingFields.length > 0) {
			return {
				isValid: false,
				errorMessage: `Service Account JSON is missing required fields: ${missingFields.join(', ')}`,
			};
		}
		
		// Validate that it's a service account
		if (parsedJson.type !== 'service_account') {
			return {
				isValid: false,
				errorMessage: 'Invalid credential type. Must be a service_account.',
			};
		}
		
		// Validate private key format
		if (!parsedJson.private_key.includes('BEGIN PRIVATE KEY') || !parsedJson.private_key.includes('END PRIVATE KEY')) {
			return {
				isValid: false,
				errorMessage: 'Invalid private key format.',
			};
		}
		
		// Validate email format
		if (!parsedJson.client_email.includes('@') || !parsedJson.client_email.endsWith('.gserviceaccount.com')) {
			return {
				isValid: false,
				errorMessage: 'Invalid client email format. Should end with .gserviceaccount.com',
			};
		}
		
		return { isValid: true };
	} catch (error: unknown) {
		return {
			isValid: false,
			errorMessage: error instanceof Error ? error.message : 'Invalid JSON format',
		};
	}
}

export class FirebaseCloudMessageApi implements ICredentialType {
	name = 'firebaseCloudMessageApi';
	displayName = 'Firebase Cloud Message API';
	documentationUrl = 'https://firebase.google.com/docs/cloud-messaging';
	properties: INodeProperties[] = [
		{
			displayName: 'Service Account Key',
			name: 'serviceAccountKey',
			type: 'string',
			typeOptions: { 
				password: true,
				rows: 10,
			},
			default: '',
			description: 'Service account key JSON for Firebase Cloud Messaging. Download from Firebase Console > Project Settings > Service Accounts.',
			required: true,
		},
		{
			displayName: 'Database URL',
			name: 'databaseURL',
			type: 'string',
			default: '',
			description: 'Firebase Realtime Database URL (optional). Only needed if using Realtime Database alongside FCM.',
			required: false,
		},
		{
			displayName: 'Storage Bucket',
			name: 'storageBucket',
			type: 'string',
			default: '',
			description: 'Firebase Storage bucket name (optional). Only needed if using Firebase Storage alongside FCM.',
			required: false,
		},
		{
			displayName: 'Region',
			name: 'region',
			type: 'options',
			options: [
				{ name: 'Default (us-central1)', value: 'us-central1' },
				{ name: 'Asia Pacific (asia-east1)', value: 'asia-east1' },
				{ name: 'Europe (europe-west1)', value: 'europe-west1' },
				{ name: 'United States (us-central1)', value: 'us-central1' },
			],
			default: 'us-central1',
			description: 'Firebase Cloud Messaging region',
			required: false,
		},
		{
			displayName: 'Enable Token Caching',
			name: 'enableTokenCaching',
			type: 'boolean',
			default: true,
			description: 'Whether to cache authentication tokens to reduce API calls',
			required: false,
		},
		{
			displayName: 'Token Refresh Buffer (minutes)',
			name: 'tokenRefreshBuffer',
			type: 'number',
			default: 5,
			description: 'Minutes before token expiry to refresh the token',
			displayOptions: {
				show: {
					enableTokenCaching: [true],
				},
			},
			required: false,
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {},
	};

	// This allows the credential to be tested
	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://fcm.googleapis.com/v1/projects',
			url: '{{=JSON.parse($credentials.serviceAccountKey).project_id}}:testIamPermissions',
			method: 'POST',
		},
	};

	async validateCredentials(
		credentials: ICredentialDataDecryptedObject,
	): Promise<{
		isValid: boolean;
		errorMessage?: string;
	}> {
		try {
			if (typeof credentials.serviceAccountKey !== 'string') {
				return {
					isValid: false,
					errorMessage: 'Service Account Key is not a string',
				};
			}

			return validateFirebaseServiceAccountJson(credentials.serviceAccountKey);
		} catch (error: unknown) {
			return {
				isValid: false,
				errorMessage: error instanceof Error ? error.message : 'Unknown error',
			};
		}
	}

	/**
	 * Get the token manager instance
	 */
	public getTokenManager(): TokenManager {
		return TokenManager.getInstance();
	}
} 