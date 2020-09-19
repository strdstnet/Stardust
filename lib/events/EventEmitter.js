"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventEmitter = void 0;
class EventEmitter {
    constructor() {
        this.handlers = {
            '*': [],
        };
    }
    on(identifier, handler) {
        const id = identifier;
        if (!this.handlers[id])
            this.handlers[id] = [];
        this.handlers[id].push(handler);
        return this;
    }
    async emit(identifier, event) {
        const id = identifier;
        const handlers = [...(this.handlers[id] || []), ...this.handlers['*']];
        let i = 0;
        while (!event.isCancelled && i < handlers.length) {
            const handler = handlers[i++];
            await handler(event, id);
        }
    }
}
exports.EventEmitter = EventEmitter;
