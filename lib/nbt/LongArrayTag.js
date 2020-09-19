"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LongArrayTag = void 0;
const Tag_1 = require("./Tag");
class LongArrayTag extends Tag_1.Tag {
    constructor(name, value) {
        super(Tag_1.TagType.LongArray, name);
        this.value = value;
    }
}
exports.LongArrayTag = LongArrayTag;
