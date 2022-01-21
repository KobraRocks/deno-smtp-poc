export const SMTP_DATE_REGEX = /^(([A-Z][a-z]{2}),\s([A-Z][a-z]{2})\s([0-9]{2})\s([0-9]{4})\s(([0-9]{2}:){2}[0-9]{2})\s([+-]([0-9]{4}))\s\([^\s()](?:[^()]*[^\s()])?\))$/g;
const FULL_EMAIL_ADDRESS_REGEX = /^("(([A-Za-z0-9.]+)\s)+([A-Za-z0-9.]+)"<(\b[A-Za-z0-9._%+-]+@(([A-Za-z0-9-])+\.)+[A-Za-z]{2,}\b)>)$/g;
const EMAIL_ADDRESS_REGEX = /^(\b[A-Za-z0-9._%+-]+@(([A-Za-z0-9-])+\.)+[A-Za-z]{2,}\b)$/g;
/**
 *  SmtpDate string model example = Mon, Jan 17 2022 07:55:42 +0000 (Coordinated Universal Time)
 */
export class SmtpDate extends Date {

    toString (): string {

        const d: string = super.toString().replace('GMT', '');
        const day = d.substring(0, 3);

        return d.replace( day, `${day},`);
    }
}

export class EmailOptions {

    date: string;
    from: string;
    subject: string;    
    to: string;
    body: string

    constructor ({ date = new SmtpDate().toString(), from = '', subject = '', to = '', body = ''}) {

        if ( typeof date === 'string' && this.#isValidSmtpDate( date ) ) {
            this.date = date;
        } else {
            throw new Error(`${this.constructor.name}.date must be a valid Smtp Date string, ex: ${new SmtpDate().toString()}. Received date: ${date}`);
        }

        if ( typeof from === 'string' && this.#isValidEmailAddress( from ) ) {
            this.from = from;
        } else {
            throw new Error(`${this.constructor.name}.from must be a valid email address, ex: "John Doe"<john.doe@me.rocks> or samantha@me.rocks. Received from: ${from}`)
        }

        if ( typeof subject === 'string' && subject.length > 0 ) {
            this.subject = subject;
        } else {
            throw new Error(`${this.constructor.name}.subject must be a none empty string. Received subject: ${subject}`);
        }

        if ( typeof to === 'string' && this.#isValidEmailAddress( to ) ) {
            this.to = to;
        } else {
            throw new Error(`${this.constructor.name}.to must be a valid email address, ex: "John Doe"<john.doe@me.rocks> or samantha@me.rocks. Received to: ${from}`)
        }  
        
        if ( typeof body === 'string' && body.length > 0 ) {
            this.body = body;
        } else {
            throw new Error(`${this.constructor.name}.body must be a none empty string. Received body: ${subject}`);
        }        

    }

    #isValidSmtpDate( date: string ): boolean {
        return date.match( SMTP_DATE_REGEX ) !== null ;
    }

    #isValidEmailAddress ( email: string ): boolean {
        return email.match( FULL_EMAIL_ADDRESS_REGEX ) !== null || email.match( EMAIL_ADDRESS_REGEX ) !== null;
    }

}
