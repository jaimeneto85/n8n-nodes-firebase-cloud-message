import {
	IAuthenticateGeneric,
	ICredentialDataDecryptedObject,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

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
} 