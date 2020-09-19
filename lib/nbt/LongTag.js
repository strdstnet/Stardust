"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LongTag = void 0;
const Tag_1 = require("./Tag");
class LongTag extends Tag_1.Tag {
    constructor(name, value) {
        super(Tag_1.TagType.Long, name);
        this.value = value;
    }
}
exports.LongTag = LongTag;
