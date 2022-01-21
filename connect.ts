import type { SecurityProtocol } from "./smtp.ts";

import * as Client from "./_client.ts"
import Validate from "./_validate.ts";
import { ProtocolList, StdPortList } from "./lists.ts"
import { Conn, TlsConn } from "./connections.ts";


export async function connect ( untrustedOptions: {     
    securityProtocol?:string, 
    hostname?: string, 
    port?: number, 
    username?: string, 
    password?: string, 
    token?: string
    caCerts?: string[]
} ): Promise<Conn | TlsConn> {

    const { securityProtocol, hostname, port, caCerts } = untrustedOptions;
    let conn

    if ( securityProtocol === undefined )
        throw new Error( `Smtp.connect() Error. options.securityProtocol must be a none empty string and one of those values: ${ Object.keys(ProtocolList).join(',')}. Received ${typeof securityProtocol}: ${securityProtocol}` );

    const options = {
        securityProtocol: Validate.securityProtocol( securityProtocol ) as SecurityProtocol,
        caCerts: caCerts === undefined ? [] : Validate.caCerts( caCerts ), 
        hostname: hostname === undefined ? undefined : Validate.hostname( hostname ),
        port: port === undefined ? StdPortList[securityProtocol] : Validate.port( port ),
    };

    if ( securityProtocol === ProtocolList.STARTTLS ) {
        console.log(' starting a STARTTLS connection ');

        conn = await Client.startTls( options );
        if ( conn ) return new TlsConn( conn, options );
    }

    if ( securityProtocol === ProtocolList.TLS ) {
        console.log(' starting a TLS connection ');

        conn = await Client.connectTls( options );
        if ( conn ) return new TlsConn( conn, options );
    }


    if ( securityProtocol === ProtocolList.BASIC ) {
        console.log(' starting a BASIC connection ');

        conn = await Client.connect( options );
        if ( conn ) return new Conn( conn, options );
    }


    throw new Error(`Smtp.connect() must be provided with a valid Smtp.ConnectOption or Smtp.ConnectTlsOptions or Smtp.StartTlsOptions`);
}
