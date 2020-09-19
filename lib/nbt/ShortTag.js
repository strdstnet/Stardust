"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShortTag = void 0;
const Tag_1 = require("./Tag");
class ShortTag extends Tag_1.Tag {
    constructor(name, value) {
        super(Tag_1.TagType.Short, name);
        this.value = value;
    }
}
exports.ShortTag = ShortTag;
