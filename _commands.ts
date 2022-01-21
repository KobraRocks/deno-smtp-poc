import { ClientRequest } from "./_client_request.ts";

export interface Command {
    (...args: string[]): ClientRequest;
}

export interface CommandList {
    [s:string]: Command;
}

export function HELO ( hostname: string ) { return new ClientRequest( 'HELO', hostname ); }
export function EHLO ( hostname: string ) { return new ClientRequest( 'EHLO', hostname ); }

export function AUTH_PLAIN ( username: string, password: string ) { return new ClientRequest( 'AUTH PLAIN', `${btoa(`\u0000 ${username} \u0000 ${password}`)}` ); }
export function AUTH_LOGIN (): ClientRequest { return new ClientRequest('AUTH LOGIN', ''); }
export function AUTH_USERNAME ( username: string ) { return new ClientRequest( '', btoa( username ) )}
export function AUTH_PASSWORD ( password: string ) { return new ClientRequest( '', btoa( password ) )}

export function MAIL_FROM ( from:string ) { return new ClientRequest('MAIL FROM:', `:<${from}>`); }
export function RCPT_TO ( to: string) { return new ClientRequest('RCPT TO:', `<${to}>`); }
export function DATA () { return new ClientRequest('DATA', ''); }


