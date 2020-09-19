"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnectionRequestAccepted = void 0;
const BundledPacket_1 = require("./BundledPacket");
const protocol_1 = require("../../types/protocol");
const data_1 = require("../../types/data");
const Packet_1 = require("../Packet");
class ConnectionRequestAccepted extends BundledPacket_1.BundledPacket {
    constructor(p) {
        super(protocol_1.Packets.CONNECTION_REQUEST_ACCEPTED, [
            { name: 'address', parser: data_1.DataType.ADDRESS },
            { name: 'systemIndex', parser: data_1.DataType.SHORT },
            {
                parser({ type, data, props }) {
                    if (type === Packet_1.ParserType.DECODE) {
                        props.systemAddresses = [];
                        for (let i = 0; i < protocol_1.Protocol.SYSTEM_ADDRESSES; i++) {
                            props.systemAddresses.push(data.readAddress());
                        }
                    }
                    else {
                        for (const address of props.systemAddresses) {
                            data.writeAddress(address);
                        }
                    }
                },
            },
            { name: 'requestTime', parser: data_1.DataType.LONG },
            { name: 'time', parser: data_1.DataType.LONG },
        ]);
        if (p)
            this.props = Object.assign({}, BundledPacket_1.BundledPacket.defaultProps, p);
    }
}
exports.ConnectionRequestAccepted = ConnectionRequestAccepted;
