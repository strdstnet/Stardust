"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Living = void 0;
const Attribute_1 = require("./Attribute");
const Entity_1 = require("./Entity");
const Armor_1 = require("../containers/Armor");
class Living extends Entity_1.Entity {
    initContainers() {
        this.containers.push(new Armor_1.Armor());
    }
    addAttributes() {
        super.addAttributes();
        this.attributeMap.addAttribute(Attribute_1.Attribute.getAttribute(Attribute_1.Attr.HEALTH));
        this.attributeMap.addAttribute(Attribute_1.Attribute.getAttribute(Attribute_1.Attr.FOLLOW_RANGE));
        this.attributeMap.addAttribute(Attribute_1.Attribute.getAttribute(Attribute_1.Attr.KNOCKBACK_RESISTANCE));
        this.attributeMap.addAttribute(Attribute_1.Attribute.getAttribute(Attribute_1.Attr.MOVEMENT_SPEED));
        this.attributeMap.addAttribute(Attribute_1.Attribute.getAttribute(Attribute_1.Attr.ATTACK_DAMAGE));
        this.attributeMap.addAttribute(Attribute_1.Attribute.getAttribute(Attribute_1.Attr.ABSORPTION));
    }
    get armor() {
        return this.containers[0];
    }
}
exports.Living = Living;
