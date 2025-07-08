import { FirebaseCloudMessageApi } from '../../src/credentials/FirebaseCloudMessageApi.credentials';

// Mock data for testing
const validServiceAccountJson = JSON.stringify({
  type: 'service_account',
  project_id: 'test-project',
  private_key_id: 'key123',
  private_key: '-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC7VJTUt9Us8cKj\nMzEfYyjiWA4R4/M2bS1GB4t7NXp98C3SC6dVMvDuictGeurT8jNbvJZHtCSuYEvu\nNMoSfm76oqFvAp8Gy0iz5sxjZmSnXyCdPEovGhLa0VzMaQ8s+CLOyS56YyCFGeJZ\n-----END PRIVATE KEY-----\n',
  client_email: 'firebase-adminsdk-test@test-project.iam.gserviceaccount.com',
  client_id: '123456789',
  auth_uri: 'https://accounts.google.com/o/oauth2/auth',
  token_uri: 'https://oauth2.googleapis.com/token',
  auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
  client_x509_cert_url: 'https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-test%40test-project.iam.gserviceaccount.com'
});

const invalidTypeServiceAccountJson = JSON.stringify({
  type: 'invalid_type',
  project_id: 'test-project',
  private_key_id: 'key123',
  private_key: '-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC7VJTUt9Us8cKj\nMzEfYyjiWA4R4/M2bS1GB4t7NXp98C3SC6dVMvDuictGeurT8jNbvJZHtCSuYEvu\nNMoSfm76oqFvAp8Gy0iz5sxjZmSnXyCdPEovGhLa0VzMaQ8s+CLOyS56YyCFGeJZ\n-----END PRIVATE KEY-----\n',
  client_email: 'firebase-adminsdk-test@test-project.iam.gserviceaccount.com',
  client_id: '123456789'
});

const missingFieldsServiceAccountJson = JSON.stringify({
  type: 'service_account',
  project_id: 'test-project',
  // Missing private_key_id and private_key
  client_email: 'firebase-adminsdk-test@test-project.iam.gserviceaccount.com',
  client_id: '123456789'
});

const invalidPrivateKeyServiceAccountJson = JSON.stringify({
  type: 'service_account',
  project_id: 'test-project',
  private_key_id: 'key123',
  private_key: 'not-a-valid-private-key',
  client_email: 'firebase-adminsdk-test@test-project.iam.gserviceaccount.com',
  client_id: '123456789'
});

const invalidEmailServiceAccountJson = JSON.stringify({
  type: 'service_account',
  project_id: 'test-project',
  private_key_id: 'key123',
  private_key: '-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC7VJTUt9Us8cKj\nMzEfYyjiWA4R4/M2bS1GB4t7NXp98C3SC6dVMvDuictGeurT8jNbvJZHtCSuYEvu\nNMoSfm76oqFvAp8Gy0iz5sxjZmSnXyCdPEovGhLa0VzMaQ8s+CLOyS56YyCFGeJZ\n-----END PRIVATE KEY-----\n',
  client_email: 'invalid-email@example.com',
  client_id: '123456789'
});

