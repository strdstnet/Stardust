"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const IncompatibleProtocol_1 = require("../../../network/raknet/IncompatibleProtocol");
const protocol_1 = require("../../../types/protocol");
describe('IncompatibleProtocol', () => {
    it('encodes & decodes correctly', () => {
        const protocol = protocol_1.Protocol.PROTOCOL_VERSION;
        const serverId = protocol_1.Protocol.SERVER_ID;
        const encoded = new IncompatibleProtocol_1.IncompatibleProtocol({
            protocol,
            serverId,
        }).encode();
        const decoded = new IncompatibleProtocol_1.IncompatibleProtocol().decode(encoded.clone());
        expect(decoded.protocol).toEqual(protocol);
        expect(decoded.serverId).toEqual(serverId);
    });
});
