"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BedrockData = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class BedrockData {
    static loadData() {
        BedrockData.BIOME_DEFINITIONS = fs_1.default.readFileSync(path_1.default.join(__dirname, 'biome_definitions.nbt'));
        BedrockData.ENTITY_DEFINITIONS = fs_1.default.readFileSync(path_1.default.join(__dirname, 'entity_definitions.nbt'));
    }
}
exports.BedrockData = BedrockData;
