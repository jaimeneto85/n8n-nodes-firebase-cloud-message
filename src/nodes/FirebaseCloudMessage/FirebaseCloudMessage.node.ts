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

export class FirebaseCloudMessage implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Firebase Cloud Message',
		name: 'firebaseCloudMessage',
		icon: 'file:firebase.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Send notifications via Firebase Cloud Messaging',
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
				],
				default: 'sendToToken',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		
		// Initialize Firebase Admin SDK
		const credentials = await this.getCredentials('firebaseCloudMessageApi');
		
		let firebaseApp: admin.app.App;
		try {
			const serviceAccountKey = JSON.parse(credentials.serviceAccountKey as string);
			
			// Check if the app has already been initialized
			try {
				firebaseApp = admin.app();
			} catch (error: any) {
				// Initialize the app with all credential options
				const initOptions: admin.AppOptions = {
					credential: admin.credential.cert(serviceAccountKey),
				};

				// Add optional configurations if provided
				if (credentials.databaseURL) {
					initOptions.databaseURL = credentials.databaseURL as string;
				}

				if (credentials.storageBucket) {
					initOptions.storageBucket = credentials.storageBucket as string;
				}

				// Initialize Firebase with all configured options
				firebaseApp = admin.initializeApp(initOptions);
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
		
		// Implement sending logic based on selected operation (to be expanded in future tasks)
		const operation = this.getNodeParameter('operation', 0) as string;
		
		try {
			if (operation === 'sendToToken') {
				this.logger.debug('Send to token operation selected, but not yet implemented fully');
				// Implementation will be added in future tasks
			}

			return [items];
		} catch (error: any) {
			throw new NodeOperationError(
				this.getNode(),
				`Firebase Cloud Messaging operation failed: ${error.message}`,
				{ itemIndex: 0 },
			);
		}
	}
} 