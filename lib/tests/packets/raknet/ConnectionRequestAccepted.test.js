"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ConnectionRequestAccepted_1 = require("../../../network/raknet/ConnectionRequestAccepted");
const protocol_1 = require("../../../types/protocol");
describe('ConnectionRequestAccepted', () => {
    it('encodes & decodes correctly', () => {
        const address = { ip: '83.1.157.191', port: 12345, family: 4 };
        const systemIndex = 10;
        const systemAddresses = new Array(protocol_1.Protocol.SYSTEM_ADDRESSES).fill({ ip: '83.1.157.191', port: 12345, family: 4 });
        const requestTime = 100n;
        const time = 101n;
        const encoded = new ConnectionRequestAccepted_1.ConnectionRequestAccepted({
            address,
            systemIndex,
            systemAddresses,
            requestTime,
            time,
        }).encode();
        const decoded = new ConnectionRequestAccepted_1.ConnectionRequestAccepted().decode(encoded.clone());
        expect(decoded.address).toEqual(address);
        expect(decoded.systemIndex).toEqual(systemIndex);
        expect(decoded.systemAddresses.length).toEqual(systemAddresses.length);
        for (const [index, addr] of systemAddresses.entries()) {
            expect(decoded.systemAddresses[index]).toEqual(addr);
        }
        expect(decoded.requestTime).toEqual(requestTime);
        expect(decoded.time).toEqual(time);
    });
});
