"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PacketBatch = void 0;
const protocol_1 = require("../../types/protocol");
const BinaryData_1 = require("../../utils/BinaryData");
const UnknownBatchedPacket_1 = require("../custom/UnknownBatchedPacket");
const Packet_1 = require("../Packet");
const BundledPacket_1 = require("../raknet/BundledPacket");
const ChangeDimension_1 = require("./ChangeDimension");
const ChunkRadiusUpdated_1 = require("./ChunkRadiusUpdated");
const Login_1 = require("./Login");
const PacketViolationWarning_1 = require("./PacketViolationWarning");
const PlayStatus_1 = require("./PlayStatus");
const ResourcePacksInfo_1 = require("./ResourcePacksInfo");
const ResourcePacksResponse_1 = require("./ResourcePacksResponse");
const SetTitle_1 = require("./SetTitle");
const StartGame_1 = require("./StartGame");
const Text_1 = require("./Text");
const Transfer_1 = require("./Transfer");
class PacketBatch extends BundledPacket_1.BundledPacket {
    constructor(p) {
        super(protocol_1.Packets.PACKET_BATCH, [
            {
                parser({ type, data, props }) {
                    if (type === Packet_1.ParserType.DECODE) {
                        props.packets = [];
                        const buffer = BinaryData_1.BinaryData.inflate(data.readRemaining()); //
                        while (!buffer.feof) {
                            // const posBefore = buffer.pos
                            const length = buffer.readUnsignedVarInt();
                            const buf = new BinaryData_1.BinaryData(buffer.read(length));
                            const header = buf.readUnsignedVarInt();
                            const packetId = header & PacketBatch.PID_MASK;
                            let packet = null;
                            // TODO: Make automatic, somehow
                            switch (packetId) {
                                case protocol_1.Packets.LOGIN:
                                    packet = new Login_1.Login();
                                    break;
                                case protocol_1.Packets.PLAY_STATUS:
                                    packet = new PlayStatus_1.PlayStatus();
                                    break;
                                case protocol_1.Packets.TRANSFER:
                                    packet = new Transfer_1.Transfer();
                                    break;
                                case protocol_1.Packets.CHANGE_DIMENSION:
                                    packet = new ChangeDimension_1.ChangeDimension();
                                    break;
                                case protocol_1.Packets.PACKET_VIOLATION_WARNING:
                                    packet = new PacketViolationWarning_1.PacketViolationWarning();
                                    break;
                                case protocol_1.Packets.SET_TITLE:
                                    packet = new SetTitle_1.SetTitle();
                                    break;
                                case protocol_1.Packets.RESOURCE_PACKS_INFO:
                                    packet = new ResourcePacksInfo_1.ResourcePacksInfo();
                                    break;
                                case protocol_1.Packets.RESOURCE_PACKS_RESPONSE:
                                    packet = new ResourcePacksResponse_1.ResourcePacksResponse();
                                    break;
                                case protocol_1.Packets.START_GAME:
                                    packet = new StartGame_1.StartGame();
                                    break;
                                case protocol_1.Packets.CHUNK_RADIUS_UPDATED:
                                    packet = new ChunkRadiusUpdated_1.ChunkRadiusUpdated();
                                    break;
                                case protocol_1.Packets.TEXT:
                                    packet = new Text_1.Text();
                                    break;
                                // case Packets.RESOURCE_PACKS_STACK:
                                //   packet = new BatchedPacket(packetId, [])
                                //   break
                                default:
                                    packet = new UnknownBatchedPacket_1.UnknownBatchedPacket(packetId, []);
                                // console.log(packetId)
                                // console.log(buffer.buf)
                                // console.log(buf.buf)
                                // console.log(length)
                                // console.log(buffer.length)
                                // console.log(packet)
                                // if(true) (process as any).exit()
                            }
                            if (packet) {
                                // buf.pos = 0
                                packet.decode(buf);
                                props.packets.push(packet);
                            }
                            // buffer.pos = posBefore + length
                        }
                    }
                    else {
                        const uncompressed = new BinaryData_1.BinaryData();
                        if (!Array.isArray(props.packets)) {
                            console.log(props);
                            throw new Error('wot');
                        }
                        for (const packet of props.packets) {
                            const packetData = new BinaryData_1.BinaryData();
                            packetData.writeUnsignedVarInt(packet.id |
                                (PacketBatch.senderSubId << PacketBatch.SENDER_SUBCLIENT_ID_SHIFT) |
                                (PacketBatch.recipientSubId << PacketBatch.RECIPIENT_SUBCLIENT_ID_SHIFT));
                            packetData.append(packet.encode().toBuffer());
                            uncompressed.writeUnsignedVarInt(packetData.length);
                            uncompressed.append(packetData.toBuffer());
                        }
                        data.append(BinaryData_1.BinaryData.deflate(uncompressed.toBuffer()).toBuffer());
                    }
                },
            },
        ]);
        if (p)
            this.props = Object.assign({}, BundledPacket_1.BundledPacket.defaultProps, p);
    }
}
exports.PacketBatch = PacketBatch;
PacketBatch.PID_MASK = 0x3ff;
PacketBatch.SENDER_SUBCLIENT_ID_SHIFT = 0x0A;
PacketBatch.RECIPIENT_SUBCLIENT_ID_SHIFT = 0x0C;
PacketBatch.senderSubId = 0;
PacketBatch.recipientSubId = 0;
