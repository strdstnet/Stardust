"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Reliability = void 0;
var Reliability;
(function (Reliability) {
    Reliability[Reliability["Unreliable"] = 0] = "Unreliable";
    Reliability[Reliability["UnreliableSequenced"] = 1] = "UnreliableSequenced";
    Reliability[Reliability["Reliable"] = 2] = "Reliable";
    Reliability[Reliability["ReliableOrdered"] = 3] = "ReliableOrdered";
    Reliability[Reliability["ReliableSequenced"] = 4] = "ReliableSequenced";
    Reliability[Reliability["UnreliableACK"] = 5] = "UnreliableACK";
    Reliability[Reliability["ReliableACK"] = 6] = "ReliableACK";
    Reliability[Reliability["ReliableOrderedACK"] = 7] = "ReliableOrderedACK";
})(Reliability = exports.Reliability || (exports.Reliability = {}));
