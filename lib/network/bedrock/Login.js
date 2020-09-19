"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Login = void 0;
const Packet_1 = require("../Packet");
const BatchedPacket_1 = require("../bedrock/BatchedPacket");
const protocol_1 = require("../../types/protocol");
const data_1 = require("../../types/data");
const JWT_1 = require("../../utils/JWT");
const BinaryData_1 = require("../../utils/BinaryData");
class Login extends BatchedPacket_1.BatchedPacket {
    constructor(p) {
        super(protocol_1.Packets.LOGIN, [
            { name: 'protocol', parser: data_1.DataType.INT },
            {
                parser({ type, data, props }) {
                    if (type === Packet_1.ParserType.DECODE) {
                        const sub = data.readByteArray();
                        const chainDataStr = props.chainData = sub.readString(sub.readLInt());
                        const chainData = JSON.parse(chainDataStr);
                        for (const token of chainData.chain) {
                            const payload = JWT_1.decodeJWT(token);
                            if (payload.extraData) {
                                props.username = payload.extraData.displayName;
                                props.XUID = payload.extraData.XUID;
                                props.clientUUID = payload.extraData.identity;
                                props.identityPublicKey = payload.identityPublicKey;
                            }
                        }
                        const clientDataStr = props.clientData = sub.readString(sub.readLInt());
                        const clientData = JWT_1.decodeJWT(clientDataStr);
                        props.clientId = BigInt(clientData.ClientRandomId);
                        props.serverAddress = clientData.ServerAddress;
                        Object.assign(props, clientData);
                    }
                    else {
                        const sub = new BinaryData_1.BinaryData();
                        // const pos = data.pos
                        sub.writeLInt(props.chainData.length);
                        sub.writeString(props.chainData, false);
                        sub.writeLInt(props.clientData.length);
                        sub.writeString(props.clientData, false);
                        data.writeByteArray(sub);
                    }
                },
            },
        ]);
        if (p)
            this.props = p;
    }
}
exports.Login = Login;
