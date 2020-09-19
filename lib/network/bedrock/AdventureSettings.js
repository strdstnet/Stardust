"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdventureSettings = void 0;
const protocol_1 = require("../../types/protocol");
const world_1 = require("../../types/world");
const Packet_1 = require("../Packet");
const BatchedPacket_1 = require("../bedrock/BatchedPacket");
class AdventureSettings extends BatchedPacket_1.BatchedPacket {
    constructor(p) {
        super(protocol_1.Packets.ADVENTURE_SETTINGS, [
            {
                parser({ type, data, props }) {
                    if (type === Packet_1.ParserType.ENCODE) {
                        let flags = 0;
                        let flags2 = -1;
                        for (const [flag, value] of props.flags) {
                            if ((flag & world_1.BITFLAG_SECOND_SET) !== 0) {
                                if (value)
                                    flags2 |= flag;
                                else
                                    flags2 &= ~flag;
                            }
                            else {
                                if (value)
                                    flags |= flag;
                                else
                                    flags &= ~flag;
                            }
                        }
                        data.writeUnsignedVarInt(flags);
                        data.writeUnsignedVarInt(props.commandPermission);
                        data.writeUnsignedVarInt(flags2);
                        data.writeUnsignedVarInt(props.playerPermission);
                        data.writeUnsignedVarInt(0);
                        data.writeLLong(BigInt(props.entityUniqueId));
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
exports.AdventureSettings = AdventureSettings;
