"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EndTag = void 0;
const Tag_1 = require("./Tag");
class EndTag extends Tag_1.Tag {
    constructor(name) {
        super(Tag_1.TagType.End, name);
    }
}
exports.EndTag = EndTag;
