"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContainerType = exports.ContainerId = void 0;
var ContainerId;
(function (ContainerId) {
    ContainerId[ContainerId["NONE"] = -1] = "NONE";
    ContainerId[ContainerId["INVENTORY"] = 0] = "INVENTORY";
    ContainerId[ContainerId["FIRST"] = 1] = "FIRST";
    ContainerId[ContainerId["LAST"] = 100] = "LAST";
    ContainerId[ContainerId["OFFHAND"] = 119] = "OFFHAND";
    ContainerId[ContainerId["ARMOR"] = 120] = "ARMOR";
    ContainerId[ContainerId["HOTBAR"] = 122] = "HOTBAR";
    ContainerId[ContainerId["FIXED_INVENTORY"] = 123] = "FIXED_INVENTORY";
    ContainerId[ContainerId["UI"] = 124] = "UI";
})(ContainerId = exports.ContainerId || (exports.ContainerId = {}));
var ContainerType;
(function (ContainerType) {
    ContainerType[ContainerType["NONE"] = -9] = "NONE";
    ContainerType[ContainerType["INVENTORY"] = -1] = "INVENTORY";
    ContainerType[ContainerType["CONTAINER"] = 0] = "CONTAINER";
    ContainerType[ContainerType["WORKBENCH"] = 1] = "WORKBENCH";
    ContainerType[ContainerType["FURNACE"] = 2] = "FURNACE";
    ContainerType[ContainerType["ENCHANTMENT"] = 3] = "ENCHANTMENT";
    ContainerType[ContainerType["BREWING_STAND"] = 4] = "BREWING_STAND";
    ContainerType[ContainerType["ANVIL"] = 5] = "ANVIL";
    ContainerType[ContainerType["DISPENSER"] = 6] = "DISPENSER";
    ContainerType[ContainerType["DROPPER"] = 7] = "DROPPER";
    ContainerType[ContainerType["HOPPER"] = 8] = "HOPPER";
    ContainerType[ContainerType["CAULDRON"] = 9] = "CAULDRON";
    ContainerType[ContainerType["MINECART_CHEST"] = 10] = "MINECART_CHEST";
    ContainerType[ContainerType["MINECART_HOPPER"] = 11] = "MINECART_HOPPER";
    ContainerType[ContainerType["HORSE"] = 12] = "HORSE";
    ContainerType[ContainerType["BEACON"] = 13] = "BEACON";
    ContainerType[ContainerType["STRUCTURE_EDITOR"] = 14] = "STRUCTURE_EDITOR";
    ContainerType[ContainerType["TRADING"] = 15] = "TRADING";
    ContainerType[ContainerType["COMMAND_BLOCK"] = 16] = "COMMAND_BLOCK";
    ContainerType[ContainerType["JUKEBOX"] = 17] = "JUKEBOX";
    ContainerType[ContainerType["ARMOR"] = 18] = "ARMOR";
    ContainerType[ContainerType["HAND"] = 19] = "HAND";
    ContainerType[ContainerType["COMPOUND_CREATOR"] = 20] = "COMPOUND_CREATOR";
    ContainerType[ContainerType["ELEMENT_CONSTRUCTOR"] = 21] = "ELEMENT_CONSTRUCTOR";
    ContainerType[ContainerType["MATERIAL_REDUCER"] = 22] = "MATERIAL_REDUCER";
    ContainerType[ContainerType["LAB_TABLE"] = 23] = "LAB_TABLE";
    ContainerType[ContainerType["LOOM"] = 24] = "LOOM";
    ContainerType[ContainerType["LECTERN"] = 25] = "LECTERN";
    ContainerType[ContainerType["GRINDSTONE"] = 26] = "GRINDSTONE";
    ContainerType[ContainerType["BLAST_FURNACE"] = 27] = "BLAST_FURNACE";
    ContainerType[ContainerType["SMOKER"] = 28] = "SMOKER";
    ContainerType[ContainerType["STONECUTTER"] = 29] = "STONECUTTER";
    ContainerType[ContainerType["CARTOGRAPHY"] = 30] = "CARTOGRAPHY";
    ContainerType[ContainerType["HUD"] = 31] = "HUD";
    ContainerType[ContainerType["JIGSAW_EDITOR"] = 32] = "JIGSAW_EDITOR";
    ContainerType[ContainerType["SMITHING_TABLE"] = 33] = "SMITHING_TABLE";
})(ContainerType = exports.ContainerType || (exports.ContainerType = {}));