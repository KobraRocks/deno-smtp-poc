
import { protocolExists, ProtocolList } from "./smtp.ts";


function validateSecurityProtocol ( securityProtocol: string ) {

    if ( typeof securityProtocol === 'string' && securityProtocol.length > 0 && protocolExists( securityProtocol ) ) {
        return securityProtocol;
    } else {
        throw new Error( `Smtp.connect() Error. options.securityProtocol must be a string, with one of those values: ${ Object.keys(ProtocolList).join(',')}. Received ${typeof securityProtocol}: ${securityProtocol}` );
    }

}

function validateCaCerts ( caCerts: string[] ) {
    if ( Array.isArray( caCerts ) ) {

        for ( const cert of caCerts ) {
            if ( typeof cert !== 'string' || ( typeof cert === 'string' && cert.length === 0) )
                throw new Error( `Smtp.connect() Error. optionscaCerts Array must only contain none empty string. Received cert: ${cert}` );
        }

        return caCerts;

    } else {
        throw new Error( `Smtp.connect() Error. options.caCerts must be a string array` );
    }
}

function validateHostname ( hostname: string ) {
    if ( typeof hostname === 'string' && hostname.length > 0 ) {
        return hostname;
    } else {
        throw new Error( `Smtp.connect() Error. options.hostname must be a none empty string. Received ${typeof hostname}: ${hostname}` );
    }
}

function validatePort ( port: number ) {
    if ( ( typeof port === 'number' && port > 0 ) ) {
        return port;
    } else {
        throw new Error( `Smtp.connect() Error. options.port must be an unsigned integer ( i >= 0 ). Received ${typeof port}: ${port}` );
    }   
}

function validateUsername ( username: string ) {
    if ( typeof username === 'string' && username.length > 0 ) {
        return username;
    } else {
        throw new Error( `Smtp.Connection.open() Error. options.username must be a none empty string. Received ${typeof username}: ${username}` );
    }
}

function validatePassword ( password: string ) {
    if ( typeof password === 'string' && password.length > 0 ) {
        return password;
    } else {
        throw new Error( `Smtp.Connection.open() Error. options.password must be a none empty string. Received ${typeof password}: ${password}` );
    }
}

function validateToken ( token: string ) {
    if ( typeof token === 'string' && token.length > 0 ) {
        return token;
    } else {
        throw new Error( `Smtp.Connection.open() Error. options.token must be a none empty string. Received ${typeof token}: ${token}` );
    }
}

function validateAuthOptions ( options: { username: string | undefined, password: string | undefined }) {

    const { username, password } = options;

    if ( username === undefined && password === undefined ) 
        return { username: '', password: '' };

    if ( typeof username !== 'string' || typeof password !== 'string' )
        throw new Error( `Smtp.connect() Error. Uncomplete AuthOptions { username, password }. Received ${typeof username}: ${username} && ${typeof password}: ${password}` );

    return {
        username: validateUsername( username ),
        password: validatePassword( password )
    };
}

const Validate = {
    securityProtocol: validateSecurityProtocol,
    caCerts: validateCaCerts,
    hostname: validateHostname,
    port: validatePort,
    username: validateUsername,
    password: validatePassword,
    authOptions: validateAuthOptions,
    token: validateToken 
}

export default Validate;
