"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DoubleTag = void 0;
const Tag_1 = require("./Tag");
class DoubleTag extends Tag_1.Tag {
    constructor(name, value) {
        super(Tag_1.TagType.Double, name);
        this.value = value;
    }
}
exports.DoubleTag = DoubleTag;
