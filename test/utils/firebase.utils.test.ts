import * as admin from 'firebase-admin';
import { ICredentialDataDecryptedObject } from 'n8n-workflow';
import { initializeFirebase, validateAndInitializeFirebase, getMessaging, clearTokenCache } from '../../src/utils/firebase.utils';

// Mock Firebase Admin modules
jest.mock('firebase-admin', () => {
	const appMock = {
		name: 'test-app',
	};
	
	const messagingMock = {
		send: jest.fn(),
	};
	
	return {
		    app: jest.fn((name) => {
      // Always throw "does not exist" to force initialization
      throw new Error(`App named ${name} does not exist`);
    }),
		initializeApp: jest.fn((options, name) => {
			return appMock;
		}),
		credential: {
			cert: jest.fn((serviceAccount) => serviceAccount),
			refreshToken: jest.fn((oauth2Credential) => oauth2Credential),
		},
		messaging: jest.fn(() => messagingMock),
	};
});

// Mock global fetch for OAuth2 token requests
global.fetch = jest.fn();

// Mock Google Auth Library
jest.mock('google-auth-library', () => ({
	GoogleAuth: jest.fn(() => ({
		getClient: jest.fn(() => ({
			getAccessToken: jest.fn(() => ({ token: 'mock-access-token' })),
		})),
	})),
}));

describe('Firebase Utilities', () => {
	// Reset mocks before each test
	beforeEach(() => {
		jest.clearAllMocks();
		clearTokenCache();
		
		// Setup default fetch mock for OAuth2
		(global.fetch as jest.Mock).mockResolvedValue({
			ok: true,
			json: async () => ({
				access_token: 'mock-access-token',
				expires_in: 3600,
			}),
			text: async () => 'success',
		});
	});

	describe('Credential Validation', () => {
		describe('OAuth2 credentials', () => {
			it('should accept valid OAuth2 credentials', async () => {
				const credentials = {
					authType: 'oauth2',
					projectId: 'test-project',
					clientId: 'test-client-id.apps.googleusercontent.com',
					clientSecret: 'test-client-secret',
					refreshToken: 'test-refresh-token',
				};

				// Should not throw when all required fields are present
				await expect(validateAndInitializeFirebase(credentials)).resolves.toBeDefined();
			});

			it('should reject OAuth2 credentials with missing fields', async () => {
				const credentials = {
					authType: 'oauth2',
					projectId: 'test-project',
					// Missing clientId, clientSecret, refreshToken
				};

				await expect(validateAndInitializeFirebase(credentials)).rejects.toThrow(
					'OAuth2 credentials incomplete'
				);
			});

			it('should default to OAuth2 when authType is not specified', async () => {
				const credentials = {
					// No authType specified
					projectId: 'test-project',
					clientId: 'test-client-id.apps.googleusercontent.com',
					clientSecret: 'test-client-secret',
					refreshToken: 'test-refresh-token',
				};

				await expect(validateAndInitializeFirebase(credentials)).resolves.toBeDefined();
			});
		});

		describe('Service Account credentials', () => {
			it('should accept valid service account credentials', async () => {
				const credentials = {
					authType: 'serviceAccount',
					serviceAccountKey: JSON.stringify({
						type: 'service_account',
						project_id: 'test-project',
						private_key_id: 'key-id',
						private_key: 'private-key',
						client_email: 'email@example.com',
						client_id: 'client-id',
					}),
				};

				await expect(validateAndInitializeFirebase(credentials)).resolves.toBeDefined();
			});

			it('should reject service account credentials with missing JSON', async () => {
				const credentials = {
					authType: 'serviceAccount',
				};

				await expect(validateAndInitializeFirebase(credentials)).rejects.toThrow(
					'Service Account JSON é obrigatório'
				);
			});

			it('should reject service account credentials with invalid JSON', async () => {
				const credentials = {
					authType: 'serviceAccount',
					serviceAccountKey: 'invalid-json',
				};

				await expect(validateAndInitializeFirebase(credentials)).rejects.toThrow(
					'Formato JSON inválido'
				);
			});

			it('should reject service account credentials with missing required fields', async () => {
				const credentials = {
					authType: 'serviceAccount',
					serviceAccountKey: JSON.stringify({
						type: 'service_account',
						project_id: 'test-project',
						// Missing other required fields
					}),
				};

				await expect(validateAndInitializeFirebase(credentials)).rejects.toThrow(
					'Service Account JSON inválido'
				);
			});

			it('should reject credentials with wrong type', async () => {
				const credentials = {
					authType: 'serviceAccount',
					serviceAccountKey: JSON.stringify({
						type: 'user_account', // Wrong type
						project_id: 'test-project',
						private_key_id: 'key-id',
						private_key: 'private-key',
						client_email: 'email@example.com',
						client_id: 'client-id',
					}),
				};

				await expect(validateAndInitializeFirebase(credentials)).rejects.toThrow(
					'Tipo de credencial inválido'
				);
			});
		});
	});

	describe('Firebase App Initialization', () => {
		it('should initialize Firebase app with OAuth2', async () => {
			const credentials = {
				authType: 'oauth2',
				projectId: 'test-project',
				clientId: 'test-client-id.apps.googleusercontent.com',
				clientSecret: 'test-client-secret',
				refreshToken: 'test-refresh-token',
			};

			const app = await initializeFirebase(credentials);
			expect(app).toBeDefined();
			expect(admin.initializeApp).toHaveBeenCalled();
		});

		it('should initialize Firebase app with Service Account', async () => {
			const credentials = {
				authType: 'serviceAccount',
				serviceAccountKey: JSON.stringify({
					type: 'service_account',
					project_id: 'test-project',
					private_key_id: 'key-id',
					private_key: 'private-key',
					client_email: 'email@example.com',
					client_id: 'client-id',
				}),
			};

			const app = await initializeFirebase(credentials);
			expect(app).toBeDefined();
			expect(admin.credential.cert).toHaveBeenCalled();
			expect(admin.initializeApp).toHaveBeenCalled();
		});

		it('should return existing app if already initialized', async () => {
			// Temporarily change mock to return existing app
			(admin.app as jest.Mock).mockImplementationOnce((name) => {
				return { name: 'existing-app' };
			});

			const credentials = {
				authType: 'oauth2',
				projectId: 'test-project',
				clientId: 'test-client-id.apps.googleusercontent.com',
				clientSecret: 'test-client-secret',
				refreshToken: 'test-refresh-token',
			};

			const app = await initializeFirebase(credentials);
			expect(app).toBeDefined();
			expect(admin.app).toHaveBeenCalledWith('oauth2-test-project');
			// initializeApp should NOT be called when app already exists
			expect(admin.initializeApp).not.toHaveBeenCalled();
		});
	});

	describe('getMessaging', () => {
		it('should return messaging instance with provided app', () => {
			const app = { name: 'test-app' } as admin.app.App;
			const messaging = getMessaging(app);
			
			expect(messaging).toBeDefined();
			expect(admin.messaging).toHaveBeenCalledWith(app);
		});

		it('should return default messaging instance when no app provided', () => {
			const messaging = getMessaging();
			
			expect(messaging).toBeDefined();
			expect(admin.messaging).toHaveBeenCalledWith();
		});
	});

	describe('Utility functions', () => {
		it('should clear token cache', () => {
			expect(() => clearTokenCache()).not.toThrow();
		});
	});
}); 