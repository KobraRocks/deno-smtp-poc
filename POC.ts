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
        from: config.emailOptions.from,
        to: config.emailOptions.to,
        subject: `SMTP Deno POC test ${Date.now()}`,
        body:config.emailOptions.body
    });
}

console.log( `###POC:   ${server.toString()}` );


