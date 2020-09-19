"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tag = exports.TagType = void 0;
var TagType;
(function (TagType) {
    TagType[TagType["End"] = 0] = "End";
    TagType[TagType["Byte"] = 1] = "Byte";
    TagType[TagType["Short"] = 2] = "Short";
    TagType[TagType["Int"] = 3] = "Int";
    TagType[TagType["Long"] = 4] = "Long";
    TagType[TagType["Float"] = 5] = "Float";
    TagType[TagType["Double"] = 6] = "Double";
    TagType[TagType["ByteArray"] = 7] = "ByteArray";
    TagType[TagType["String"] = 8] = "String";
    TagType[TagType["List"] = 9] = "List";
    TagType[TagType["Compound"] = 10] = "Compound";
    TagType[TagType["IntArray"] = 11] = "IntArray";
    TagType[TagType["LongArray"] = 12] = "LongArray";
})(TagType = exports.TagType || (exports.TagType = {}));
class Tag {
    constructor(type, name = '') {
        this.type = type;
        this.name = name;
    }
}
exports.Tag = Tag;
