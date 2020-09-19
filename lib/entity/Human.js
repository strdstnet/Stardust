"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Human = void 0;
const Attribute_1 = require("./Attribute");
const Creature_1 = require("./Creature");
const EnderChest_1 = require("../containers/EnderChest");
const Inventory_1 = require("../containers/Inventory");
class Human extends Creature_1.Creature {
    initContainers() {
        super.initContainers();
        this.containers.push(new Inventory_1.Inventory());
        this.containers.push(new EnderChest_1.EnderChest());
    }
    addAttributes() {
        super.addAttributes();
        this.attributeMap.addAttribute(Attribute_1.Attribute.getAttribute(Attribute_1.Attr.SATURATION));
        this.attributeMap.addAttribute(Attribute_1.Attribute.getAttribute(Attribute_1.Attr.EXHAUSTION));
        this.attributeMap.addAttribute(Attribute_1.Attribute.getAttribute(Attribute_1.Attr.HUNGER));
        this.attributeMap.addAttribute(Attribute_1.Attribute.getAttribute(Attribute_1.Attr.EXPERIENCE_LEVEL));
        this.attributeMap.addAttribute(Attribute_1.Attribute.getAttribute(Attribute_1.Attr.EXPERIENCE));
    }
    get inventory() {
        return this.containers[1];
    }
    get enderChest() {
        return this.containers[2];
    }
}
exports.Human = Human;
