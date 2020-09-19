"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PacketViolationSeverity = exports.PacketViolationType = exports.DummyAddress = exports.Protocol = exports.Packets = void 0;
var Packets;
(function (Packets) {
    /* RAKNET (Raw) */
    Packets[Packets["CONNECTED_PING"] = 0] = "CONNECTED_PING";
    Packets[Packets["UNCONNECTED_PING"] = 1] = "UNCONNECTED_PING";
    Packets[Packets["PING_OPEN_CONNECTIONS"] = 2] = "PING_OPEN_CONNECTIONS";
    Packets[Packets["CONNECTED_PONG"] = 3] = "CONNECTED_PONG";
    Packets[Packets["OPEN_CONNECTION_REQUEST_ONE"] = 5] = "OPEN_CONNECTION_REQUEST_ONE";
    Packets[Packets["OPEN_CONNECTION_REPLY_ONE"] = 6] = "OPEN_CONNECTION_REPLY_ONE";
    Packets[Packets["OPEN_CONNECTION_REQUEST_TWO"] = 7] = "OPEN_CONNECTION_REQUEST_TWO";
    Packets[Packets["OPEN_CONNECTION_REPLY_TWO"] = 8] = "OPEN_CONNECTION_REPLY_TWO";
    Packets[Packets["UNCONNECTED_PONG"] = 28] = "UNCONNECTED_PONG";
    /* RAKNET (Bundled) */
    Packets[Packets["CONNECTION_REQUEST"] = 9] = "CONNECTION_REQUEST";
    Packets[Packets["CONNECTION_REQUEST_ACCEPTED"] = 16] = "CONNECTION_REQUEST_ACCEPTED";
    Packets[Packets["NEW_INCOMING_CONNECTION"] = 19] = "NEW_INCOMING_CONNECTION";
    Packets[Packets["DISCONNECTION_NOTIFICATION"] = 21] = "DISCONNECTION_NOTIFICATION";
    Packets[Packets["INCOMPATIBLE_PROTOCOL"] = 25] = "INCOMPATIBLE_PROTOCOL";
    Packets[Packets["ACK"] = 192] = "ACK";
    Packets[Packets["NAK"] = 160] = "NAK";
    Packets[Packets["DATA_PACKET_0"] = 128] = "DATA_PACKET_0";
    Packets[Packets["DATA_PACKET_1"] = 129] = "DATA_PACKET_1";
    Packets[Packets["DATA_PACKET_2"] = 130] = "DATA_PACKET_2";
    Packets[Packets["DATA_PACKET_3"] = 131] = "DATA_PACKET_3";
    Packets[Packets["DATA_PACKET_4"] = 132] = "DATA_PACKET_4";
    Packets[Packets["DATA_PACKET_5"] = 133] = "DATA_PACKET_5";
    Packets[Packets["DATA_PACKET_6"] = 134] = "DATA_PACKET_6";
    Packets[Packets["DATA_PACKET_7"] = 135] = "DATA_PACKET_7";
    Packets[Packets["DATA_PACKET_8"] = 136] = "DATA_PACKET_8";
    Packets[Packets["DATA_PACKET_9"] = 137] = "DATA_PACKET_9";
    Packets[Packets["DATA_PACKET_A"] = 138] = "DATA_PACKET_A";
    Packets[Packets["DATA_PACKET_B"] = 139] = "DATA_PACKET_B";
    Packets[Packets["DATA_PACKET_C"] = 140] = "DATA_PACKET_C";
    Packets[Packets["DATA_PACKET_D"] = 141] = "DATA_PACKET_D";
    Packets[Packets["DATA_PACKET_E"] = 142] = "DATA_PACKET_E";
    Packets[Packets["DATA_PACKET_F"] = 143] = "DATA_PACKET_F";
    Packets[Packets["PACKET_BATCH"] = 254] = "PACKET_BATCH";
    /* BEDROCK (Batched) */
    Packets[Packets["LOGIN"] = 1] = "LOGIN";
    Packets[Packets["PLAY_STATUS"] = 2] = "PLAY_STATUS";
    Packets[Packets["DISCONNECT"] = 5] = "DISCONNECT";
    Packets[Packets["RESOURCE_PACKS_INFO"] = 6] = "RESOURCE_PACKS_INFO";
    Packets[Packets["RESOURCE_PACKS_STACK"] = 7] = "RESOURCE_PACKS_STACK";
    Packets[Packets["RESOURCE_PACKS_RESPONSE"] = 8] = "RESOURCE_PACKS_RESPONSE";
    Packets[Packets["TEXT"] = 9] = "TEXT";
    Packets[Packets["SET_TIME"] = 10] = "SET_TIME";
    Packets[Packets["START_GAME"] = 11] = "START_GAME";
    Packets[Packets["MOVE_PLAYER"] = 19] = "MOVE_PLAYER";
    Packets[Packets["TICK_SYNC"] = 23] = "TICK_SYNC";
    Packets[Packets["UPDATE_ATTRIBUTES"] = 29] = "UPDATE_ATTRIBUTES";
    Packets[Packets["ENTITY_NOTIFICATION"] = 39] = "ENTITY_NOTIFICATION";
    Packets[Packets["SET_SPAWN_POSITION"] = 43] = "SET_SPAWN_POSITION";
    Packets[Packets["RESPAWN"] = 45] = "RESPAWN";
    Packets[Packets["CONTAINER_NOTIFICATION"] = 49] = "CONTAINER_NOTIFICATION";
    Packets[Packets["ADVENTURE_SETTINGS"] = 55] = "ADVENTURE_SETTINGS";
    Packets[Packets["LEVEL_CHUNK"] = 58] = "LEVEL_CHUNK";
    Packets[Packets["CHANGE_DIMENSION"] = 61] = "CHANGE_DIMENSION";
    Packets[Packets["SET_GAMEMODE"] = 62] = "SET_GAMEMODE";
    Packets[Packets["PLAYER_LIST"] = 63] = "PLAYER_LIST";
    Packets[Packets["REQUEST_CHUNK_RADIUS"] = 69] = "REQUEST_CHUNK_RADIUS";
    Packets[Packets["CHUNK_RADIUS_UPDATED"] = 70] = "CHUNK_RADIUS_UPDATED";
    Packets[Packets["AVAILABLE_COMMANDS"] = 76] = "AVAILABLE_COMMANDS";
    Packets[Packets["TRANSFER"] = 85] = "TRANSFER";
    Packets[Packets["SET_TITLE"] = 88] = "SET_TITLE";
    Packets[Packets["SET_LOCAL_PLAYER_INITIALIZED"] = 113] = "SET_LOCAL_PLAYER_INITIALIZED";
    Packets[Packets["ENTITY_DEFINITION_LIST"] = 119] = "ENTITY_DEFINITION_LIST";
    Packets[Packets["NETWORK_CHUNK_PUBLISHER"] = 121] = "NETWORK_CHUNK_PUBLISHER";
    Packets[Packets["BIOME_DEFINITION_LIST"] = 122] = "BIOME_DEFINITION_LIST";
    Packets[Packets["PACKET_VIOLATION_WARNING"] = 156] = "PACKET_VIOLATION_WARNING";
})(Packets = exports.Packets || (exports.Packets = {}));
exports.Protocol = {
    PROTOCOL_VERSION: 10,
    BEDROCK_VERSION: '1.16.40',
    SERVER_ID: 925686942n,
    SYSTEM_ADDRESSES: 20,
    DEFAULT_MTU: 1347,
    MAGIC: '\x00\xff\xff\x00\xfe\xfe\xfe\xfe\xfd\xfd\xfd\xfd\x12\x34\x56\x78',
};
exports.DummyAddress = {
    ip: '0.0.0.0',
    port: 19132,
    family: 4,
};
var PacketViolationType;
(function (PacketViolationType) {
    PacketViolationType[PacketViolationType["MALFORMED"] = 0] = "MALFORMED";
})(PacketViolationType = exports.PacketViolationType || (exports.PacketViolationType = {}));
var PacketViolationSeverity;
(function (PacketViolationSeverity) {
    PacketViolationSeverity[PacketViolationSeverity["WARNING"] = 0] = "WARNING";
    PacketViolationSeverity[PacketViolationSeverity["FINAL_WARNING"] = 1] = "FINAL_WARNING";
    PacketViolationSeverity[PacketViolationSeverity["TERMINATING_CONNECTION"] = 2] = "TERMINATING_CONNECTION";
})(PacketViolationSeverity = exports.PacketViolationSeverity || (exports.PacketViolationSeverity = {}));
