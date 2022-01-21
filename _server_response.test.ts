import {assert, fail, assertEquals} from "https://deno.land/std/testing/asserts.ts";

import { ServerResponse } from "./_server_response.ts";

const message = 'smtp.dummy.com ESMTP ready';
const code = 220;
const rowResponse = '220 smtp.dummy.com ESMTP ready';

Deno.test('#ServerResponse new with message success', () => {
    const serverResponse = new ServerResponse(rowResponse);

    assertEquals( serverResponse.code, 220 );
    assertEquals( serverResponse.message, message);
    assertEquals( serverResponse.messages.length, 1);
    assertEquals( serverResponse.messages[0], message);
    assertEquals( serverResponse.rowResponse, rowResponse);
});

Deno.test('#ServerResponse.add( message ) success', () => {
    const serverResponse = new ServerResponse();
    serverResponse.add( rowResponse );

    assertEquals( serverResponse.code, 220 );
    assertEquals( serverResponse.message, message);
    assertEquals( serverResponse.messages.length, 1);
    assertEquals( serverResponse.messages[0], message);
    assertEquals( serverResponse.rowResponse, rowResponse);
});


Deno.test('ServerResponse.sendLastLine() success', () => {
    const serverResponse = new ServerResponse( rowResponse ) ;

    assertEquals(serverResponse.sentLastLine(), true);
});



Deno.test('ServerResponse.requestAuth() success', () => {
    const rowResponse = '250 AUTH PLAIN LOGIN CRAM-MD5';
    const serverResponse = new ServerResponse( rowResponse ) ;

    assertEquals(serverResponse.requestAuth(), true);
});