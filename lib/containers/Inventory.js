"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Inventory = void 0;
const containers_1 = require("../types/containers");
const Container_1 = require("./Container");
class Inventory extends Container_1.Container {
    constructor(hotbarSize) {
        super(containers_1.ContainerType.ARMOR, [], 'Inventory', 36);
        this.defaultName = 'Inventory';
        this.defaultSize = 36;
        this.defaultHotbarSize = 9;
        this.itemInHand = 0; // Index of item in hotbar, 0-{hotbarSize}
        this.hotbarSize = hotbarSize || this.defaultHotbarSize;
    }
    get itemHolding() {
        return this.getItem(this.itemInHand);
    }
}
exports.Inventory = Inventory;
