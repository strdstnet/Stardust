"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Attribute = exports.Attr = void 0;
const data_1 = require("../types/data");
var Attr;
(function (Attr) {
    Attr[Attr["ABSORPTION"] = 0] = "ABSORPTION";
    Attr[Attr["SATURATION"] = 1] = "SATURATION";
    Attr[Attr["EXHAUSTION"] = 2] = "EXHAUSTION";
    Attr[Attr["KNOCKBACK_RESISTANCE"] = 3] = "KNOCKBACK_RESISTANCE";
    Attr[Attr["HEALTH"] = 4] = "HEALTH";
    Attr[Attr["MOVEMENT_SPEED"] = 5] = "MOVEMENT_SPEED";
    Attr[Attr["FOLLOW_RANGE"] = 6] = "FOLLOW_RANGE";
    Attr[Attr["HUNGER"] = 7] = "HUNGER";
    Attr[Attr["FOOD"] = 7] = "FOOD";
    Attr[Attr["ATTACK_DAMAGE"] = 8] = "ATTACK_DAMAGE";
    Attr[Attr["EXPERIENCE_LEVEL"] = 9] = "EXPERIENCE_LEVEL";
    Attr[Attr["EXPERIENCE"] = 10] = "EXPERIENCE";
    Attr[Attr["UNDERWATER_MOVEMENT"] = 11] = "UNDERWATER_MOVEMENT";
    Attr[Attr["LUCK"] = 12] = "LUCK";
    Attr[Attr["FALL_DAMAGE"] = 13] = "FALL_DAMAGE";
    Attr[Attr["HORSE_JUMP_STRENGTH"] = 14] = "HORSE_JUMP_STRENGTH";
    Attr[Attr["ZOMBIE_SPAWN_REINFORCEMENTS"] = 15] = "ZOMBIE_SPAWN_REINFORCEMENTS";
    Attr[Attr["LAVA_MOVEMENT"] = 16] = "LAVA_MOVEMENT";
})(Attr = exports.Attr || (exports.Attr = {}));
class Attribute {
    constructor(id, name, minVal, maxVal, defaultVal, shouldSend = true, value = defaultVal) {
        this.id = id;
        this.name = name;
        this.minVal = minVal;
        this.maxVal = maxVal;
        this.defaultVal = defaultVal;
        this.shouldSend = shouldSend;
        this.value = value;
        this.desynchronized = true;
    }
    static initAttributes() {
        Attribute.attributes.set(Attr.ABSORPTION, new Attribute(Attr.ABSORPTION, 'minecraft:absorption', 0, data_1.FLOAT_MAX_VAL, 0));
        Attribute.attributes.set(Attr.SATURATION, new Attribute(Attr.SATURATION, 'minecraft:player.saturation', 0, 20, 20));
        Attribute.attributes.set(Attr.EXHAUSTION, new Attribute(Attr.EXHAUSTION, 'minecraft:player.exhaustion', 0, 5, 0, false));
        Attribute.attributes.set(Attr.KNOCKBACK_RESISTANCE, new Attribute(Attr.KNOCKBACK_RESISTANCE, 'minecraft:knockback_resistance', 0, 1, 0));
        Attribute.attributes.set(Attr.HEALTH, new Attribute(Attr.HEALTH, 'minecraft:health', 0, 20, 20));
        Attribute.attributes.set(Attr.MOVEMENT_SPEED, new Attribute(Attr.MOVEMENT_SPEED, 'minecraft:movement', 0, data_1.FLOAT_MAX_VAL, 0.1));
        Attribute.attributes.set(Attr.FOLLOW_RANGE, new Attribute(Attr.FOLLOW_RANGE, 'minecraft:follow_range', 0, 2048, 16, false));
        Attribute.attributes.set(Attr.HUNGER, new Attribute(Attr.HUNGER, 'minecraft:player.hunger', 0, 20, 20));
        Attribute.attributes.set(Attr.ATTACK_DAMAGE, new Attribute(Attr.ATTACK_DAMAGE, 'minecraft:attack_damage', 0, data_1.FLOAT_MAX_VAL, 1, false));
        Attribute.attributes.set(Attr.EXPERIENCE_LEVEL, new Attribute(Attr.EXPERIENCE_LEVEL, 'minecraft:player.level', 0, 24791, 0));
        Attribute.attributes.set(Attr.EXPERIENCE, new Attribute(Attr.EXPERIENCE, 'minecraft:player.experience', 0, 1, 0));
        Attribute.attributes.set(Attr.UNDERWATER_MOVEMENT, new Attribute(Attr.UNDERWATER_MOVEMENT, 'minecraft:underwater_movement', 0.0, data_1.FLOAT_MAX_VAL, 0.02));
        Attribute.attributes.set(Attr.LUCK, new Attribute(Attr.LUCK, 'minecraft:luck', -1024, 1024, 0));
        Attribute.attributes.set(Attr.FALL_DAMAGE, new Attribute(Attr.FALL_DAMAGE, 'minecraft:fall_damage', 0, data_1.FLOAT_MAX_VAL, 1));
        Attribute.attributes.set(Attr.HORSE_JUMP_STRENGTH, new Attribute(Attr.HORSE_JUMP_STRENGTH, 'minecraft:horse.jump_strength', 0, 2, 0.7));
        Attribute.attributes.set(Attr.ZOMBIE_SPAWN_REINFORCEMENTS, new Attribute(Attr.ZOMBIE_SPAWN_REINFORCEMENTS, 'minecraft:zombie.spawn_reinforcements', 0, 1, 0));
        Attribute.attributes.set(Attr.LAVA_MOVEMENT, new Attribute(Attr.LAVA_MOVEMENT, 'minecraft:lava_movement', 0, data_1.FLOAT_MAX_VAL, 0.02));
    }
    static getAttribute(id) {
        return Attribute.attributes.get(id) || null;
    }
    static getByName(name) {
        for (const [, attr] of Attribute.attributes) {
            if (attr.name === name)
                return attr.clone();
        }
        return null;
    }
    clone() {
        return new Attribute(this.id, this.name, this.minVal, this.maxVal, this.defaultVal, this.shouldSend);
    }
    isDesynchronized() {
        return this.shouldSend && this.desynchronized;
    }
    markSynchronized(synced = true) {
        this.desynchronized = !synced;
    }
}
exports.Attribute = Attribute;
Attribute.attributes = new Map();
