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

		it('should include authType as first property', () => {
			const authTypeProperty = firebaseCredential.properties[0];
			expect(authTypeProperty.name).toBe('authType');
			expect(authTypeProperty.type).toBe('options');
			expect(authTypeProperty.default).toBe('oauth2');
		});

		it('should have OAuth2 properties with correct display options', () => {
			const oauthProperties = firebaseCredential.properties.filter(
				prop => prop.displayOptions?.show?.authType?.includes('oauth2')
			);
			expect(oauthProperties).toHaveLength(4); // projectId, clientId, clientSecret, refreshToken
			
			const propertyNames = oauthProperties.map(prop => prop.name);
			expect(propertyNames).toContain('projectId');
			expect(propertyNames).toContain('clientId');
			expect(propertyNames).toContain('clientSecret');
			expect(propertyNames).toContain('refreshToken');
		});

		it('should have service account property with correct display options', () => {
			const serviceAccountProperty = firebaseCredential.properties.find(
				prop => prop.name === 'serviceAccountKey'
			);
			expect(serviceAccountProperty).toBeDefined();
			expect(serviceAccountProperty?.displayOptions?.show?.authType).toContain('serviceAccount');
		});
	});

	describe('OAuth2 credential validation', () => {
		it('should validate valid OAuth2 credentials', async () => {
			const credentials = {
				authType: 'oauth2',
				projectId: 'test-project',
				clientId: '123456789.apps.googleusercontent.com',
				clientSecret: 'test-secret',
				refreshToken: 'test-refresh-token',
			};

			const result = await firebaseCredential.validateCredentials(credentials);
			expect(result.isValid).toBe(true);
		});

		it('should reject OAuth2 credentials with missing fields', async () => {
			const credentials = {
				authType: 'oauth2',
				projectId: 'test-project',
				// Missing clientId, clientSecret, refreshToken
			};

			const result = await firebaseCredential.validateCredentials(credentials);
			expect(result.isValid).toBe(false);
			expect(result.errorMessage).toContain('OAuth2 credentials incomplete');
		});

		it('should reject OAuth2 credentials with invalid client ID format', async () => {
			const credentials = {
				authType: 'oauth2',
				projectId: 'test-project',
				clientId: 'invalid-client-id',
				clientSecret: 'test-secret',
				refreshToken: 'test-refresh-token',
			};

			const result = await firebaseCredential.validateCredentials(credentials);
			expect(result.isValid).toBe(false);
			expect(result.errorMessage).toContain('Client ID format invalid');
		});

		it('should reject OAuth2 credentials with invalid project ID format', async () => {
			const credentials = {
				authType: 'oauth2',
				projectId: 'Invalid_Project_ID',
				clientId: '123456789.apps.googleusercontent.com',
				clientSecret: 'test-secret',
				refreshToken: 'test-refresh-token',
			};

			const result = await firebaseCredential.validateCredentials(credentials);
			expect(result.isValid).toBe(false);
			expect(result.errorMessage).toContain('Project ID format invalid');
		});
	});

	describe('Service Account credential validation', () => {
		it('should validate valid service account credentials', async () => {
			const serviceAccountJson = {
				type: 'service_account',
				project_id: 'test-project',
				private_key_id: 'key-id',
				private_key: '-----BEGIN PRIVATE KEY-----\ntest-key\n-----END PRIVATE KEY-----\n',
				client_email: 'test@test-project.iam.gserviceaccount.com',
				client_id: 'client-id',
			};

			const credentials = {
				authType: 'serviceAccount',
				serviceAccountKey: JSON.stringify(serviceAccountJson),
			};

			const result = await firebaseCredential.validateCredentials(credentials);
			expect(result.isValid).toBe(true);
		});

		it('should reject service account credentials with missing JSON', async () => {
			const credentials = {
				authType: 'serviceAccount',
				// Missing serviceAccountKey
			};

			const result = await firebaseCredential.validateCredentials(credentials);
			expect(result.isValid).toBe(false);
			expect(result.errorMessage).toContain('Service Account JSON é obrigatório');
		});

		it('should reject service account credentials with invalid JSON', async () => {
			const credentials = {
				authType: 'serviceAccount',
				serviceAccountKey: 'invalid-json',
			};

			const result = await firebaseCredential.validateCredentials(credentials);
			expect(result.isValid).toBe(false);
			expect(result.errorMessage).toContain('Validation error');
		});

		it('should reject service account credentials with missing required fields', async () => {
			const serviceAccountJson = {
				type: 'service_account',
				project_id: 'test-project',
				// Missing other required fields
			};

			const credentials = {
				authType: 'serviceAccount',
				serviceAccountKey: JSON.stringify(serviceAccountJson),
			};

			const result = await firebaseCredential.validateCredentials(credentials);
			expect(result.isValid).toBe(false);
			expect(result.errorMessage).toContain('JSON inválido. Campos obrigatórios ausentes');
		});

		it('should reject credentials with wrong type', async () => {
			const serviceAccountJson = {
				type: 'user_account', // Wrong type
				project_id: 'test-project',
				private_key_id: 'key-id',
				private_key: '-----BEGIN PRIVATE KEY-----\ntest-key\n-----END PRIVATE KEY-----\n',
				client_email: 'test@test-project.iam.gserviceaccount.com',
				client_id: 'client-id',
			};

			const credentials = {
				authType: 'serviceAccount',
				serviceAccountKey: JSON.stringify(serviceAccountJson),
			};

			const result = await firebaseCredential.validateCredentials(credentials);
			expect(result.isValid).toBe(false);
			expect(result.errorMessage).toContain('Tipo de credencial inválido');
		});
	});

	describe('default behavior', () => {
		it('should default to OAuth2 when authType is not specified', async () => {
			const credentials = {
				// No authType specified, should default to oauth2
				projectId: 'test-project',
				clientId: '123456789.apps.googleusercontent.com',
				clientSecret: 'test-secret',
				refreshToken: 'test-refresh-token',
			};

			const result = await firebaseCredential.validateCredentials(credentials);
			expect(result.isValid).toBe(true);
		});
	});
}); 