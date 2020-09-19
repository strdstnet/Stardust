"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Item = void 0;
const world_1 = require("../types/world");
class Item {
    /**
     * @description Registers a new Item
     */
    constructor(id, name = 'Unknown', rawDamage = 0) {
        this.id = id;
        this.name = name;
        this.damageVal = 0;
        this.count = 1;
        this.nbt = null;
        this.damage = rawDamage;
    }
    static registerItem(id, name) {
        this.items.set(id, new Item(id, name));
    }
    static registerItems() {
        Item.registerItem(world_1.Items.AIR, 'Air');
    }
    static getById(id) {
        const item = Item.items.get(id);
        return item ? item.clone() : null;
    }
    get damage() {
        return this.damageVal;
    }
    set damage(val) {
        this.damageVal = val === -1 ? -1 : val & 0x7FFF;
    }
    clone() {
        const item = new Item(this.id, this.name, 0);
        item.damageVal = this.damageVal;
        return item;
    }
}
exports.Item = Item;
Item.items = new Map();
