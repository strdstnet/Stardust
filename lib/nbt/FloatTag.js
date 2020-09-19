"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FloatTag = void 0;
const Tag_1 = require("./Tag");
class FloatTag extends Tag_1.Tag {
    constructor(name, value) {
        super(Tag_1.TagType.Float, name);
        this.value = value;
    }
}
exports.FloatTag = FloatTag;
