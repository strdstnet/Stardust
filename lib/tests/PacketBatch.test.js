"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const protocol_1 = require("../types/protocol");
const world_1 = require("../types/world");
const PacketBatch_1 = require("../network/bedrock/PacketBatch");
const ChangeDimension_1 = require("../network/bedrock/ChangeDimension");
const math3d_1 = require("math3d");
describe('PacketBatch', () => {
    it('encodes & decodes single packet correctly', () => {
        const encoded = new PacketBatch_1.PacketBatch({
            packets: [new ChangeDimension_1.ChangeDimension({
                    dimension: world_1.Dimension.END,
                    position: new math3d_1.Vector3(1, 2, 3),
                    respawn: true,
                })],
        }).encode();
        const decoded = new PacketBatch_1.PacketBatch().decode(encoded.clone());
        expect(decoded.packets.length).toEqual(1);
        expect(decoded.packets[0].id).toEqual(protocol_1.Packets.CHANGE_DIMENSION);
    });
    it('encodes & decodes mutiple packets correctly', () => {
        const encoded = new PacketBatch_1.PacketBatch({
            packets: [
                new ChangeDimension_1.ChangeDimension({
                    dimension: world_1.Dimension.END,
                    position: new math3d_1.Vector3(1, 2, 3),
                    respawn: true,
                }),
                new ChangeDimension_1.ChangeDimension({
                    dimension: world_1.Dimension.NETHER,
                    position: new math3d_1.Vector3(3, 1, 2),
                    respawn: false,
                }),
            ],
        }).encode();
        const decoded = new PacketBatch_1.PacketBatch().decode(encoded.clone());
        expect(decoded.packets.length).toEqual(2);
        expect(decoded.packets[0].id).toEqual(protocol_1.Packets.CHANGE_DIMENSION);
        expect(decoded.packets[1].id).toEqual(protocol_1.Packets.CHANGE_DIMENSION);
    });
});
