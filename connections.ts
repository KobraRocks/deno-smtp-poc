import type { ConnectOptions, ConnectTlsOptions, AuthBasicOptions, GreetCmd } from "./smtp.ts";
import { EmailOptions } from "./_email.ts";

import { BufReader, BufWriter, TextProtoReader} from "./deps.ts";
import { ClientRequest } from "./_client_request.ts";
import { ServerResponse } from "./_server_response.ts";
import * as Cmd from "./_commands.ts";

const CR = "\r".charCodeAt(0);
const LF = "\n".charCodeAt(0);

export class Conn implements Deno.Conn {
    
    #encoder = new TextEncoder();
    #decoder = new TextDecoder();
    #writer: BufWriter;
    //#reader: TextProtoReader;
    #reader: BufReader;
    #authProtocol = '';

    getConn: () => Deno.Conn ;
    getOptions: () => ConnectOptions; 
    
    constructor ( conn: Deno.Conn, options: ConnectOptions ) {        
        this.getConn = () => conn;
        this.getOptions = () => options;

        this.#writer = new BufWriter( conn );
        // this.#reader = new TextProtoReader( new BufReader( conn ) );
        this.#reader = new BufReader( conn );
    }

    get localAddr () { return this.getConn().localAddr; }
    get remoteAddr () { return this.getConn().remoteAddr; }
    get rid () { return this.getConn().rid; }

    closeWrite () { return this.getConn().closeWrite(); }
    close(): void { return this.getConn().close(); }
    read (p: Uint8Array): Promise<number | null> { return this.getConn().read( p ); }
    write(p: Uint8Array): Promise<number> { return this.getConn().write( p ); }

    async reader (): Promise<string | null> {
        let rowResponse = '';

        while ( true) {
            
            const p = new Uint8Array( 4096 );

            try {
                const totalBytes = await this.read( p );

                if ( totalBytes === null ) {
                    console.log( `${this.constructor.name}.reader() returned null`);
                    return null;
                
                }

                console.log( `${this.constructor.name}.reader() received ${totalBytes} bytes / ${p.byteLength} bytes`);
    
                rowResponse += this.#decoder.decode( p );

                console.log(`${this.constructor.name}.reader() ...RowResponse:${rowResponse}`)


                if ( /\r|\n/.exec( rowResponse ) ) {
                    console.log( `${this.constructor.name}.reader() received full rowResponse` );
                    return rowResponse;
                }

            } catch ( err ) {
                
                console.error( `${this.constructor.name}.reader() ERROR ${err.message}` );

                if ( err.message.indexOf('handshake') > -1 ) 
                    return null;
            }

        }
    }

    get authProtocol () { return this.#authProtocol; }

    async request ( options: ClientRequest | ClientRequest[] ): Promise<ServerResponse>  {

        if ( Array.isArray( options ) ) {
            for ( const o of options ) {
                await this.#simpleRequest( o )
            }
        } else {
            await this.#simpleRequest( options )
        }

        return this.receive();
    }

    async #simpleRequest (options: ClientRequest): Promise<void> {
        const p: Uint8Array = this.#encoder.encode( options.toString() + "\r\n" );
        const totalByteSize = p.byteLength;

        let byteSize = 0;
        
        try {
            byteSize = await this.#writer.write( p );
        } catch ( err ) {
            throw err.message;
        }

        console.log( `${this.constructor.name}.request() byteSize written ${byteSize} / Total of ${totalByteSize}`)
        
        if ( byteSize === totalByteSize ) { 
            await this.#writer.flush();
            console.log( `${this.constructor.name}.request() Flushing writer`); 
        }        
    }

    async receive (): Promise<ServerResponse> {

        console.log(`${this.constructor.name}.receive()`);

        const server = new ServerResponse();

        // while server sends response to client continue to next line
        while ( true ) {

            //console.log(`Waiting for server response, Reader.readString()`);

            const response = await this.#reader.readString('\n')
                .catch( ( reason ) => { throw new Error(`${this.constructor.name}.receive() this.#reader.readString() Error: ${reason.message}`)});


            if ( response === null )
                return new ServerResponse( '000 Something went wrong when reading Uint8Array Buffer' );

            server.add( response );

            console.log(`${this.constructor.name}.receive() serverResponse: ${server}`);
            console.log(`${this.constructor.name}.receive() Server sent last line ? ${server.sentLastLine()} => ${server.rowResponse}`)
            if ( server.sentLastLine() ) break;
        }

        return server;
    }

