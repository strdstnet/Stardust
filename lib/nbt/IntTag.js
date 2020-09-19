"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntTag = void 0;
const Tag_1 = require("./Tag");
class IntTag extends Tag_1.Tag {
    constructor(name, value) {
        super(Tag_1.TagType.Int, name);
        this.value = value;
    }
}
exports.IntTag = IntTag;
