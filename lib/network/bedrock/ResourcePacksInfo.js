"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResourcePacksInfo = void 0;
const protocol_1 = require("../../types/protocol");
const data_1 = require("../../types/data");
const BatchedPacket_1 = require("../bedrock/BatchedPacket");
const Packet_1 = require("../Packet");
function parsePacks(behaviourPacks) {
    return ({ type, data, props }) => {
        const prop = behaviourPacks ? 'behaviourPacks' : 'resourcePacks';
        if (type === Packet_1.ParserType.DECODE) {
            props[prop] = [];
            const count = data.readLShort();
            for (let i = 0; i < count; i++) {
                props[prop].push({
                    id: data.readString(),
                    version: data.readString(),
                    size: data.readLLong(),
                    encryptionKey: data.readString(),
                    subPackName: data.readString(),
                    contentId: data.readString(),
                    hasScripts: data.readBoolean(),
                });
            }
        }
        else {
            data.writeLShort(props[prop].length);
            for (const pack of props[prop]) {
                data.writeString(pack.id);
                data.writeString(pack.version);
                data.writeLLong(pack.size);
                data.writeString(pack.encryptionKey);
                data.writeString(pack.subPackName);
                data.writeString(pack.contentId);
                data.writeBoolean(pack.hasScripts);
            }
        }
    };
}
class ResourcePacksInfo extends BatchedPacket_1.BatchedPacket {
    constructor(p) {
        super(protocol_1.Packets.RESOURCE_PACKS_INFO, [
            { name: 'mustAccept', parser: data_1.DataType.BOOLEAN },
            { name: 'hasScripts', parser: data_1.DataType.BOOLEAN },
            { parser: parsePacks(true) },
            { parser: parsePacks(false) },
        ]);
        if (p)
            this.props = Object.assign({}, p);
    }
}
exports.ResourcePacksInfo = ResourcePacksInfo;
