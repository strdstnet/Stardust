"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompoundTag = void 0;
const Tag_1 = require("./Tag");
class CompoundTag extends Tag_1.Tag {
    constructor(name) {
        super(Tag_1.TagType.Compound, name);
        this.value = {};
    }
    add(tag) {
        this.value[tag.name] = tag;
    }
    get(name) {
        return this.value[name];
    }
    val(name) {
        return this.value[name] ? this.value[name].value : null;
    }
}
exports.CompoundTag = CompoundTag;
