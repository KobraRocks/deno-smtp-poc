
export class ServerResponse {

    messages: string[] = [];

    code!: number;
    message!: string;
    rowResponse!: string;

    constructor ( rowResponse?: string ) {
        if ( rowResponse ) this.#parse( rowResponse );
    }

    #parse ( rowResponse: string ) {
        this.code = Number( rowResponse.slice(0, 3) );
        this.message = rowResponse.slice(4).trim();
        this.rowResponse = rowResponse;
        this.messages.push( this.message );
    }

    add ( rowResponse: string ) {
        this.#parse( rowResponse );
    }

    requestAuth () {
        return this.message.startsWith('AUTH');
    }

    sentLastLine() {
        return this.rowResponse.startsWith(`${this.code} `);
    }

    toString () {

        return `\n[code]\n${this.code}\n[message]\n${this.messages.join('\n')}`;
    }

}