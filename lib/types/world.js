"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Items = exports.AdventureSettingsFlag = exports.BITFLAG_SECOND_SET = exports.CommandPermissions = exports.PlayerPermissions = exports.GameRuleType = exports.Difficulty = exports.GeneratorType = exports.BiomeType = exports.RespawnState = exports.ResourcePackResponseStatus = exports.PlayStatusType = exports.Gamemode = exports.Dimension = void 0;
var Dimension;
(function (Dimension) {
    Dimension[Dimension["OVERWOLD"] = 0] = "OVERWOLD";
    Dimension[Dimension["NETHER"] = 1] = "NETHER";
    Dimension[Dimension["END"] = 2] = "END";
})(Dimension = exports.Dimension || (exports.Dimension = {}));
var Gamemode;
(function (Gamemode) {
    Gamemode[Gamemode["SURVIVAL"] = 0] = "SURVIVAL";
    Gamemode[Gamemode["CREATIVE"] = 1] = "CREATIVE";
    Gamemode[Gamemode["ADVENTURE"] = 2] = "ADVENTURE";
    Gamemode[Gamemode["SPECTATOR"] = 3] = "SPECTATOR";
})(Gamemode = exports.Gamemode || (exports.Gamemode = {}));
var PlayStatusType;
(function (PlayStatusType) {
    PlayStatusType[PlayStatusType["SUCCESS"] = 0] = "SUCCESS";
    PlayStatusType[PlayStatusType["CLIENT_FAILED"] = 1] = "CLIENT_FAILED";
    PlayStatusType[PlayStatusType["SERVER_FAILED"] = 2] = "SERVER_FAILED";
    PlayStatusType[PlayStatusType["PLAYER_SPAWN"] = 3] = "PLAYER_SPAWN";
    PlayStatusType[PlayStatusType["FAILED_INVALID_TENANT"] = 4] = "FAILED_INVALID_TENANT";
    PlayStatusType[PlayStatusType["FAILED_VANILLA_EDU"] = 5] = "FAILED_VANILLA_EDU";
    PlayStatusType[PlayStatusType["FAILED_EDU_VANILLA"] = 6] = "FAILED_EDU_VANILLA";
    PlayStatusType[PlayStatusType["FAILED_SERVER_FULL"] = 7] = "FAILED_SERVER_FULL";
})(PlayStatusType = exports.PlayStatusType || (exports.PlayStatusType = {}));
var ResourcePackResponseStatus;
(function (ResourcePackResponseStatus) {
    ResourcePackResponseStatus[ResourcePackResponseStatus["NONE"] = 0] = "NONE";
    ResourcePackResponseStatus[ResourcePackResponseStatus["REFUSED"] = 1] = "REFUSED";
    ResourcePackResponseStatus[ResourcePackResponseStatus["SEND_PACKS"] = 2] = "SEND_PACKS";
    ResourcePackResponseStatus[ResourcePackResponseStatus["HAVE_ALL_PACKS"] = 3] = "HAVE_ALL_PACKS";
    ResourcePackResponseStatus[ResourcePackResponseStatus["COMPLETED"] = 4] = "COMPLETED";
})(ResourcePackResponseStatus = exports.ResourcePackResponseStatus || (exports.ResourcePackResponseStatus = {}));
var RespawnState;
(function (RespawnState) {
    RespawnState[RespawnState["SEARCHING"] = 0] = "SEARCHING";
    RespawnState[RespawnState["SERVER_READY"] = 1] = "SERVER_READY";
    RespawnState[RespawnState["CLIENT_READY"] = 2] = "CLIENT_READY";
})(RespawnState = exports.RespawnState || (exports.RespawnState = {}));
var BiomeType;
(function (BiomeType) {
})(BiomeType = exports.BiomeType || (exports.BiomeType = {}));
var GeneratorType;
(function (GeneratorType) {
    GeneratorType[GeneratorType["FINITE_OVERWORLD"] = 0] = "FINITE_OVERWORLD";
    GeneratorType[GeneratorType["OVERWORLD"] = 1] = "OVERWORLD";
    GeneratorType[GeneratorType["FLAT"] = 2] = "FLAT";
    GeneratorType[GeneratorType["NETHER"] = 3] = "NETHER";
    GeneratorType[GeneratorType["END"] = 4] = "END";
})(GeneratorType = exports.GeneratorType || (exports.GeneratorType = {}));
var Difficulty;
(function (Difficulty) {
    Difficulty[Difficulty["PEACEFUL"] = 0] = "PEACEFUL";
})(Difficulty = exports.Difficulty || (exports.Difficulty = {}));
var GameRuleType;
(function (GameRuleType) {
    GameRuleType[GameRuleType["BOOL"] = 1] = "BOOL";
    GameRuleType[GameRuleType["INT"] = 2] = "INT";
    GameRuleType[GameRuleType["FLOAT"] = 3] = "FLOAT";
})(GameRuleType = exports.GameRuleType || (exports.GameRuleType = {}));
var PlayerPermissions;
(function (PlayerPermissions) {
    PlayerPermissions[PlayerPermissions["VISITOR"] = 0] = "VISITOR";
    PlayerPermissions[PlayerPermissions["MEMBER"] = 1] = "MEMBER";
    PlayerPermissions[PlayerPermissions["OPERATOR"] = 2] = "OPERATOR";
    PlayerPermissions[PlayerPermissions["CUSTOM"] = 3] = "CUSTOM";
})(PlayerPermissions = exports.PlayerPermissions || (exports.PlayerPermissions = {}));
var CommandPermissions;
(function (CommandPermissions) {
    CommandPermissions[CommandPermissions["NORMAL"] = 0] = "NORMAL";
    CommandPermissions[CommandPermissions["OPERATOR"] = 1] = "OPERATOR";
    CommandPermissions[CommandPermissions["HOST"] = 2] = "HOST";
    CommandPermissions[CommandPermissions["AUTOMATION"] = 3] = "AUTOMATION";
    CommandPermissions[CommandPermissions["ADMIN"] = 4] = "ADMIN";
})(CommandPermissions = exports.CommandPermissions || (exports.CommandPermissions = {}));
exports.BITFLAG_SECOND_SET = 1 << 16;
var AdventureSettingsFlag;
(function (AdventureSettingsFlag) {
    AdventureSettingsFlag[AdventureSettingsFlag["WORLD_IMMUTABLE"] = 1] = "WORLD_IMMUTABLE";
    AdventureSettingsFlag[AdventureSettingsFlag["NO_PVP"] = 2] = "NO_PVP";
    AdventureSettingsFlag[AdventureSettingsFlag["AUTO_JUMP"] = 32] = "AUTO_JUMP";
    AdventureSettingsFlag[AdventureSettingsFlag["ALLOW_FLIGHT"] = 64] = "ALLOW_FLIGHT";
    AdventureSettingsFlag[AdventureSettingsFlag["NO_CLIP"] = 128] = "NO_CLIP";
    AdventureSettingsFlag[AdventureSettingsFlag["WORLD_BUILDER"] = 256] = "WORLD_BUILDER";
    AdventureSettingsFlag[AdventureSettingsFlag["FLYING"] = 512] = "FLYING";
    AdventureSettingsFlag[AdventureSettingsFlag["MUTED"] = 1024] = "MUTED";
    AdventureSettingsFlag[AdventureSettingsFlag["BUILD_AND_MINE"] = 0x01 | exports.BITFLAG_SECOND_SET] = "BUILD_AND_MINE";
    AdventureSettingsFlag[AdventureSettingsFlag["DOORS_AND_SWITCHES"] = 0x02 | exports.BITFLAG_SECOND_SET] = "DOORS_AND_SWITCHES";
    AdventureSettingsFlag[AdventureSettingsFlag["OPEN_CONTAINERS"] = 0x04 | exports.BITFLAG_SECOND_SET] = "OPEN_CONTAINERS";
    AdventureSettingsFlag[AdventureSettingsFlag["ATTACK_PLAYERS"] = 0x08 | exports.BITFLAG_SECOND_SET] = "ATTACK_PLAYERS";
    AdventureSettingsFlag[AdventureSettingsFlag["ATTACK_MOBS"] = 0x10 | exports.BITFLAG_SECOND_SET] = "ATTACK_MOBS";
    AdventureSettingsFlag[AdventureSettingsFlag["OPERATOR"] = 0x20 | exports.BITFLAG_SECOND_SET] = "OPERATOR";
    AdventureSettingsFlag[AdventureSettingsFlag["TELEPORT"] = 0x80 | exports.BITFLAG_SECOND_SET] = "TELEPORT";
})(AdventureSettingsFlag = exports.AdventureSettingsFlag || (exports.AdventureSettingsFlag = {}));
var Items;
(function (Items) {
    Items[Items["AIR"] = 0] = "AIR";
    Items[Items["SHIELD"] = 513] = "SHIELD";
})(Items = exports.Items || (exports.Items = {}));
