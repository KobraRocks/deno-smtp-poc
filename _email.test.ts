import {assert, fail, assertEquals} from "https://deno.land/std/testing/asserts.ts";

import { SmtpDate, EmailOptions, SMTP_DATE_REGEX } from "./_email.ts";

Deno.test('#SmtpDate.toString() success', () => {

    const d = new SmtpDate();
    console.log(`Date: ${d}`);
    const match = d.toString().match( SMTP_DATE_REGEX ) !== null;

    assert( match );

});

Deno.test('#EmailOptions new success', () => {

    const from = 'me@me.com',
        to = 'you@you.com',
        subject = 'hello',
        body = 'you !'

    const email = new EmailOptions({
        from,
        to,
        subject,
        body
    });

    assertEquals( email.from, from );
    assertEquals( email.to, to );
    assertEquals( email.subject, subject );
    assertEquals( email.body, body );
    assert( typeof email.date === 'string' );
});