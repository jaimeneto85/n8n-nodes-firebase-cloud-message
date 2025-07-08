import * as admin from 'firebase-admin';
import { IExecuteFunctions, INodeExecutionData, INodeParameters, INodeType, NodeOperationError } from 'n8n-workflow';
import { FirebaseCloudMessage } from '../../src/nodes/FirebaseCloudMessage/FirebaseCloudMessage.node';
import * as firebaseUtils from '../../src/utils/firebase.utils';

// Mock Firebase utils
jest.mock('../../src/utils/firebase.utils', () => {
	return {
		validateAndInitializeFirebase: jest.fn(),
		getMessaging: jest.fn(),
	};
});

// Mock IExecuteFunctions
const mockGetCredentials = jest.fn();
const mockGetInputData = jest.fn();
const mockGetNodeParameter = jest.fn();
const mockGetNode = jest.fn();
const mockLogger = {
	debug: jest.fn(),
	info: jest.fn(),
	warn: jest.fn(),
	error: jest.fn(),
};
const mockHelpers = {
	returnJsonArray: jest.fn(),
};

const mockExecuteFunctions = {
	getCredentials: mockGetCredentials,
	getInputData: mockGetInputData,
	getNodeParameter: mockGetNodeParameter,
	getNode: mockGetNode,
	logger: mockLogger,
	helpers: mockHelpers,
} as unknown as IExecuteFunctions;

describe('FirebaseCloudMessage Node', () => {
	let firebaseCloudMessage: FirebaseCloudMessage;
	
	beforeEach(() => {
		jest.clearAllMocks();
		firebaseCloudMessage = new FirebaseCloudMessage();
		
		// Mock getCredentials (default to OAuth2)
		mockGetCredentials.mockResolvedValue({
			authType: 'oauth2',
			projectId: 'test-project',
			clientId: 'test-client-id.apps.googleusercontent.com',
			clientSecret: 'test-client-secret',
			refreshToken: 'test-refresh-token',
		});
		
		// Mock getInputData
		mockGetInputData.mockReturnValue([{}]);
		
		// Mock getNodeParameter
		mockGetNodeParameter.mockImplementation((parameterName: string, itemIndex: number) => {
			if (parameterName === 'operation') {
				return 'sendToToken';
			}
			if (parameterName === 'jsonParameters') {
				return false;
			}
			if (parameterName === 'multipleTokens') {
				return false;
			}
					if (parameterName === 'deviceToken') {
			return 'c8KsTxDAT4eGtmQn6Hso_y:APA91bHq1_6VKF-FqBZWY7D0XjLm2sK9YN4Vp1J8kQX6S7LN3R8B_test_token_that_is_long_enough_to_pass_validation_with_colon';
		}
			if (parameterName === 'message.messageFields') {
				return {
					title: 'Test Title',
					body: 'Test Body',
				};
			}
			if (parameterName === 'messageType') {
				return 'notification';
			}
			return undefined;
		});
		
		// Mock getNode
		mockGetNode.mockReturnValue({
			name: 'Firebase Cloud Message',
			type: 'n8n-nodes-base.firebaseCloudMessage',
			typeVersion: 1,
			position: [0, 0],
		});
		
		// Mock validateAndInitializeFirebase
		(firebaseUtils.validateAndInitializeFirebase as jest.Mock).mockResolvedValue({
			name: 'test-app',
		});
		
		// Mock getMessaging
		(firebaseUtils.getMessaging as jest.Mock).mockReturnValue({
			send: jest.fn().mockResolvedValue('message-id'),
			sendMulticast: jest.fn().mockResolvedValue({ successCount: 1, failureCount: 0 }),
		});
	});
	
	describe('execute', () => {
		it('should initialize Firebase correctly with OAuth2', async () => {
			// Act
			await firebaseCloudMessage.execute.call(mockExecuteFunctions);
			
			// Assert
			expect(mockGetCredentials).toHaveBeenCalledWith('firebaseCloudMessageApi');
			expect(firebaseUtils.validateAndInitializeFirebase).toHaveBeenCalled();
			expect(mockLogger.info).toHaveBeenCalledWith('Firebase Cloud Messaging initialized successfully for project: test-project (auth: oauth2)');
		});

		it('should initialize Firebase correctly with Service Account', async () => {
			// Arrange - Override credentials for this test
			mockGetCredentials.mockResolvedValueOnce({
				authType: 'serviceAccount',
				serviceAccountKey: JSON.stringify({
					type: 'service_account',
					project_id: 'test-project-sa',
					private_key_id: 'key-id',
					private_key: '-----BEGIN PRIVATE KEY-----\ntest-key\n-----END PRIVATE KEY-----\n',
					client_email: 'test@test-project-sa.iam.gserviceaccount.com',
					client_id: 'client-id',
				}),
			});
			
			// Act
			await firebaseCloudMessage.execute.call(mockExecuteFunctions);
			
			// Assert
			expect(mockGetCredentials).toHaveBeenCalledWith('firebaseCloudMessageApi');
			expect(firebaseUtils.validateAndInitializeFirebase).toHaveBeenCalled();
			expect(mockLogger.info).toHaveBeenCalledWith('Firebase Cloud Messaging initialized successfully for project: test-project-sa (auth: serviceAccount)');
		});

		it('should default to OAuth2 when authType is not specified', async () => {
			// Arrange - Override credentials without authType
			mockGetCredentials.mockResolvedValueOnce({
				// No authType specified
				projectId: 'test-project-default',
				clientId: 'test-client-id.apps.googleusercontent.com',
				clientSecret: 'test-client-secret',
				refreshToken: 'test-refresh-token',
			});
			
			// Act
			await firebaseCloudMessage.execute.call(mockExecuteFunctions);
			
			// Assert
			expect(mockGetCredentials).toHaveBeenCalledWith('firebaseCloudMessageApi');
			expect(firebaseUtils.validateAndInitializeFirebase).toHaveBeenCalled();
			expect(mockLogger.info).toHaveBeenCalledWith('Firebase Cloud Messaging initialized successfully for project: test-project-default (auth: oauth2)');
		});
		
		it('should handle Firebase initialization errors', async () => {
			// Arrange
			(firebaseUtils.validateAndInitializeFirebase as jest.Mock).mockRejectedValue(new Error('Initialization failed'));
			
			// Act & Assert
			await expect(firebaseCloudMessage.execute.call(mockExecuteFunctions)).rejects.toThrow(NodeOperationError);
			expect(mockGetCredentials).toHaveBeenCalledWith('firebaseCloudMessageApi');
		});
		
		it('should use getMessaging utility for sending messages', async () => {
			// Act
			await firebaseCloudMessage.execute.call(mockExecuteFunctions);
			
			// Assert
			expect(firebaseUtils.getMessaging).toHaveBeenCalled();
			const messagingInstance = (firebaseUtils.getMessaging as jest.Mock).mock.results[0].value;
			expect(messagingInstance.send).toHaveBeenCalled();
		});
	});
});