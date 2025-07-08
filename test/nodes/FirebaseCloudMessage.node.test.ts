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
		
		// Mock getCredentials
		mockGetCredentials.mockResolvedValue({
			serviceAccountKey: JSON.stringify({
				type: 'service_account',
				project_id: 'test-project',
				private_key_id: 'key-id',
				private_key: '-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC7VJTUt9Us8cKj\nMzEfYyjiWA4R4/M2bS1GB4t7NXp98C3SC6dVMvDuictGeurT8jNbvJZHtCSuYEvu\nNMoSfm76oqFvAp8Gy0iz5sxjZmSnXyCdPEovGhLa0VzMaQ8s+CLOyS56YyCFGeJZ\n-----END PRIVATE KEY-----\n',
				client_email: 'test@test-project.gserviceaccount.com',
				client_id: 'client-id',
			}),
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
		it('should initialize Firebase correctly', async () => {
			// Act
			await firebaseCloudMessage.execute.call(mockExecuteFunctions);
			
			// Assert
			expect(mockGetCredentials).toHaveBeenCalledWith('firebaseCloudMessageApi');
			expect(firebaseUtils.validateAndInitializeFirebase).toHaveBeenCalled();
			expect(mockLogger.info).toHaveBeenCalledWith('Firebase Cloud Messaging initialized successfully for project: test-project');
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