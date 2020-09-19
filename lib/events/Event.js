"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Event = void 0;
class Event {
    constructor(...args) {
        this.cancelled = false;
        this.args = args;
    }
    get isCancelled() {
        return this.cancelled;
    }
    cancel() {
        this.cancelled = true;
    }
}
exports.Event = Event;
