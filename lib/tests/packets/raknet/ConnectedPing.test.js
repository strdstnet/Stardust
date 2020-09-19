"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ConnectedPing_1 = require("../../../network/raknet/ConnectedPing");
describe('ConnectedPing', () => {
    it('encodes & decodes correctly', () => {
        const time = 100n;
        const encoded = new ConnectedPing_1.ConnectedPing({
            time,
        }).encode();
        const decoded = new ConnectedPing_1.ConnectedPing().decode(encoded.clone());
        expect(decoded.time).toEqual(time);
    });
});
