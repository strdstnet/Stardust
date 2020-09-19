"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseBundledPackets = exports.bundlePackets = exports.encodeBundledPacket = exports.decodeBundledPacket = void 0;
const DisconnectionNotification_1 = require("../network/bedrock/DisconnectionNotification");
const PacketBatch_1 = require("../network/bedrock/PacketBatch");
const PartialPacket_1 = require("../network/custom/PartialPacket");
const UnknownBundledPacket_1 = require("../network/custom/UnknownBundledPacket");
const BundledPacket_1 = require("../network/raknet/BundledPacket");
const ConnectedPing_1 = require("../network/raknet/ConnectedPing");
const ConnectedPong_1 = require("../network/raknet/ConnectedPong");
const ConnectionRequest_1 = require("../network/raknet/ConnectionRequest");
const ConnectionRequestAccepted_1 = require("../network/raknet/ConnectionRequestAccepted");
const NewIncomingConnection_1 = require("../network/raknet/NewIncomingConnection");
const PacketBundle_1 = require("../network/raknet/PacketBundle");
const protocol_1 = require("../types/protocol");
const BinaryData_1 = require("./BinaryData");
function decodeBundledPacket(data) {
    const flags = data.readByte();
    const length = Math.ceil(data.readShort() / 8);
    const props = {
        id: 0,
        reliability: (flags & 0xe0) >> 5,
        hasSplit: (flags & 0x10) > 0,
        messageIndex: 0,
        sequenceIndex: 0,
        orderIndex: 0,
        orderChannel: 0,
        splitCount: 0,
        splitId: 0,
        splitIndex: 0,
    };
    if (BundledPacket_1.BundledPacket.isReliable(props.reliability))
        props.messageIndex = data.readLTriad();
    if (BundledPacket_1.BundledPacket.isSequenced(props.reliability))
        props.sequenceIndex = data.readLTriad();
    if (BundledPacket_1.BundledPacket.isSequencedOrOrdered(props.reliability)) {
        props.orderIndex = data.readLTriad();
        props.orderChannel = data.readByte();
    }
    if (props.hasSplit) {
        props.splitCount = data.readInt();
        props.splitId = data.readShort();
        props.splitIndex = data.readInt();
    }
    return [props, length];
}
exports.decodeBundledPacket = decodeBundledPacket;
function encodeBundledPacket(packet) {
    const data = new BinaryData_1.BinaryData();
    const packetData = packet.data || packet.encode(packet.props);
    packet.encodeBundleHeader(packetData, data);
    return packet.data;
}
exports.encodeBundledPacket = encodeBundledPacket;
/**
 * @return [PacketBundle[], sequenceNumber, splitId]
 */
function bundlePackets(packets, _sequenceNumber = 0, _lastSplitId = -1, mtuSize = protocol_1.Protocol.DEFAULT_MTU) {
    let sequenceNumber = _sequenceNumber + 0;
    let lastSplitId = _lastSplitId + 0;
    // IP header size (20 bytes) + UDP header size (8 bytes) + RakNet weird (8 bytes) + datagram header size (4 bytes) + max encapsulated packet header size (20 bytes)
    const maxLength = mtuSize - 60;
    const bundles = [];
    for (const packet of packets) {
        const packetData = packet.encode();
        if (packetData.length > maxLength) {
            const dataParts = packetData.split(maxLength);
            const splitId = ++lastSplitId % 65536;
            for (const [idx, dataPart] of dataParts.entries()) {
                const partial = new PartialPacket_1.PartialPacket(packet.id);
                partial.props = Object.assign({}, packet.props);
                partial.props.hasSplit = true;
                partial.props.splitId = splitId;
                partial.props.splitCount = dataParts.length;
                partial.props.splitIndex = idx;
                partial.encodeBundleHeader(dataPart);
                bundles.push(new PacketBundle_1.PacketBundle({
                    sequenceNumber: ++sequenceNumber,
                    packets: [partial],
                }));
            }
        }
        else {
            packet.encodeBundleHeader(packetData);
            bundles.push(new PacketBundle_1.PacketBundle({
                sequenceNumber: ++sequenceNumber,
                packets: [packet],
            }));
        }
    }
    return [bundles, sequenceNumber, lastSplitId];
}
exports.bundlePackets = bundlePackets;
function parseBundledPackets(data) {
    const packets = [];
    while (!data.feof) {
        const [props, length] = decodeBundledPacket(data);
        const posBefore = data.pos;
        const packetId = data.buf[data.pos];
        let packet = null;
        // if(props.hasSplit) {
        if (props.hasSplit && props.splitIndex > 0) {
            // if(props.splitIndex < props.splitCount - 1) {
            packet = new PartialPacket_1.PartialPacket(packetId);
            // } else {
            //   packet = new ReassembledPacket()
            // }
        }
        else {
            switch (packetId) {
                case protocol_1.Packets.CONNECTION_REQUEST:
                    packet = new ConnectionRequest_1.ConnectionRequest();
                    break;
                case protocol_1.Packets.CONNECTION_REQUEST_ACCEPTED:
                    packet = new ConnectionRequestAccepted_1.ConnectionRequestAccepted();
                    break;
                case protocol_1.Packets.NEW_INCOMING_CONNECTION:
                    packet = new NewIncomingConnection_1.NewIncomingConnection();
                    break;
                case protocol_1.Packets.CONNECTED_PING:
                    packet = new ConnectedPing_1.ConnectedPing();
                    break;
                case protocol_1.Packets.CONNECTED_PONG:
                    packet = new ConnectedPong_1.ConnectedPong();
                    break;
                case protocol_1.Packets.PACKET_BATCH:
                    packet = new PacketBatch_1.PacketBatch();
                    break;
                case protocol_1.Packets.DISCONNECTION_NOTIFICATION:
                    packet = new DisconnectionNotification_1.DisconnectionNotification();
                    break;
                default:
                    packet = new UnknownBundledPacket_1.UnknownBundledPacket(packetId);
                // console.log(`UNKNOWN BUNDLED: ${packetId}`)
                // throw new Error(`Unknown packet: (dec) ${data.buf[data.pos]}`)
            }
        }
        packet.props = props;
        if (props.hasSplit) {
            packet.data = data.readByteArray(length);
        }
        else {
            packet.decode(new BinaryData_1.BinaryData(data.read(length)), props);
        }
        packets.push(packet);
        data.pos = posBefore + length;
    }
    return packets;
}
exports.parseBundledPackets = parseBundledPackets;
