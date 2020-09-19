"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const PacketBatch_1 = require("../network/bedrock/PacketBatch");
const PlayStatus_1 = require("../network/bedrock/PlayStatus");
const StartGame_1 = require("../network/bedrock/StartGame");
const PacketBundle_1 = require("../network/raknet/PacketBundle");
const world_1 = require("../types/world");
const protocol_1 = require("../types/protocol");
const parseBundledPackets_1 = require("../utils/parseBundledPackets");
const data_1 = require("../types/data");
const BinaryData_1 = require("../utils/BinaryData");
describe('Splitting', () => {
    it('splits shit correctly', () => {
        const batch = new PacketBatch_1.PacketBatch({
            packets: [
                new PlayStatus_1.PlayStatus({
                    status: world_1.PlayStatusType.SUCCESS,
                }),
            ],
        });
        const mtuSize = protocol_1.Protocol.DEFAULT_MTU;
        const [bundles] = parseBundledPackets_1.bundlePackets([batch], 0, -1, mtuSize);
        expect(bundles.length).toBe(1);
    });
    it('splits correctly', () => {
        const batch = new PacketBatch_1.PacketBatch({
            packets: [
                new StartGame_1.StartGame({
                    entityUniqueId: 1n,
                    entityRuntimeId: 1n,
                    playerPosition: new data_1.PlayerPosition(0, 0, 0, 0, 0),
                    enableNewInventorySystem: true,
                    playerGamemode: 2,
                }),
            ],
        });
        const mtuSize = protocol_1.Protocol.DEFAULT_MTU;
        const [bundles] = parseBundledPackets_1.bundlePackets([batch], 0, -1, mtuSize);
        expect(bundles.length).toBeGreaterThan(1);
        const splitQueue = {};
        for (const [, bundle] of bundles.entries()) {
            const encoded = new BinaryData_1.BinaryData(bundle.encode().toBuffer());
            expect(encoded.length).toBeLessThanOrEqual(mtuSize);
            const { packets } = new PacketBundle_1.PacketBundle().decode(encoded);
            for (const packet of packets) {
                const props = packet.props;
                expect(props.hasSplit).toBe(true);
                expect(packet.hasBeenProcessed).toBe(false);
                if (props.splitIndex === 0) {
                    packet.data.pos = packet.data.length;
                    splitQueue[packet.props.splitId] = packet;
                }
                else {
                    const queue = splitQueue[props.splitId];
                    expect(queue).toBeTruthy();
                    queue.append(packet.data);
                    if (props.splitIndex === props.splitCount - 1) {
                        queue.data.pos = 0;
                        queue.decode();
                        queue.hasBeenProcessed = true;
                        expect(queue).toBeInstanceOf(PacketBatch_1.PacketBatch);
                        expect(queue.props.packets[0]).toBeInstanceOf(StartGame_1.StartGame);
                        console.log(queue.props.packets[0].props);
                    }
                }
            }
        }
    });
});
