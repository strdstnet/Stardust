"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ByteArrayTag = void 0;
const Tag_1 = require("./Tag");
class ByteArrayTag extends Tag_1.Tag {
    constructor(name, value) {
        super(Tag_1.TagType.ByteArray, name);
        this.value = value;
    }
}
exports.ByteArrayTag = ByteArrayTag;
