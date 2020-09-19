"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListTag = void 0;
const Tag_1 = require("./Tag");
class ListTag extends Tag_1.Tag {
    constructor(name, valueType, value) {
        super(Tag_1.TagType.List, name);
        this.valueType = valueType;
        this.value = value;
    }
}
exports.ListTag = ListTag;
