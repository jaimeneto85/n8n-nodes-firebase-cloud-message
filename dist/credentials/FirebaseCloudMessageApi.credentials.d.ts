import { IAuthenticateGeneric, ICredentialDataDecryptedObject, ICredentialTestRequest, ICredentialType, INodeProperties } from 'n8n-workflow';
export declare class FirebaseCloudMessageApi implements ICredentialType {
    name: string;
    displayName: string;
    documentationUrl: string;
    properties: INodeProperties[];
    authenticate: IAuthenticateGeneric;
    test: ICredentialTestRequest;
    validateCredentials(credentials: ICredentialDataDecryptedObject): Promise<{
        isValid: boolean;
        errorMessage?: string;
    }>;
}
