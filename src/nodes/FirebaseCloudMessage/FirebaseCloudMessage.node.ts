import {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
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
				name: 'main',
				type: 'main',
			},
		],
		outputs: [
			{
				name: 'main',
				type: 'main',
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
				// Initialize the app if it hasn't been initialized yet
				firebaseApp = admin.initializeApp({
					credential: admin.credential.cert(serviceAccountKey),
				});
			}
		} catch (error: any) {
			throw new NodeOperationError(
				this.getNode(),
				`Firebase initialization failed: ${error.message}`,
				{ itemIndex: 0 },
			);
		}
		
		// For now, return empty data for testing setup
		return [items];
	}
} 