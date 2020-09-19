"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntArrayTag = void 0;
const Tag_1 = require("./Tag");
class IntArrayTag extends Tag_1.Tag {
    constructor(name, value) {
        super(Tag_1.TagType.IntArray, name);
        this.value = value;
    }
}
exports.IntArrayTag = IntArrayTag;
