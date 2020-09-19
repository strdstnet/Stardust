"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Player = void 0;
const Human_1 = require("./entity/Human");
const UUID_1 = require("./utils/UUID");
const skins_1 = require("./utils/skins");
const Text_1 = require("./network/bedrock/Text");
const containers_1 = require("./types/containers");
const Server_1 = require("./Server");
class Player extends Human_1.Human {
    constructor(player) {
        super(player.username, 'stardust:player');
        this.autoJump = true;
        this.allowFlight = false;
        this.flying = false;
        Object.assign(this, player);
        this.UUID = new UUID_1.UUID(player.clientUUID);
    }
    static createFrom(login) {
        const { props } = login;
        return new Player({
            username: props.username,
            clientUUID: props.clientUUID,
            XUID: props.XUID,
            identityPublicKey: props.identityPublicKey,
            clientId: props.clientId,
            skinData: skins_1.getSkinData(props),
        });
    }
    isSpectator() {
        return true;
    }
    chat(message) {
        Server_1.Server.current.playerChat(this, message);
    }
    sendMessage(message, type = Text_1.TextType.CHAT) {
        this.emit('Client:sendMessage', message, type);
    }
    notifySelf(data) {
        this.notifyPlayers([this], data);
    }
    notifyContainers(players = [this]) {
        for (const container of this.containers) {
            for (const player of players) {
                player.emit('Client:containerNotification', container);
            }
        }
    }
    notifyHeldItem(players = [this]) {
        const item = this.inventory.itemHolding;
        for (const player of players) {
            const slot = this.inventory.itemInHand;
            player.emit('Client:heldItemNotification', this.id, item, slot, slot, containers_1.ContainerId.INVENTORY);
        }
    }
}
exports.Player = Player;
