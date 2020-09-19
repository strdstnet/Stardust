"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StringTag = void 0;
const Tag_1 = require("./Tag");
class StringTag extends Tag_1.Tag {
    constructor(name, value) {
        super(Tag_1.TagType.String, name);
        this.value = value;
    }
}
exports.StringTag = StringTag;
