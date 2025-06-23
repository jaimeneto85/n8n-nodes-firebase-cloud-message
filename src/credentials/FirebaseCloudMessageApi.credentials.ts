import {
	IAuthenticateGeneric,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class FirebaseCloudMessageApi implements ICredentialType {
	name = 'firebaseCloudMessageApi';
	displayName = 'Firebase Cloud Message API';
	documentationUrl = 'https://firebase.google.com/docs/cloud-messaging';
	properties: INodeProperties[] = [
		{
			displayName: 'Service Account Key',
			name: 'serviceAccountKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			description: 'Service account key JSON for Firebase Cloud Messaging',
			required: true,
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {},
	};
} 