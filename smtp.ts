export type SecurityProtocol = 'BASIC' | 'TLS' | 'STARTTLS';

// Smtp server Auth protocols
export type CommonAuthProtocol = 'PLAIN' | 'LOGIN' | 'CRAM-MD5';
export type OtherAuthProtocol = 'XOAUTH' | 'XOAUTH2' | 'GSSAPI' | 'NTLM';
export type AuthProtocol = CommonAuthProtocol | OtherAuthProtocol

// Smtp server commands
export type GreetCmd = 'HELO' | 'EHLO';

export interface List<Type> {
    [s:string]: Type
}

export const ProtocolList: List<SecurityProtocol> = {
    BASIC: "BASIC",
    TLS: "TLS",
    STARTTLS: "STARTTLS"
};

export const StdPortList: List< number> = {
    BASIC: 25,
    TLS:465,
    STARTTLS: 587,
};

export function protocolExists ( securityProtocol: string ):boolean {
    return ProtocolList[securityProtocol] as SecurityProtocol !== undefined;
}

 export interface AuthBasicOptions {
    username: string;
    password: string;
}

interface AuthComplexOptions {
    token: string;
    hasAuthToken: () => boolean;
}

interface SecurityOptions {
    securityProtocol: SecurityProtocol;
}

export interface ConnectOptions extends Deno.ConnectOptions, SecurityOptions {}
export interface ConnectTlsOptions extends Deno.ConnectTlsOptions, SecurityOptions {}
export interface StartTlsOptions extends Deno.StartTlsOptions, Deno.ConnectOptions {}