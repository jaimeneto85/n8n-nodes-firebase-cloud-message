import * as admin from 'firebase-admin';
import { ICredentialDataDecryptedObject } from 'n8n-workflow';
import { initializeFirebase, validateAndInitializeFirebase } from '../../src/utils/firebase.utils';

// Mock Firebase Admin SDK
jest.mock('firebase-admin', () => {
	const mockApp = {
		name: 'test-app',
	};
	
	return {
		app: jest.fn().mockImplementation((name) => {
			if (name === 'valid-project-id') {
				return mockApp;
			}
			throw new Error('App not found');
		}),
		initializeApp: jest.fn().mockReturnValue(mockApp),
		credential: {
			cert: jest.fn().mockReturnValue({ type: 'service_account' }),
		},
		messaging: jest.fn().mockReturnValue({
			send: jest.fn().mockResolvedValue('message-id'),
			sendMulticast: jest.fn().mockResolvedValue({ successCount: 1, failureCount: 0 }),
			subscribeToTopic: jest.fn().mockResolvedValue({ successCount: 1, failureCount: 0 }),
			unsubscribeFromTopic: jest.fn().mockResolvedValue({ successCount: 1, failureCount: 0 }),
		}),
	};
});

describe('Firebase Utils', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe('initializeFirebase', () => {
		it('should return existing app if already initialized', async () => {
			// Arrange
			const credentials: ICredentialDataDecryptedObject = {
				serviceAccountKey: JSON.stringify({
					type: 'service_account',
					project_id: 'valid-project-id',
					private_key_id: 'key-id',
					private_key: '-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC7VJTUt9Us8cKj\nMzEfYyjiWA4R4/M2bS1GB4t7NXp98C3SC6dVMvDuictGeurT8jNbvJZHtCSuYEvu\nNMoSfm76oqFvAp8Gy0iz5sxjZmSnXyCdPEovGhLa0VzMaQ8s+CLOyS56YyCFGeJZ\n-----END PRIVATE KEY-----\n',
					client_email: 'test@valid-project-id.gserviceaccount.com',
					client_id: 'client-id',
				}),
			};

			// Act
			const result = await initializeFirebase(credentials);

			// Assert
			expect(admin.app).toHaveBeenCalledWith('valid-project-id');
			expect(admin.initializeApp).not.toHaveBeenCalled();
			expect(result).toBeDefined();
		});

		it('should initialize new app if not already initialized', async () => {
			// Arrange
			const credentials: ICredentialDataDecryptedObject = {
				serviceAccountKey: JSON.stringify({
					type: 'service_account',
					project_id: 'new-project-id',
					private_key_id: 'key-id',
					private_key: '-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC7VJTUt9Us8cKj\nMzEfYyjiWA4R4/M2bS1GB4t7NXp98C3SC6dVMvDuictGeurT8jNbvJZHtCSuYEvu\nNMoSfm76oqFvAp8Gy0iz5sxjZmSnXyCdPEovGhLa0VzMaQ8s+CLOyS56YyCFGeJZ\n-----END PRIVATE KEY-----\n',
					client_email: 'test@new-project-id.gserviceaccount.com',
					client_id: 'client-id',
				}),
				databaseURL: 'https://new-project-id.firebaseio.com',
				storageBucket: 'new-project-id.appspot.com',
			};

			// Mock app method to throw error for new project
			(admin.app as jest.Mock).mockImplementation((name) => {
				if (name === 'valid-project-id') {
					return { name: 'test-app' };
				}
				throw new Error('App not found');
			});

			// Act
			const result = await initializeFirebase(credentials);

			// Assert
			expect(admin.app).toHaveBeenCalledWith('new-project-id');
			expect(admin.initializeApp).toHaveBeenCalledWith(
				{
					credential: expect.anything(),
					databaseURL: 'https://new-project-id.firebaseio.com',
					storageBucket: 'new-project-id.appspot.com',
				},
				'new-project-id',
			);
			expect(result).toBeDefined();
		});

		it('should throw error if service account key is invalid JSON', async () => {
			// Arrange
			const credentials: ICredentialDataDecryptedObject = {
				serviceAccountKey: 'invalid-json',
			};

			// Act & Assert
			await expect(initializeFirebase(credentials)).rejects.toThrow('Failed to initialize Firebase');
		});
	});

	describe('validateAndInitializeFirebase', () => {
		it('should validate and initialize Firebase with valid credentials', async () => {
			// Arrange
			const credentials: ICredentialDataDecryptedObject = {
				serviceAccountKey: JSON.stringify({
					type: 'service_account',
					project_id: 'valid-project-id',
					private_key_id: 'key-id',
					private_key: '-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC7VJTUt9Us8cKj\nMzEfYyjiWA4R4/M2bS1GB4t7NXp98C3SC6dVMvDuictGeurT8jNbvJZHtCSuYEvu\nNMoSfm76oqFvAp8Gy0iz5sxjZmSnXyCdPEovGhLa0VzMaQ8s+CLOyS56YyCFGeJZ\n-----END PRIVATE KEY-----\n',
					client_email: 'test@valid-project-id.gserviceaccount.com',
					client_id: 'client-id',
				}),
			};

			// Act
			const result = await validateAndInitializeFirebase(credentials);

			// Assert
			expect(result).toBeDefined();
		});

		it('should throw error if service account key is missing', async () => {
			// Arrange
			const credentials: ICredentialDataDecryptedObject = {};

			// Act & Assert
			await expect(validateAndInitializeFirebase(credentials)).rejects.toThrow('Service Account Key is required');
		});

		it('should throw error if required fields are missing', async () => {
			// Arrange
			const credentials: ICredentialDataDecryptedObject = {
				serviceAccountKey: JSON.stringify({
					type: 'service_account',
					// Missing required fields
				}),
			};

			// Act & Assert
			await expect(validateAndInitializeFirebase(credentials)).rejects.toThrow('Service Account JSON is missing required fields');
		});

		it('should throw error if credential type is not service_account', async () => {
			// Arrange
			const credentials: ICredentialDataDecryptedObject = {
				serviceAccountKey: JSON.stringify({
					type: 'not_service_account',
					project_id: 'valid-project-id',
					private_key_id: 'key-id',
					private_key: '-----BEGIN PRIVATE KEY-----\nkey-content\n-----END PRIVATE KEY-----\n',
					client_email: 'test@valid-project-id.gserviceaccount.com',
					client_id: 'client-id',
				}),
			};

			// Act & Assert
			await expect(validateAndInitializeFirebase(credentials)).rejects.toThrow('Invalid credential type');
		});
	});
}); 