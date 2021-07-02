export declare enum Protocol {
    websocket = "websocket",
    tcp = "tcp"
}
export declare enum Environment {
    Test = "test",
    Prod = "prod"
}
export declare function getStatusFleetNodes(env?: Environment, protocol?: Protocol): Promise<string[]>;
