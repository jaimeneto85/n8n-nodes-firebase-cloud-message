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
const mockExecuteFunctions = {
	getCredentials: jest.fn().mockResolvedValue({
		serviceAccountKey: JSON.stringify({
			type: 'service_account',
			project_id: 'test-project',
			private_key_id: 'key-id',
			private_key: '-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC7VJTUt9Us8cKj\nMzEfYyjiWA4R4/M2bS1GB4t7NXp98C3SC6dVMvDuictGeurT8jNbvJZHtCSuYEvu\nNMoSfm76oqFvAp8Gy0iz5sxjZmSnXyCdPEovGhLa0VzMaQ8s+CLOyS56YyCFGeJZ\n-----END PRIVATE KEY-----\n',
			client_email: 'test@test-project.gserviceaccount.com',
			client_id: 'client-id',
		}),
		enableTokenCaching: true,
	}),
	getInputData: jest.fn().mockReturnValue([{}]),
	getNodeParameter: jest.fn().mockImplementation((parameterName: string, itemIndex: number) => {
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
			return 'test-token';
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
	}),
	getNode: jest.fn().mockReturnValue({
		name: 'Firebase Cloud Message',
		type: 'n8n-nodes-base.firebaseCloudMessage',
		typeVersion: 1,
		position: [0, 0],
	}),
	logger: {
		debug: jest.fn(),
		info: jest.fn(),
		warn: jest.fn(),
		error: jest.fn(),
	},
	helpers: {
		returnJsonArray: jest.fn(),
	},
} as unknown as IExecuteFunctions;

describe('FirebaseCloudMessage Node', () => {
	let firebaseCloudMessage: FirebaseCloudMessage;
	
	beforeEach(() => {
		jest.clearAllMocks();
		firebaseCloudMessage = new FirebaseCloudMessage();
		
		// Mock getCredentials
		mockExecuteFunctions.getCredentials.mockResolvedValue({
			serviceAccountKey: JSON.stringify({
				type: 'service_account',
				project_id: 'test-project',
				private_key_id: 'key-id',
				private_key: '-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC7VJTUt9Us8cKj\nMzEfYyjiWA4R4/M2bS1GB4t7NXp98C3SC6dVMvDuictGeurT8jNbvJZHtCSuYEvu\nNMoSfm76oqFvAp8Gy0iz5sxjZmSnXyCdPEovGhLa0VzMaQ8s+CLOyS56YyCFGeJZ\n-----END PRIVATE KEY-----\n',
				client_email: 'test@test-project.gserviceaccount.com',
				client_id: 'client-id',
			}),
			enableTokenCaching: true,
		});
		
		// Mock getInputData
		mockExecuteFunctions.getInputData.mockReturnValue([{}]);
		
		// Mock getNodeParameter
		mockExecuteFunctions.getNodeParameter.mockImplementation((parameterName: string, itemIndex: number) => {
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
				return 'test-token';
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
		mockExecuteFunctions.getNode.mockReturnValue({
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
			expect(mockExecuteFunctions.getCredentials).toHaveBeenCalledWith('firebaseCloudMessageApi');
			expect(firebaseUtils.validateAndInitializeFirebase).toHaveBeenCalled();
			expect(mockExecuteFunctions.logger.info).toHaveBeenCalledWith('Firebase Cloud Messaging initialized successfully');
		});
		
		it('should handle Firebase initialization errors', async () => {
			// Arrange
			(firebaseUtils.validateAndInitializeFirebase as jest.Mock).mockRejectedValue(new Error('Initialization failed'));
			
			// Act & Assert
			await expect(firebaseCloudMessage.execute.call(mockExecuteFunctions)).rejects.toThrow(NodeOperationError);
			expect(mockExecuteFunctions.getCredentials).toHaveBeenCalledWith('firebaseCloudMessageApi');
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