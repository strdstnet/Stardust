"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodeJWT = void 0;
function decodeJWT(token) {
    const [, payload] = token.split('.');
    const buffer = Buffer.from(payload.replace(/-/g, '+').replace(/_/g, '/'), 'base64');
    return JSON.parse(buffer.toString());
}
exports.decodeJWT = decodeJWT;