describe('FirebaseCloudMessageApi', () => {
	let firebaseCredential: FirebaseCloudMessageApi;

	beforeEach(() => {
		firebaseCredential = new FirebaseCloudMessageApi();
	});

	describe('credential properties', () => {
		it('should have correct name and display name', () => {
			expect(firebaseCredential.name).toBe('firebaseCloudMessageApi');
			expect(firebaseCredential.displayName).toBe('Firebase Cloud Message API');
		});

		it('should have required properties defined', () => {
			expect(firebaseCredential.properties).toBeDefined();
			expect(Array.isArray(firebaseCredential.properties)).toBe(true);
			expect(firebaseCredential.properties.length).toBeGreaterThan(0);
		});

		it('should have serviceAccountKey as required field', () => {
			const serviceAccountKeyField = firebaseCredential.properties.find(
				prop => prop.name === 'serviceAccountKey',
			);
			expect(serviceAccountKeyField).toBeDefined();
			expect(serviceAccountKeyField?.required).toBe(true);
		});
	});

	describe('validateCredentials', () => {
		it('should return valid for correct service account JSON', async () => {
			const validServiceAccount = JSON.stringify({
				type: 'service_account',
				project_id: 'test-project',
				private_key_id: 'key-id',
				private_key: '-----BEGIN PRIVATE KEY-----\ntest-private-key\n-----END PRIVATE KEY-----\n',
				client_email: 'test@test-project.iam.gserviceaccount.com',
				client_id: 'client-id',
			});

			const credentials = {
				serviceAccountKey: validServiceAccount,
			};

			const result = await firebaseCredential.validateCredentials(credentials);
			expect(result.isValid).toBe(true);
		});

		it('should return invalid for missing serviceAccountKey', async () => {
			const credentials = {};

			const result = await firebaseCredential.validateCredentials(credentials);
			expect(result.isValid).toBe(false);
			expect(result.errorMessage).toBe('Service Account JSON é obrigatório');
		});

		it('should return invalid for malformed JSON', async () => {
			const credentials = {
				serviceAccountKey: 'invalid-json',
			};

			const result = await firebaseCredential.validateCredentials(credentials);
			expect(result.isValid).toBe(false);
			expect(result.errorMessage).toContain('JSON inválido');
		});

		it('should return invalid for missing required fields', async () => {
			const invalidServiceAccount = JSON.stringify({
				type: 'service_account',
				project_id: 'test-project',
				// Missing other required fields
			});

			const credentials = {
				serviceAccountKey: invalidServiceAccount,
			};

			const result = await firebaseCredential.validateCredentials(credentials);
			expect(result.isValid).toBe(false);
			expect(result.errorMessage).toContain('Campos obrigatórios ausentes');
		});

		it('should return invalid for wrong credential type', async () => {
			const invalidServiceAccount = JSON.stringify({
				type: 'user_account', // Wrong type
				project_id: 'test-project',
				private_key_id: 'key-id',
				private_key: '-----BEGIN PRIVATE KEY-----\ntest-private-key\n-----END PRIVATE KEY-----\n',
				client_email: 'test@test-project.iam.gserviceaccount.com',
				client_id: 'client-id',
			});

			const credentials = {
				serviceAccountKey: invalidServiceAccount,
			};

			const result = await firebaseCredential.validateCredentials(credentials);
			expect(result.isValid).toBe(false);
			expect(result.errorMessage).toBe('Tipo de credencial inválido. Deve ser "service_account"');
		});

		it('should return invalid for invalid private key format', async () => {
			const invalidServiceAccount = JSON.stringify({
				type: 'service_account',
				project_id: 'test-project',
				private_key_id: 'key-id',
				private_key: 'invalid-private-key', // Invalid format
				client_email: 'test@test-project.iam.gserviceaccount.com',
				client_id: 'client-id',
			});

			const credentials = {
				serviceAccountKey: invalidServiceAccount,
			};

			const result = await firebaseCredential.validateCredentials(credentials);
			expect(result.isValid).toBe(false);
			expect(result.errorMessage).toBe('Formato de chave privada inválido');
		});

		it('should return invalid for invalid client email', async () => {
			const invalidServiceAccount = JSON.stringify({
				type: 'service_account',
				project_id: 'test-project',
				private_key_id: 'key-id',
				private_key: '-----BEGIN PRIVATE KEY-----\ntest-private-key\n-----END PRIVATE KEY-----\n',
				client_email: 'invalid-email@example.com', // Wrong format
				client_id: 'client-id',
			});

			const credentials = {
				serviceAccountKey: invalidServiceAccount,
			};

			const result = await firebaseCredential.validateCredentials(credentials);
			expect(result.isValid).toBe(false);
			expect(result.errorMessage).toBe('Email do cliente inválido. Deve terminar com .iam.gserviceaccount.com');
		});
	});
}); 