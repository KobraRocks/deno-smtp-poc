export class ClientRequest {
    constructor ( public command: string, public message: string) {}

    toString () { 
        return this.command.length > 0 ? `${this.command} ${this.message}`: this.message; 
    }
}