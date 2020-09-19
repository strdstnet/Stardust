"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Container = void 0;
const Item_1 = require("../item/Item");
const containers_1 = require("../types/containers");
const world_1 = require("../types/world");
class Container {
    constructor(type = containers_1.ContainerType.CONTAINER, items = [], name = 'Container', size = 0) {
        this.type = type;
        this.name = name;
        this.size = size;
        this.items = [];
        for (let i = 0; i < this.size; i++) {
            this.items[i] = items[i] || Item_1.Item.getById(world_1.Items.AIR);
        }
    }
    get maxStackSize() {
        return Container.MAX_STACK;
    }
    getItem(index) {
        const item = this.items[index];
        return item || null;
    }
}
exports.Container = Container;
Container.MAX_STACK = 64;
