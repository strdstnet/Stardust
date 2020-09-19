"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlayerPosition = exports.DataType = exports.FLOAT_MAX_VAL = void 0;
const math3d_1 = require("math3d");
exports.FLOAT_MAX_VAL = 340282346638528859811704183484516925440;
var DataType;
(function (DataType) {
    DataType[DataType["BYTE"] = 0] = "BYTE";
    DataType[DataType["LONG"] = 1] = "LONG";
    DataType[DataType["MAGIC"] = 2] = "MAGIC";
    DataType[DataType["INT"] = 3] = "INT";
    DataType[DataType["SHORT"] = 4] = "SHORT";
    DataType[DataType["STRING"] = 5] = "STRING";
    DataType[DataType["RAW_STRING"] = 6] = "RAW_STRING";
    DataType[DataType["SECURITY"] = 7] = "SECURITY";
    DataType[DataType["BOOLEAN"] = 8] = "BOOLEAN";
    DataType[DataType["ADDRESS"] = 9] = "ADDRESS";
    DataType[DataType["L_INT"] = 10] = "L_INT";
    DataType[DataType["L_TRIAD"] = 11] = "L_TRIAD";
    DataType[DataType["L_SHORT"] = 12] = "L_SHORT";
    DataType[DataType["L_FLOAT"] = 13] = "L_FLOAT";
    DataType[DataType["L_LONG"] = 14] = "L_LONG";
    DataType[DataType["VECTOR3_FLOAT"] = 15] = "VECTOR3_FLOAT";
    DataType[DataType["VECTOR3_VARINT"] = 16] = "VECTOR3_VARINT";
    DataType[DataType["VECTOR3"] = 17] = "VECTOR3";
    DataType[DataType["VARINT"] = 18] = "VARINT";
    DataType[DataType["U_VARINT"] = 19] = "U_VARINT";
    DataType[DataType["VARLONG"] = 20] = "VARLONG";
    DataType[DataType["U_VARLONG"] = 21] = "U_VARLONG";
    DataType[DataType["CONTAINER_ITEM"] = 22] = "CONTAINER_ITEM";
    DataType[DataType["CHUNK"] = 23] = "CHUNK";
})(DataType = exports.DataType || (exports.DataType = {}));
class PlayerPosition {
    constructor(locationX, locationY, locationZ, pitch, yaw) {
        this.pitch = pitch;
        this.yaw = yaw;
        this.location = new math3d_1.Vector3(locationX, locationY, locationZ);
    }
}
exports.PlayerPosition = PlayerPosition;
