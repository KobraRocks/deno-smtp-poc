import type { ConnectOptions, ConnectTlsOptions, StartTlsOptions } from "./smtp.ts";

export function connect ( options: ConnectOptions ): Promise<Deno.Conn> {

        return Deno.connect( options )
            .catch( ( reason ) => { throw new Error(`Client.connect() ERROR ${reason.message}`); } );

        
    
 }

export async function connectTls ( options: ConnectTlsOptions ): Promise<Deno.TlsConn> {
    const { hostname, port, caCerts } = options;
    if ( Array.isArray( caCerts ) && caCerts.length > 0 ) {
        const caCert = await Deno.readTextFile( caCerts[0] );
        return Deno.connectTls({ caCerts:[caCert], hostname, port } );
    }   

    return Deno.connectTls( options );
}

export async function startTls ( options: StartTlsOptions ): Promise<Deno.TlsConn>  {
    const conn = await Deno.connect( options );

    if ( Array.isArray( options.caCerts ) && options.caCerts.length > 0 ) {
        const caCert = await Deno.readTextFile( options.caCerts[0] );
        return Deno.startTls( conn , { caCerts:[caCert], hostname: options.hostname } );
    }

    return Deno.startTls( conn , options );
}