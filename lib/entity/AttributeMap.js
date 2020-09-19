"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttributeMap = void 0;
class AttributeMap extends Map {
    addAttribute(attr) {
        if (!attr)
            return;
        this.set(attr.id, attr);
    }
    all() {
        return Array.from(this.values());
    }
    needSend() {
        return Array.from(this)
            .filter(([, v]) => v.isDesynchronized())
            .map(([, v]) => v);
    }
}
exports.AttributeMap = AttributeMap;
