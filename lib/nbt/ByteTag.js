"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ByteTag = void 0;
const Tag_1 = require("./Tag");
class ByteTag extends Tag_1.Tag {
    constructor(name, value) {
        super(Tag_1.TagType.Byte, name);
        this.value = value;
    }
}
exports.ByteTag = ByteTag;
