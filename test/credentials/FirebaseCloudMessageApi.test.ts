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

describe('FirebaseCloudMessageApi Credential Tests', () => {
  let firebaseCredential: FirebaseCloudMessageApi;

  beforeEach(() => {
    firebaseCredential = new FirebaseCloudMessageApi();
  });

  describe('validateCredentials', () => {
    it('should validate valid service account JSON', async () => {
      const result = await firebaseCredential.validateCredentials({
        serviceAccountKey: validServiceAccountJson,
      });

      expect(result.isValid).toBe(true);
      expect(result.errorMessage).toBeUndefined();
    });

    it('should reject non-string service account key', async () => {
      const result = await firebaseCredential.validateCredentials({
        serviceAccountKey: 123 as any,
      });

      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBe('Service Account Key is not a string');
    });

    it('should reject invalid JSON format', async () => {
      const result = await firebaseCredential.validateCredentials({
        serviceAccountKey: 'not-valid-json',
      });

      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBeDefined();
    });

    it('should reject service account with missing fields', async () => {
      const result = await firebaseCredential.validateCredentials({
        serviceAccountKey: missingFieldsServiceAccountJson,
      });

      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toContain('missing required fields');
    });

    it('should reject service account with invalid type', async () => {
      const result = await firebaseCredential.validateCredentials({
        serviceAccountKey: invalidTypeServiceAccountJson,
      });

      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBe('Invalid credential type. Must be a service_account.');
    });

    it('should reject service account with invalid private key format', async () => {
      const result = await firebaseCredential.validateCredentials({
        serviceAccountKey: invalidPrivateKeyServiceAccountJson,
      });

      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBe('Invalid private key format.');
    });

    it('should reject service account with invalid email format', async () => {
      const result = await firebaseCredential.validateCredentials({
        serviceAccountKey: invalidEmailServiceAccountJson,
      });

      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBe('Invalid client email format. Should end with .gserviceaccount.com');
    });
  });

  describe('TokenManager', () => {
    it('should return the same instance when getInstance is called multiple times', () => {
      const tokenManager1 = firebaseCredential.getTokenManager();
      const tokenManager2 = firebaseCredential.getTokenManager();
      
      expect(tokenManager1).toBe(tokenManager2);
    });

    it('should cache tokens and return cached token if not expired', async () => {
      const tokenManager = firebaseCredential.getTokenManager();
      const projectId = 'test-project';
      const generateTokenFn = jest.fn().mockResolvedValue('test-token');
      
      // First call should generate a new token
      const token1 = await tokenManager.getToken(projectId, generateTokenFn);
      expect(generateTokenFn).toHaveBeenCalledTimes(1);
      expect(token1).toBe('test-token');
      
      // Second call should use cached token
      const token2 = await tokenManager.getToken(projectId, generateTokenFn);
      expect(generateTokenFn).toHaveBeenCalledTimes(1); // Still just one call
      expect(token2).toBe('test-token');
    });

    it('should have retry mechanism for token generation', () => {
      const tokenManager = firebaseCredential.getTokenManager();
      
      // Verificar se o TokenManager tem as propriedades e métodos esperados
      expect(tokenManager).toBeDefined();
      expect((tokenManager as any).MAX_RETRY_ATTEMPTS).toBeDefined();
      expect((tokenManager as any).REFRESH_BUFFER_MS).toBeDefined();
      expect((tokenManager as any).TOKEN_EXPIRY_MS).toBeDefined();
      expect((tokenManager as any).tokenCache).toBeDefined();
      expect((tokenManager as any).refreshTimers).toBeDefined();
      expect((tokenManager as any).retryAttempts).toBeDefined();
    });
    
    it('should support multiple projects', async () => {
      const tokenManager = firebaseCredential.getTokenManager();
      const projectIds = ['project-1', 'project-2'];
      
      const generateTokenFn = jest.fn((projectId) => {
        return Promise.resolve(`token-for-${projectId}`);
      });
      
      await tokenManager.initializeProjects(projectIds, generateTokenFn);
      
      expect(generateTokenFn).toHaveBeenCalledTimes(2);
      
      // Verify tokens are cached per project
      const token1 = await tokenManager.getToken('project-1', () => Promise.resolve('should-not-be-called'));
      const token2 = await tokenManager.getToken('project-2', () => Promise.resolve('should-not-be-called'));
      
      expect(token1).toBe('token-for-project-1');
      expect(token2).toBe('token-for-project-2');
    });
    
    it('should clean up expired tokens', async () => {
      const tokenManager = firebaseCredential.getTokenManager();
      
      // Mock the token cache with an expired token
      const expiredToken = {
        token: 'expired-token',
        expiry: Date.now() - 1000 // Expired 1 second ago
      };
      
      // Use private property access for testing
      const tokenCache = (tokenManager as any).tokenCache;
      tokenCache.set('expired-project', expiredToken);
      
      // Clean up expired tokens
      tokenManager.cleanupExpiredTokens();
      
      // Verify expired token was removed
      expect(tokenCache.has('expired-project')).toBe(false);
    });
  });
  
  describe('Credential Properties', () => {
    it('should have the correct credential name and display name', () => {
      expect(firebaseCredential.name).toBe('firebaseCloudMessageApi');
      expect(firebaseCredential.displayName).toBe('Firebase Cloud Message API');
    });
    
    it('should have the correct documentation URL', () => {
      expect(firebaseCredential.documentationUrl).toBe('https://firebase.google.com/docs/cloud-messaging');
    });
    
    it('should have the required credential properties', () => {
      const properties = firebaseCredential.properties;
      
      // Check for required properties
      const serviceAccountKeyProp = properties.find(p => p.name === 'serviceAccountKey');
      expect(serviceAccountKeyProp).toBeDefined();
      expect(serviceAccountKeyProp?.required).toBe(true);
      
      // Check for optional properties
      const databaseURLProp = properties.find(p => p.name === 'databaseURL');
      expect(databaseURLProp).toBeDefined();
      expect(databaseURLProp?.required).toBe(false);
      
      const storageBucketProp = properties.find(p => p.name === 'storageBucket');
      expect(storageBucketProp).toBeDefined();
      expect(storageBucketProp?.required).toBe(false);
      
      const regionProp = properties.find(p => p.name === 'region');
      expect(regionProp).toBeDefined();
      expect(regionProp?.required).toBe(false);
      
      // Check for token caching properties
      const enableTokenCachingProp = properties.find(p => p.name === 'enableTokenCaching');
      expect(enableTokenCachingProp).toBeDefined();
      expect(enableTokenCachingProp?.default).toBe(true);
      
      const tokenRefreshBufferProp = properties.find(p => p.name === 'tokenRefreshBuffer');
      expect(tokenRefreshBufferProp).toBeDefined();
      expect(tokenRefreshBufferProp?.default).toBe(5);
    });
  });
}); 