// import {assert, fail, assertEquals} from "https://deno.land/std/testing/asserts.ts";
import { connect } from "./mod.ts"; 

import config from "./poc.config.json"  assert { type: "json" }


const SmtpConnection = await connect( config.connectionOptions );
const localAddr = SmtpConnection.localAddr;
const remoteAddr = SmtpConnection.remoteAddr;

console.log(`localAddr
transport:  ${localAddr.transport}
`)

console.log(`remoteAddr
transport:  ${remoteAddr.transport}
`)

console.log(`SmtpConnection
rid:        ${SmtpConnection.rid}
`);

const server = await SmtpConnection.open({ authOptions: config.authOptions });

if ( server.code === 235 ) {
    await SmtpConnection.sendEmail({
        from:'buddy@kobra.rocks',
        to:'me@kobra.rocks',
        subject: `SMTP Deno test ${Date.now()}`,
        body: 'this is a success'
    });
}

console.log( `###POC:   ${server.toString()}` );


