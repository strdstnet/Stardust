"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Entity = void 0;
const tsee_1 = require("tsee");
const AttributeMap_1 = require("./AttributeMap");
class Entity extends tsee_1.EventEmitter {
    constructor(name, // Ex. Zombie
    gameId) {
        super();
        this.name = name;
        this.gameId = gameId;
        this.id = BigInt(++Entity.entityCount);
        this.attributeMap = new AttributeMap_1.AttributeMap();
        this.containers = [];
        this.initContainers();
    }
    initContainers() { }
    addAttributes() { }
    notifyPlayers(players, data) {
        const metadata = data || []; // https://github.com/pmmp/PocketMine-MP/blob/e47a711494c20ac86fea567b44998f2e24f3dbc7/src/pocketmine/entity/Entity.php#L2094
        for (const player of players) {
            player.emit('Client:entityNotification', this.id, metadata);
        }
    }
}
exports.Entity = Entity;
Entity.entityCount = 0;
