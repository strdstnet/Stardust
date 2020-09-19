"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnconnectedPong = void 0;
const Packet_1 = require("../Packet");
const protocol_1 = require("../../types/protocol");
const data_1 = require("../../types/data");
class UnconnectedPong extends Packet_1.Packet {
    static getMOTD({ line1, line2, maxPlayers, numPlayers }) {
        return `MCPE;${line1};27;${protocol_1.Protocol.BEDROCK_VERSION};${numPlayers};${maxPlayers};0;${line2}`;
    }
    static parseMOTD(motd) {
        const parts = motd.split(';');
        return {
            line1: parts[1],
            line2: parts[7],
            maxPlayers: parseInt(parts[5], 10),
            numPlayers: parseInt(parts[4], 10),
        };
    }
    constructor(p) {
        super(protocol_1.Packets.UNCONNECTED_PONG, [
            { name: 'pingId', parser: data_1.DataType.LONG },
            { parser: data_1.DataType.LONG, resolve: () => protocol_1.Protocol.SERVER_ID },
            { name: 'magic', parser: data_1.DataType.MAGIC },
            { name: 'motd', parser: data_1.DataType.RAW_STRING },
        ]);
        if (p)
            this.props = p;
    }
}
exports.UnconnectedPong = UnconnectedPong;
