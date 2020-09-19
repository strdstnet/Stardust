"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ConnectedPong_1 = require("../../../network/raknet/ConnectedPong");
describe('ConnectedPong', () => {
    it('encodes & decodes correctly', () => {
        const pingTime = 100n;
        const pongTime = 101n;
        const encoded = new ConnectedPong_1.ConnectedPong({
            pingTime,
            pongTime,
        }).encode();
        const decoded = new ConnectedPong_1.ConnectedPong().decode(encoded.clone());
        expect(decoded.pingTime).toEqual(pingTime);
        expect(decoded.pongTime).toEqual(pongTime);
    });
});
