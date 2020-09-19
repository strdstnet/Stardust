"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MovePlayer = exports.MovePlayerMode = void 0;
const protocol_1 = require("../../types/protocol");
const data_1 = require("../../types/data");
const Packet_1 = require("../Packet");
const BatchedPacket_1 = require("../bedrock/BatchedPacket");
var MovePlayerMode;
(function (MovePlayerMode) {
    MovePlayerMode[MovePlayerMode["NORMAL"] = 0] = "NORMAL";
    MovePlayerMode[MovePlayerMode["RESET"] = 1] = "RESET";
    MovePlayerMode[MovePlayerMode["TELEPORT"] = 2] = "TELEPORT";
    MovePlayerMode[MovePlayerMode["PITCH"] = 3] = "PITCH";
})(MovePlayerMode = exports.MovePlayerMode || (exports.MovePlayerMode = {}));
const def = (val) => () => val;
class MovePlayer extends BatchedPacket_1.BatchedPacket {
    constructor(p) {
        super(protocol_1.Packets.MOVE_PLAYER, [
            { name: 'runtimeEntityId', parser: data_1.DataType.U_VARLONG },
            { name: 'positionX', parser: data_1.DataType.L_FLOAT },
            { name: 'positionY', parser: data_1.DataType.L_FLOAT },
            { name: 'positionZ', parser: data_1.DataType.L_FLOAT },
            { name: 'pitch', parser: data_1.DataType.L_FLOAT },
            { name: 'yaw', parser: data_1.DataType.L_FLOAT },
            { name: 'headYaw', parser: data_1.DataType.L_FLOAT },
            { name: 'mode', parser: data_1.DataType.BYTE, resolve: def(MovePlayerMode.NORMAL) },
            { name: 'onGround', parser: data_1.DataType.U_VARLONG },
            { name: 'ridingEntityRuntimeId', parser: data_1.DataType.U_VARLONG },
            {
                parser({ type, data, props }) {
                    if (type === Packet_1.ParserType.ENCODE) {
                        if (props.mode === MovePlayerMode.TELEPORT) {
                            data.writeLInt(props.teleportCause);
                            data.writeLInt(props.teleportItemId);
                        }
                    }
                    else {
                        if (type === Packet_1.ParserType.DECODE) {
                            if (props.mode === MovePlayerMode.TELEPORT) {
                                props.teleportCause = data.readLInt();
                                props.teleportItemId = data.readLInt();
                            }
                        }
                    }
                },
            },
            { name: 'teleportItemId', parser: data_1.DataType.L_INT },
        ]);
        if (p)
            this.props = p;
    }
}
exports.MovePlayer = MovePlayer;
