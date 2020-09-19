"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("./types/protocol");
require("./types/server");
const logger_1 = __importDefault(require("@bwatton/logger"));
logger_1.default.defaults.showMilliseconds = true;
const Server_1 = require("./Server");
Server_1.Server.start({
    maxPlayers: 200000,
    motd: {
        line1: 'HyperstoneNetwork',
        line2: 'test',
    },
});
// const logger = new Logger('V8::GC')
// gcWatch.on('beforeGC', () => {
//   logger.info('Preparing for garbage collection...', `${process.memoryUsage().heapUsed / 1024 / 1024} MB`)
// })
// gcWatch.on('afterGC', () => {
//   logger.info('Garbage collection complete.', `${process.memoryUsage().heapUsed / 1024 / 1024} MB`)
// })
