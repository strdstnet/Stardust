"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NewIncomingConnection = void 0;
const BundledPacket_1 = require("./BundledPacket");
const protocol_1 = require("../../types/protocol");
const data_1 = require("../../types/data");
const Packet_1 = require("../Packet");
class NewIncomingConnection extends BundledPacket_1.BundledPacket {
    constructor(p) {
        super(protocol_1.Packets.NEW_INCOMING_CONNECTION, [
            { name: 'address', parser: data_1.DataType.ADDRESS },
            {
                parser({ type, data, props }) {
                    if (type === Packet_1.ParserType.ENCODE) {
                        for (const address of props.systemAddresses) {
                            data.writeAddress(address);
                        }
                    }
                    else {
                        props.systemAddresses = [];
                        const stop = data.length - 16;
                        for (let i = 0; i < protocol_1.Protocol.SYSTEM_ADDRESSES; i++) {
                            if (data.pos >= stop) {
                                props.systemAddresses.push(protocol_1.DummyAddress);
                            }
                            else {
                                props.systemAddresses.push(data.readAddress());
                            }
                        }
                    }
                },
            },
            { name: 'pingTime', parser: data_1.DataType.LONG },
            { name: 'pongTime', parser: data_1.DataType.LONG },
        ]);
        if (p)
            this.props = Object.assign({}, BundledPacket_1.BundledPacket.defaultProps, p);
    }
}
exports.NewIncomingConnection = NewIncomingConnection;
