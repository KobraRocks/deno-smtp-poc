import type { List, SecurityProtocol } from "./smtp.ts";


const ProtocolList: List<SecurityProtocol> = {
    BASIC: "BASIC",
    TLS: "TLS",
    STARTTLS: "STARTTLS"
};

const StdPortList: List< number> = {
    BASIC: 25,
    TLS:465,
    STARTTLS: 587,
};

export {
    ProtocolList,
    StdPortList
}