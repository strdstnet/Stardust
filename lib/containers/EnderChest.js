"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnderChest = void 0;
const containers_1 = require("../types/containers");
const Container_1 = require("./Container");
class EnderChest extends Container_1.Container {
    constructor() {
        super(containers_1.ContainerType.ARMOR, [], 'EnderChest', 27);
    }
}
exports.EnderChest = EnderChest;
