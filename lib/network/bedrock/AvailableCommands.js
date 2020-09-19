"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AvailableCommands = void 0;
const protocol_1 = require("../../types/protocol");
const Packet_1 = require("../Packet");
const BatchedPacket_1 = require("../bedrock/BatchedPacket");
// TODO: Implement Commands
class AvailableCommands extends BatchedPacket_1.BatchedPacket {
    constructor(p) {
        super(protocol_1.Packets.AVAILABLE_COMMANDS, [
            {
                parser({ type, data }) {
                    if (type === Packet_1.ParserType.ENCODE) {
                        data.writeUnsignedVarInt(0);
                        data.writeUnsignedVarInt(0);
                        data.writeUnsignedVarInt(0);
                        data.writeUnsignedVarInt(0);
                        data.writeUnsignedVarInt(0);
                        data.writeUnsignedVarInt(0);
                    }
                    else {
                        // TODO: DECODE
                    }
                },
            },
        ]);
        if (p)
            this.props = Object.assign({}, p);
    }
}
exports.AvailableCommands = AvailableCommands;
