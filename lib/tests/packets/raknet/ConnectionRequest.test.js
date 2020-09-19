"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ConnectionRequest_1 = require("../../../network/raknet/ConnectionRequest");
describe('ConnectionRequest', () => {
    it('encodes & decodes correctly', () => {
        const sendPingTime = 100n;
        const clientId = 0x00000000003c6d0dn;
        const hasSecurity = false;
        const encoded = new ConnectionRequest_1.ConnectionRequest({
            sendPingTime,
            clientId,
            hasSecurity,
        }).encode();
        const decoded = new ConnectionRequest_1.ConnectionRequest().decode(encoded.clone());
        expect(decoded.sendPingTime).toEqual(sendPingTime);
        expect(decoded.clientId).toEqual(clientId);
        expect(decoded.hasSecurity).toEqual(hasSecurity);
    });
});
