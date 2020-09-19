"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const NewIncomingConnection_1 = require("../../../network/raknet/NewIncomingConnection");
const protocol_1 = require("../../../types/protocol");
describe('NewIncomingConnection', () => {
    it('encodes & decodes correctly', () => {
        const address = { ip: '83.1.157.191', port: 12345, family: 4 };
        const systemAddresses = new Array(protocol_1.Protocol.SYSTEM_ADDRESSES).fill({ ip: '83.1.157.191', port: 12345, family: 4 });
        const pingTime = 100n;
        const pongTime = 101n;
        const encoded = new NewIncomingConnection_1.NewIncomingConnection({
            address,
            systemAddresses,
            pingTime,
            pongTime,
        }).encode();
        const decoded = new NewIncomingConnection_1.NewIncomingConnection().decode(encoded.clone());
        expect(decoded.address).toEqual(address);
        expect(decoded.systemAddresses).toEqual(systemAddresses);
        expect(decoded.pingTime).toEqual(pingTime);
        expect(decoded.pongTime).toEqual(pongTime);
    });
});
