import * as admin from 'firebase-admin';
import { ICredentialDataDecryptedObject } from 'n8n-workflow';
import { initializeFirebase, validateAndInitializeFirebase, getMessaging } from '../../src/utils/firebase.utils';

// Mock Firebase Admin modules
jest.mock('firebase-admin', () => {
	// Create mock implementations
	const appMock = {
		name: 'test-app',
	};
	
	const messagingMock = {
		send: jest.fn(),
	};
	
	return {
		app: jest.fn((name) => {
			if (name === 'valid-project-id') {
				return appMock;
			} else if (name === 'throw-error') {
				throw new Error('App not found');
			} else {
				throw new Error(`App named ${name} does not exist`);
			}
		}),
		initializeApp: jest.fn((options, name) => {
			if (name === 'error-project-id') {
				throw new Error('Failed to initialize app');
			}
			return appMock;
		}),
		credential: {
			cert: jest.fn((serviceAccount) => serviceAccount),
		},
		messaging: jest.fn(() => messagingMock),
	};
});

describe('Firebase Utilities', () => {
	// Reset mocks before each test
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe('initializeFirebase', () => {
		it('should return existing app if already initialized', async () => {
			const credentials = {
				serviceAccountKey: JSON.stringify({
					project_id: 'valid-project-id',
					private_key: 'private-key',
					client_email: 'email@example.com',
				}),
			};

			const app = await initializeFirebase(credentials);
			expect(app).toBeDefined();
			expect(admin.app).toHaveBeenCalledWith('valid-project-id');
			expect(admin.initializeApp).not.toHaveBeenCalled();
		});

		it('should initialize new app if not already initialized', async () => {
			const credentials = {
				serviceAccountKey: JSON.stringify({
					project_id: 'new-project-id',
					private_key: 'private-key',
					client_email: 'email@example.com',
				}),
			};

			const app = await initializeFirebase(credentials);
			expect(app).toBeDefined();
			expect(admin.app).toHaveBeenCalledWith('new-project-id');
			expect(admin.initializeApp).toHaveBeenCalledWith(
				{
					credential: expect.anything(),
				},
				'new-project-id'
			);
		});

		it('should throw error if initialization fails', async () => {
			const credentials = {
				serviceAccountKey: 'invalid-json',
			};

			await expect(initializeFirebase(credentials)).rejects.toThrow(
				'Failed to initialize Firebase:'
			);
		});
	});

	describe('validateAndInitializeFirebase', () => {
		it('should validate and initialize firebase with valid credentials', async () => {
			const credentials = {
				serviceAccountKey: JSON.stringify({
					type: 'service_account',
					project_id: 'valid-project-id',
					private_key_id: 'key-id',
					private_key: 'private-key',
					client_email: 'email@example.com',
					client_id: 'client-id',
				}),
			};

			const app = await validateAndInitializeFirebase(credentials);
			expect(app).toBeDefined();
		});

		it('should throw error if serviceAccountKey is missing', async () => {
			const credentials = {};

			await expect(validateAndInitializeFirebase(credentials)).rejects.toThrow(
				'Service Account JSON é obrigatório'
			);
		});

		it('should throw error if serviceAccountKey is invalid JSON', async () => {
			const credentials = {
				serviceAccountKey: 'invalid-json',
			};

			await expect(validateAndInitializeFirebase(credentials)).rejects.toThrow(
				'Formato JSON inválido. Verifique se o JSON está correto'
			);
		});

		it('should throw error if required fields are missing', async () => {
			const credentials = {
				serviceAccountKey: JSON.stringify({
					type: 'service_account',
					project_id: 'test-project',
					// Missing other required fields
				}),
			};

			await expect(validateAndInitializeFirebase(credentials)).rejects.toThrow(
				'Service Account JSON inválido. Campos obrigatórios ausentes'
			);
		});

		it('should throw error if credential type is not service_account', async () => {
			const credentials = {
				serviceAccountKey: JSON.stringify({
					type: 'not_service_account',
					project_id: 'test-project',
					private_key_id: 'key-id',
					private_key: 'private-key',
					client_email: 'email@example.com',
					client_id: 'client-id',
				}),
			};

			await expect(validateAndInitializeFirebase(credentials)).rejects.toThrow(
				'Tipo de credencial inválido. Deve ser "service_account"'
			);
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

		it('should throw error when messaging fails', () => {
			jest.spyOn(admin, 'messaging').mockImplementationOnce(() => {
				throw new Error('Messaging error');
			});

			expect(() => getMessaging()).toThrow(
				'Failed to get Firebase messaging instance: Messaging error'
			);
		});
	});
}); 