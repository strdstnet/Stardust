"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Armor = void 0;
const containers_1 = require("../types/containers");
const Container_1 = require("./Container");
class Armor extends Container_1.Container {
    constructor() {
        super(containers_1.ContainerType.ARMOR, [], 'Armor', 4);
    }
}
exports.Armor = Armor;
