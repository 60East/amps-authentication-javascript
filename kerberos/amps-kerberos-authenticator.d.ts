import { Authenticator } from 'amps';
export declare class AMPSKerberosAuthenticator implements Authenticator {
    private spn;
    private client;
    constructor(spn: string);
    private context;
    authenticate(login: string, password: string): Promise<string>;
    retry(login: string, password: string): Promise<string>;
    completed(login: string, password: string, reason: string): void;
}
export declare function validateSPN(spn: string): void;