    async open ( options: { cmd?: string, authOptions?: AuthBasicOptions } ): Promise<ServerResponse> {

        let { cmd, authOptions } = options;

        if (cmd === undefined ) cmd = 'EHLO';

        console.log(`${this.constructor.name}.open( cmd = ${cmd}, authOptions = ${authOptions})`)

        const { hostname } = this.getOptions();

        console.log(`${this.constructor.name}.open() Is Smtp server ready ?`);

        // Is server ready ?
        const ready = await this.receive();

        if ( ready.code !== 220 )
            throw new Error(`${this.constructor.name}.open() Error: server ${hostname} is not ready, recevied: ${ready.toString()}`);

        console.log(`${this.constructor.name}.open() Smtp server at ${hostname} ready :)`)

        // TODO remove hardcoded local ip
        const greetCmd = cmd === 'EHLO' ? Cmd.EHLO( '127.0.0.1' ) : 
            cmd === 'HELO' ? Cmd.HELO( '127.0.0.1' ) : null;

        if ( greetCmd === null )
            throw new Error(`Smtp.${this.constructor.name}.open() Error: options.cmd should be "HELO" or "EHLO". Received cmd: "${cmd}"`);

        console.log(`${this.constructor.name}.open() send request ${greetCmd}`);

        const server = await this.request( greetCmd );
        
        console.log(`${this.constructor.name}.open() ${cmd} serverResponse ${server.toString()}`);

        // The server has not implemented the EHLO command
        if ( server.code === 502 ) {
            // try with HELO cmd
            if ( cmd === 'EHLO') return this.open(   { cmd: 'HELO', authOptions } );
        }

        if ( server.code === 250 && server.requestAuth() ) {
            if ( authOptions === undefined ) {
                throw new Error(`Smtp.${this.constructor.name}.open() Error: options.auth is undefined, cannot authenticate`);
            } else {
                return this.#autenticate( server, authOptions );
            }
            
        } 

        return server;

    }

    /** Authenticate will try to use the most secured protocol first,
     * then fallback on lesser secure protocols.
     * 
     * It will also choose the protocol depending on ConnectOptions provided
     * 
     * @param server  
     * @returns ServerResponse
     */
    #autenticate ( _server: ServerResponse, auth: AuthBasicOptions ): Promise<ServerResponse> {

        // TODO work on login strategy based on protocol supported by the server

        // only support for LOGIN protocol atm
        return this.#LOGIN( auth );

    }

    async #LOGIN ( auth: AuthBasicOptions ): Promise<ServerResponse> {

        const { username, password } = auth;
        const loginCmd = Cmd.AUTH_LOGIN();
        let server = await this.request( loginCmd );
        
        if ( server.code !== 334 )
            throw new Error(`${this.constructor.name}.#LOGIN() ERROR when passing ${loginCmd.toString()}: ${server.toString()}`);

        const usernameCmd = Cmd.AUTH_USERNAME( username );
        server = await this.request( usernameCmd );

        if ( server.code !== 334 )
            throw new Error(`${this.constructor.name}.#LOGIN() ERROR when passing username: ${server.toString()}`);

        const passwordCmd = Cmd.AUTH_PASSWORD( password );
        server = await this.request( passwordCmd );
    
        if ( server.code !== 235 ) {
            throw new Error(`${this.constructor.name}.#LOGIN() ERROR when passing password: ${server.toString()}`);
        }

        return server;
    }

    #parseAuthProtocols ( message: string ) {
        /** Auth message model
         * ```
         * AUTH LOGIN PLAIN CRAM-MD5
         *      ^
         *      5
         * return ['LOGIN', 'PLAIN', 'CRAM-MD5'] 
         * ```
         * 
         */
        const string = message.slice( 5 ).trimEnd();
        return string.split(" ");
    }

    async sendEmail ( options: { from?: string, to?: string, date?: string, subject?: string, body?: string } ): Promise<ServerResponse> {

        console.log(`${this.constructor.name}.sendEmail()`);

        const email = new EmailOptions( options );
        const { from, to, date, subject, body } = email;

        const mailFromCmd = Cmd.MAIL_FROM( from )
        let server = await this.request( mailFromCmd );
        console.log(`${this.constructor.name}.sendEmail() ${mailFromCmd.toString()}`);

        if ( server.code !== 250 )
            throw new Error(`${this.constructor.name}.sendEmail() ERROR MAIL FROM cmd failed: ${server.toString()}`);

        const rcptCmd = Cmd.RCPT_TO( to );
        server = await this.request( rcptCmd );
        console.log(`${this.constructor.name}.sendEmail() ${rcptCmd.toString()}`);

        if ( server.code !== 250 )
            throw new Error(`${this.constructor.name}.sendEmail() ERROR RCPT TO cmd failed: ${server.toString()}`);
            
        const dataCmd = Cmd.DATA();
        server = await this.request( dataCmd );
        console.log(`${this.constructor.name}.sendEmail() ${dataCmd.toString()}`);
        
        if ( server.code !== 354 )
            throw new Error(`${this.constructor.name}.sendEmail() ERROR Data cmd failed: ${server.toString()}`);

        console.log(`${this.constructor.name}.sendEmail() start email data`);
        
        server = await this.request( [
            new ClientRequest( 'Date:', date ),
            new ClientRequest( 'From:', from ),
            new ClientRequest( 'Subject:', subject ),
            new ClientRequest( 'To:', to ),
            new ClientRequest( '', body ),
            new ClientRequest( '', '.' )

        ] );

        console.log(`${this.constructor.name}.sendEmail() end email data`);

        if ( server.code !== 250 )
            throw new Error(`${this.constructor.name}.sendEmail() ERROR sendind email data failed: ${server.toString()}`);

        return server;
    }

}

export class TlsConn extends Conn implements Deno.TlsConn {
    
    getConn: () => Deno.TlsConn;
    getOptions: () => ConnectTlsOptions ; 

    constructor ( conn: Deno.TlsConn, options: ConnectTlsOptions ) {

        super( conn, options );

        this.getConn = () => conn;
        this.getOptions = () => options;
    }

    handshake () { return this.getConn().handshake(); }

}