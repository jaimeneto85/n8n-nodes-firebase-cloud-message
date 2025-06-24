import {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeConnectionType,
	NodeOperationError,
} from 'n8n-workflow';

import * as admin from 'firebase-admin';
import { FirebaseCloudMessageApi } from '../../credentials/FirebaseCloudMessageApi.credentials';
import { validateAndInitializeFirebase, getMessaging } from '../../utils/firebase.utils';

export class FirebaseCloudMessage implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Firebase Cloud Message',
		name: 'firebaseCloudMessage',
		icon: 'file:icons/firebase.svg',
		group: ['output', 'notification'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Send push notifications via Firebase Cloud Messaging',
		defaults: {
			name: 'Firebase Cloud Message',
		},
		inputs: [
			{
				displayName: 'Main',
				type: NodeConnectionType.Main,
				required: true,
			},
		],
		outputs: [
			{
				displayName: 'Main',
				type: NodeConnectionType.Main,
			},
		],
		credentials: [
			{
				name: 'firebaseCloudMessageApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Send to Token',
						value: 'sendToToken',
						description: 'Send message to a specific device token',
						action: 'Send message to a specific device token',
					},
					{
						name: 'Send to Topic',
						value: 'sendToTopic',
						description: 'Send message to a topic',
						action: 'Send message to a topic',
					},
					{
						name: 'Send to Condition',
						value: 'sendToCondition',
						description: 'Send message based on a condition',
						action: 'Send message based on a condition',
					},
					{
						name: 'Subscribe to Topic',
						value: 'subscribeToTopic',
						description: 'Subscribe tokens to a topic',
						action: 'Subscribe tokens to a topic',
					},
					{
						name: 'Unsubscribe from Topic',
						value: 'unsubscribeFromTopic',
						description: 'Unsubscribe tokens from a topic',
						action: 'Unsubscribe tokens from a topic',
					},
				],
				default: 'sendToToken',
			},
			// Token Fields - shown when sendToToken is selected
			{
				displayName: 'Device Token',
				name: 'deviceToken',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['sendToToken'],
					},
				},
				default: '',
				required: true,
				description: 'The registration token or array of registration tokens to send a message to',
				placeholder: 'c_TRalKu7Uk:APA91bE...',
			},
			{
				displayName: 'Multiple Tokens',
				name: 'multipleTokens',
				type: 'boolean',
				displayOptions: {
					show: {
						operation: ['sendToToken'],
					},
				},
				default: false,
				description: 'Whether to send to multiple tokens at once',
			},
			{
				displayName: 'Device Tokens',
				name: 'deviceTokens',
				type: 'string',
				typeOptions: {
					multipleValues: true,
				},
				displayOptions: {
					show: {
						operation: ['sendToToken'],
						multipleTokens: [true],
					},
				},
				default: [],
				required: true,
				description: 'Array of device tokens to send to (maximum 500)',
				placeholder: 'c_TRalKu7Uk:APA91bE...',
			},
			// Topic Fields - shown when sendToTopic is selected
			{
				displayName: 'Topic',
				name: 'topic',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['sendToTopic', 'subscribeToTopic', 'unsubscribeFromTopic'],
					},
				},
				default: '',
				required: true,
				description: 'The topic name to send a message to',
				placeholder: 'weather',
			},
			// Condition Fields - shown when sendToCondition is selected
			{
				displayName: 'Condition',
				name: 'condition',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['sendToCondition'],
					},
				},
				default: '',
				required: true,
				description: 'Condition to evaluate against for conditional messaging (e.g. "\'weather\' in topics && (\'news\' in topics || \'traffic\' in topics)")',
				placeholder: '\'weather\' in topics',
			},
			// Message Fields - common for all send operations
			{
				displayName: 'Message',
				name: 'message',
				type: 'fixedCollection',
				displayOptions: {
					show: {
						operation: ['sendToToken', 'sendToTopic', 'sendToCondition'],
					},
				},
				default: {},
				placeholder: 'Add Message Field',
				typeOptions: {
					multipleValues: false,
				},
				options: [
					{
						name: 'messageFields',
						displayName: 'Message Fields',
						values: [
							{
								displayName: 'Title',
								name: 'title',
								type: 'string',
								default: '',
								description: 'The notification title',
							},
							{
								displayName: 'Body',
								name: 'body',
								type: 'string',
								default: '',
								description: 'The notification body text',
							},
							{
								displayName: 'Image URL',
								name: 'imageUrl',
								type: 'string',
								default: '',
								description: 'URL to the image to display in the notification',
							},
							{
								displayName: 'Priority',
								name: 'priority',
								type: 'options',
								options: [
									{
										name: 'Normal',
										value: 'normal',
										description: 'Regular priority for the notification',
									},
									{
										name: 'High',
										value: 'high',
										description: 'High priority notification that triggers immediate delivery',
									},
								],
								default: 'normal',
								description: 'The priority of the message. On Android, high priority messages are shown as heads-up notifications.',
							},
							{
								displayName: 'Sound',
								name: 'sound',
								type: 'string',
								default: 'default',
								description: 'The sound to play when the device receives the notification. Specify "default" for default sound or a filename without extension for custom sound.',
							},
							{
								displayName: 'Click Action',
								name: 'clickAction',
								type: 'string',
								default: '',
								description: 'The action to take when the notification is clicked. For Android, this is the intent filter. For web, this is the URL to open.',
							},
							{
								displayName: 'Data',
								name: 'data',
								type: 'json',
								default: '{}',
								description: 'Custom key-value pairs for the message payload. These can be retrieved by the client app.',
								typeOptions: {
									alwaysOpenEditWindow: true,
								},
							},
						],
					},
				],
			},
			// Options for subscribe/unsubscribe operations
			{
				displayName: 'Device Tokens',
				name: 'registrationTokens',
				type: 'string',
				typeOptions: {
					multipleValues: true,
				},
				displayOptions: {
					show: {
						operation: ['subscribeToTopic', 'unsubscribeFromTopic'],
					},
				},
				default: [],
				required: true,
				description: 'Array of device tokens to subscribe/unsubscribe (maximum 1000)',
			},
			// JSON Mode
			{
				displayName: 'JSON Parameters',
				name: 'jsonParameters',
				type: 'boolean',
				default: false,
				description: 'Use raw JSON for message configuration',
			},
			{
				displayName: 'Message JSON',
				name: 'messageJson',
				type: 'json',
				default: '',
				required: true,
				displayOptions: {
					show: {
						jsonParameters: [true],
						operation: ['sendToToken', 'sendToTopic', 'sendToCondition'],
					},
				},
				description: 'Full message JSON payload',
				typeOptions: {
					alwaysOpenEditWindow: true,
				},
			},
			{
				displayName: 'Message Type',
				name: 'messageType',
				type: 'options',
				options: [
					{
						name: 'Notification with Optional Data',
						value: 'notification',
						description: 'Send a notification that appears on the device with optional data payload',
					},
					{
						name: 'Data Only',
						value: 'dataOnly',
						description: 'Send only a data message that is handled by the app and does not appear as a notification',
					},
				],
				default: 'notification',
				description: 'The type of message to send',
				displayOptions: {
					show: {
						jsonParameters: [
							false,
						],
					},
				},
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		
		// Get credentials
		const credentials = await this.getCredentials('firebaseCloudMessageApi');
		
		let firebaseApp: admin.app.App;
		let projectId: string;
		
		try {
			// Initialize Firebase Admin SDK using our utility function
			firebaseApp = await validateAndInitializeFirebase(credentials);
			
			// Get project ID from service account key
			const serviceAccountKey = JSON.parse(credentials.serviceAccountKey as string);
			projectId = serviceAccountKey.project_id;
			
			// Get the TokenManager instance from the credentials
			const credentialsObject = new FirebaseCloudMessageApi();
			const tokenManager = credentialsObject.getTokenManager();
			
			// Check if token caching is enabled
			const enableTokenCaching = credentials.enableTokenCaching !== false;
			
			// Function to generate a new Firebase token
			const generateFirebaseToken = async (): Promise<string> => {
				this.logger.debug('Generating new Firebase authentication token');
				
				// For Firebase Admin SDK, we don't actually need to generate a token
				// since it handles token management internally, but we return a placeholder
				// to work with our token manager
				return `firebase-admin-token-${Date.now()}`;
			};
			
			// Get or generate the token if token caching is enabled
			if (enableTokenCaching) {
				await tokenManager.getToken(projectId, generateFirebaseToken);
				this.logger.debug('Using cached or new Firebase token');
			}
			
			// Log successful initialization
			this.logger.info('Firebase Cloud Messaging initialized successfully');
			
		} catch (error: any) {
			throw new NodeOperationError(
				this.getNode(),
				`Firebase initialization failed: ${error.message}`,
				{ itemIndex: 0 },
			);
		}
		
		// Execute operations based on selected operation
		const operation = this.getNodeParameter('operation', 0) as string;
		
		try {
			// Process each item
			for (let i = 0; i < items.length; i++) {
				const jsonParameters = this.getNodeParameter('jsonParameters', i, false) as boolean;
				
				if (operation === 'sendToToken') {
					// Handle sending to token
					this.logger.debug('Executing sendToToken operation');
					
					let message: admin.messaging.Message;
					
					if (jsonParameters) {
						// Use JSON directly
						const messageJson = this.getNodeParameter('messageJson', i) as string;
						message = JSON.parse(messageJson);
					} else {
						// Build message from parameters
						const multipleTokens = this.getNodeParameter('multipleTokens', i, false) as boolean;
						let token = '';
						let tokens: string[] = [];
						
						if (multipleTokens) {
							tokens = this.getNodeParameter('deviceTokens', i, []) as string[];
							
							if (tokens.length === 0) {
								throw new NodeOperationError(
									this.getNode(),
									'At least one device token is required',
									{ itemIndex: i },
								);
							}
							
							if (tokens.length > 500) {
								throw new NodeOperationError(
									this.getNode(),
									'Maximum of 500 tokens allowed in a single request',
									{ itemIndex: i },
								);
							}
						} else {
							token = this.getNodeParameter('deviceToken', i, '') as string;
							
							if (!token) {
								throw new NodeOperationError(
									this.getNode(),
									'Device token is required',
									{ itemIndex: i },
								);
							}
						}
						
						// Get notification content
						const messageFields = this.getNodeParameter('message.messageFields', i, {}) as IDataObject;
						const title = messageFields.title as string;
						const body = messageFields.body as string;
						const imageUrl = messageFields.imageUrl as string;
						const priority = messageFields.priority as string;
						const sound = messageFields.sound as string;
						const clickAction = messageFields.clickAction as string;
						const dataJson = messageFields.data as string;
						const messageType = this.getNodeParameter('messageType', i, 'notification') as string;
						
						// Parse data payload if provided
						let data: {[key: string]: string} | undefined;
						if (dataJson && dataJson !== '{}') {
							try {
								data = JSON.parse(dataJson);
								// Ensure all values are strings as required by FCM
								if (data) {
									Object.keys(data).forEach(key => {
										if (data && typeof data[key] !== 'string') {
											data[key] = String(data[key]);
										}
									});
								}
							} catch (error: any) {
								throw new NodeOperationError(
									this.getNode(),
									`Invalid JSON in data field: ${error.message}`,
									{ itemIndex: i },
								);
							}
						}
						
						// Build message object
						if (multipleTokens) {
							message = {
								...(messageType === 'notification' ? {
									notification: {
										title,
										body,
										...(imageUrl && { imageUrl }),
										...(sound && { sound }),
										...(clickAction && { clickAction }),
									},
								} : {}),
								android: {
									...(priority && { priority }),
								},
								apns: {
									payload: {
										aps: {
											...(sound && { sound }),
											...(priority === 'high' ? { 'content-available': 1 } : {}),
										},
									},
								},
								...(data && { data }),
								tokens,
							} as any; // Using any to avoid type conflicts
						} else {
							message = {
								...(messageType === 'notification' ? {
									notification: {
										title,
										body,
										...(imageUrl && { imageUrl }),
										...(sound && { sound }),
										...(clickAction && { clickAction }),
									},
								} : {}),
								android: {
									...(priority && { priority }),
								},
								apns: {
									payload: {
										aps: {
											...(sound && { sound }),
											...(priority === 'high' ? { 'content-available': 1 } : {}),
										},
									},
								},
								...(data && { data }),
								token,
							} as any; // Using any to avoid type conflicts
						}
					}
					
					// Send the message
					let result;
					if ('tokens' in message) {
						// Send multicast message
						this.logger.debug(`Sending multicast message to ${(message as any).tokens?.length} tokens`);
						result = await getMessaging(firebaseApp).sendMulticast(message as any);
					} else {
						// Send single message
						this.logger.debug(`Sending message to token: ${(message as any).token}`);
						result = await getMessaging(firebaseApp).send(message as any);
					}
					
					returnData.push({
						json: {
							success: true,
							result,
						},
						pairedItem: { item: i },
					});
				} else if (operation === 'sendToTopic') {
					// Handle sending to topic
					this.logger.debug('Executing sendToTopic operation');
					
					let messagePayload: any;
					
					if (jsonParameters) {
						// Use JSON directly
						const messageJson = this.getNodeParameter('messageJson', i) as string;
						messagePayload = JSON.parse(messageJson);
					} else {
						// Build message from parameters
						const topic = this.getNodeParameter('topic', i, '') as string;
						
						if (!topic) {
							throw new NodeOperationError(
								this.getNode(),
								'Topic name is required',
								{ itemIndex: i },
							);
						}
						
						// Ensure topic is properly formatted
						const formattedTopic = topic.startsWith('/topics/') ? topic : `/topics/${topic}`;
						
						// Get notification content
						const messageFields = this.getNodeParameter('message.messageFields', i, {}) as IDataObject;
						const title = messageFields.title as string;
						const body = messageFields.body as string;
						const imageUrl = messageFields.imageUrl as string;
						const priority = messageFields.priority as string;
						const sound = messageFields.sound as string;
						const clickAction = messageFields.clickAction as string;
						const dataJson = messageFields.data as string;
						const messageType = this.getNodeParameter('messageType', i, 'notification') as string;
						
						// Parse data payload if provided
						let data: {[key: string]: string} | undefined;
						if (dataJson && dataJson !== '{}') {
							try {
								data = JSON.parse(dataJson);
								// Ensure all values are strings as required by FCM
								if (data) {
									Object.keys(data).forEach(key => {
										if (data && typeof data[key] !== 'string') {
											data[key] = String(data[key]);
										}
									});
								}
							} catch (error: any) {
								throw new NodeOperationError(
									this.getNode(),
									`Invalid JSON in data field: ${error.message}`,
									{ itemIndex: i },
								);
							}
						}
						
						// Build message object
						messagePayload = {
							...(messageType === 'notification' ? {
								notification: {
									title,
									body,
									...(imageUrl && { imageUrl }),
									...(sound && { sound }),
									...(clickAction && { clickAction }),
								},
							} : {}),
							android: {
								...(priority && { priority }),
							},
							apns: {
								payload: {
									aps: {
										...(sound && { sound }),
										...(priority === 'high' ? { 'content-available': 1 } : {}),
									},
								},
							},
							...(data && { data }),
							topic: formattedTopic.replace('/topics/', ''), // Firebase API doesn't want the /topics/ prefix
						};
					}
					
					// Send the message
					this.logger.debug(`Sending message to topic: ${messagePayload.topic}`);
					const result = await getMessaging(firebaseApp).send(messagePayload);
					
					returnData.push({
						json: {
							success: true,
							result,
						},
						pairedItem: { item: i },
					});
				} else if (operation === 'sendToCondition') {
					// Handle sending with condition
					this.logger.debug('Executing sendToCondition operation');
					
					let messagePayload: any;
					
					if (jsonParameters) {
						// Use JSON directly
						const messageJson = this.getNodeParameter('messageJson', i) as string;
						messagePayload = JSON.parse(messageJson);
					} else {
						// Build message from parameters
						const condition = this.getNodeParameter('condition', i, '') as string;
						
						if (!condition) {
							throw new NodeOperationError(
								this.getNode(),
								'Condition is required',
								{ itemIndex: i },
							);
						}
						
						// Get notification content
						const messageFields = this.getNodeParameter('message.messageFields', i, {}) as IDataObject;
						const title = messageFields.title as string;
						const body = messageFields.body as string;
						const imageUrl = messageFields.imageUrl as string;
						const priority = messageFields.priority as string;
						const sound = messageFields.sound as string;
						const clickAction = messageFields.clickAction as string;
						const dataJson = messageFields.data as string;
						const messageType = this.getNodeParameter('messageType', i, 'notification') as string;
						
						// Parse data payload if provided
						let data: {[key: string]: string} | undefined;
						if (dataJson && dataJson !== '{}') {
							try {
								data = JSON.parse(dataJson);
								// Ensure all values are strings as required by FCM
								if (data) {
									Object.keys(data).forEach(key => {
										if (data && typeof data[key] !== 'string') {
											data[key] = String(data[key]);
										}
									});
								}
							} catch (error: any) {
								throw new NodeOperationError(
									this.getNode(),
									`Invalid JSON in data field: ${error.message}`,
									{ itemIndex: i },
								);
							}
						}
						
						// Build message object
						messagePayload = {
							...(messageType === 'notification' ? {
								notification: {
									title,
									body,
									...(imageUrl && { imageUrl }),
									...(sound && { sound }),
									...(clickAction && { clickAction }),
								},
							} : {}),
							android: {
								...(priority && { priority }),
							},
							apns: {
								payload: {
									aps: {
										...(sound && { sound }),
										...(priority === 'high' ? { 'content-available': 1 } : {}),
									},
								},
							},
							...(data && { data }),
							condition,
						};
					}
					
					// Send the message
					this.logger.debug(`Sending message with condition: ${messagePayload.condition}`);
					const result = await getMessaging(firebaseApp).send(messagePayload);
					
					returnData.push({
						json: {
							success: true,
							result,
						},
						pairedItem: { item: i },
					});
				} else if (operation === 'subscribeToTopic') {
					// Handle subscribing to topic
					this.logger.debug('Executing subscribeToTopic operation');
					
					const topic = this.getNodeParameter('topic', i, '') as string;
					const registrationTokens = this.getNodeParameter('registrationTokens', i, []) as string[];
					
					if (!topic) {
						throw new NodeOperationError(
							this.getNode(),
							'Topic name is required',
							{ itemIndex: i },
						);
					}
					
					if (registrationTokens.length === 0) {
						throw new NodeOperationError(
							this.getNode(),
							'At least one registration token is required',
							{ itemIndex: i },
						);
					}
					
					if (registrationTokens.length > 1000) {
						throw new NodeOperationError(
							this.getNode(),
							'Maximum of 1000 tokens allowed in a single subscribe request',
							{ itemIndex: i },
						);
					}
					
					// Ensure topic is properly formatted - without /topics/ prefix as the API doesn't want it
					const formattedTopic = topic.replace(/^\/topics\//, '');
					
					// Subscribe tokens to topic
					this.logger.debug(`Subscribing ${registrationTokens.length} tokens to topic: ${formattedTopic}`);
					const result = await getMessaging(firebaseApp).subscribeToTopic(registrationTokens, formattedTopic);
					
					returnData.push({
						json: {
							success: true,
							result,
						},
						pairedItem: { item: i },
					});
				} else if (operation === 'unsubscribeFromTopic') {
					// Handle unsubscribing from topic
					this.logger.debug('Executing unsubscribeFromTopic operation');
					
					const topic = this.getNodeParameter('topic', i, '') as string;
					const registrationTokens = this.getNodeParameter('registrationTokens', i, []) as string[];
					
					if (!topic) {
						throw new NodeOperationError(
							this.getNode(),
							'Topic name is required',
							{ itemIndex: i },
						);
					}
					
					if (registrationTokens.length === 0) {
						throw new NodeOperationError(
							this.getNode(),
							'At least one registration token is required',
							{ itemIndex: i },
						);
					}
					
					if (registrationTokens.length > 1000) {
						throw new NodeOperationError(
							this.getNode(),
							'Maximum of 1000 tokens allowed in a single unsubscribe request',
							{ itemIndex: i },
						);
					}
					
					// Ensure topic is properly formatted - without /topics/ prefix as the API doesn't want it
					const formattedTopic = topic.replace(/^\/topics\//, '');
					
					// Unsubscribe tokens from topic
					this.logger.debug(`Unsubscribing ${registrationTokens.length} tokens from topic: ${formattedTopic}`);
					const result = await getMessaging(firebaseApp).unsubscribeFromTopic(registrationTokens, formattedTopic);
					
					returnData.push({
						json: {
							success: true,
							result,
						},
						pairedItem: { item: i },
					});
				} else {
					// For now, other operations are not implemented
					this.logger.debug(`Operation ${operation} selected, but not yet implemented fully`);
					
					returnData.push({
						json: {
							success: false,
							message: `Operation ${operation} not fully implemented yet`,
						},
						pairedItem: { item: i },
					});
				}
			}

			return [returnData];
		} catch (error: any) {
			throw new NodeOperationError(
				this.getNode(),
				`Firebase Cloud Messaging operation failed: ${error.message}`,
				{ itemIndex: 0 },
			);
		}
	}
} 