"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Server = void 0;
const dgram_1 = __importDefault(require("dgram"));
const logger_1 = __importDefault(require("@bwatton/logger"));
const Client_1 = require("./network/Client");
const Level_1 = require("./level/Level");
const BedrockData_1 = require("./data/BedrockData");
const Attribute_1 = require("./entity/Attribute");
const Item_1 = require("./item/Item");
const network_1 = require("./types/network");
const BinaryData_1 = require("./utils/BinaryData");
const protocol_1 = require("./types/protocol");
const UnconnectedPong_1 = require("./network/raknet/UnconnectedPong");
const Text_1 = require("./network/bedrock/Text");
const PlayerList_1 = require("./network/bedrock/PlayerList");
const UnconnectedPing_1 = require("./network/raknet/UnconnectedPing");
const OpenConnectionRequestOne_1 = require("./network/raknet/OpenConnectionRequestOne");
const OpenConnectionRequestTwo_1 = require("./network/raknet/OpenConnectionRequestTwo");
const OpenConnectionReplyTwo_1 = require("./network/raknet/OpenConnectionReplyTwo");
const OpenConnectionReplyOne_1 = require("./network/raknet/OpenConnectionReplyOne");
const IncompatibleProtocol_1 = require("./network/raknet/IncompatibleProtocol");
const DEFAULT_OPTS = {
    address: '0.0.0.0',
    port: 19132,
    maxPlayers: 20,
    motd: {
        line1: 'A Stardust Server',
        line2: '',
    },
};
// TODO: Merge with Stardust.ts
class Server {
    constructor(opts) {
        this.opts = opts;
        this.startedAt = Date.now();
        this.clients = new Map();
        this.players = new Map(); // Map<Player ID (Entity Runtime ID, Player)>
        this.level = Level_1.Level.TestWorld();
        if (Server.current) {
            this.logger.error('Only one instance of Stardust can run per Node process');
            process.exit(1);
        }
        else {
            Server.current = this;
        }
        this.sockets = [
            ['IPv4', dgram_1.default.createSocket({ type: 'udp4', reuseAddr: true })],
        ];
        this.init();
    }
    get runningTime() {
        return BigInt(Date.now() - this.startedAt);
    }
    static async start(opts) {
        BedrockData_1.BedrockData.loadData();
        Attribute_1.Attribute.initAttributes();
        Item_1.Item.registerItems();
        return new Server(Object.assign({}, DEFAULT_OPTS, opts));
    }
    get logger() {
        return Server.logger;
    }
    init() {
        const { address, port, } = this.opts;
        this.sockets.forEach(async ([, socket]) => {
            socket.bind(port, address);
            // const logger = new Logger(`${this.logger.moduleName}(${id})`)
            const logger = this.logger;
            socket.on('error', err => {
                logger.error(err);
                socket.close();
            });
            socket.on('listening', () => {
                const address = socket.address();
                logger.info(`Listening on ${address.address}:${address.port}`);
            });
            socket.on('message', (message, addr) => {
                const address = {
                    ip: addr.address,
                    port: addr.port,
                    family: network_1.FamilyStrToInt[addr.family],
                };
                const data = new BinaryData_1.BinaryData(message);
                const packetId = data.readByte(false);
                const client = this.getClient(address);
                if (client) {
                    // Connected
                    client.handlePacket(data);
                }
                else {
                    // Unconnected
                    switch (packetId) {
                        case protocol_1.Packets.UNCONNECTED_PING:
                            this.handleUnconnectedPing({ data, socket, address });
                            break;
                        case protocol_1.Packets.OPEN_CONNECTION_REQUEST_ONE:
                            this.handleConnectionRequest1({ data, socket, address });
                            break;
                        case protocol_1.Packets.OPEN_CONNECTION_REQUEST_TWO:
                            this.handleConnectionRequest2({ data, socket, address });
                            break;
                        default:
                            logger.debug(`unknown packet: ${packetId}`);
                    }
                }
            });
        });
    }
    get motd() {
        const { motd: { line1, line2, }, maxPlayers, } = this.opts;
        return UnconnectedPong_1.UnconnectedPong.getMOTD({
            line1, line2, maxPlayers,
            numPlayers: this.players.size,
        });
    }
    static getAddrId(obj) {
        const addr = obj instanceof Client_1.Client ? obj.address : obj;
        return `${addr.ip}:${addr.port}`;
    }
    addClient(client) {
        this.clients.set(Server.getAddrId(client), client);
    }
    getClient(address) {
        return this.clients.get(Server.getAddrId(address)) || null;
    }
    removeClient(address) {
        this.clients.delete(Server.getAddrId(address));
    }
    addPlayer(player) {
        this.players.set(player.id, player);
        this.updatePlayerList();
    }
    getPlayer(id) {
        return this.players.get(id) || null;
    }
    removePlayer(id) {
        this.players.delete(id);
        this.updatePlayerList();
    }
    playerChat(sender, message) {
        for (const [, player] of this.players) {
            player.sendMessage(`${sender.username}: ${message}`, Text_1.TextType.RAW);
        }
    }
    updatePlayerList() {
        this.broadcast(new PlayerList_1.PlayerList({
            type: PlayerList_1.PlayerListType.ADD,
            players: Array.from(this.players.values()),
        }));
    }
    send({ packet, socket, address }) {
        socket.send(packet.encode().toBuffer(), address.port, address.ip);
    }
    broadcast(packet) {
        this.clients.forEach(async (client) => client.sendBatched(packet));
    }
    handleUnconnectedPing({ data, socket, address }) {
        const ping = new UnconnectedPing_1.UnconnectedPing().parse(data);
        const { pingId } = ping.props;
        this.send({
            packet: new UnconnectedPong_1.UnconnectedPong({
                pingId,
                motd: this.motd,
            }),
            socket,
            address,
        });
    }
    handleConnectionRequest1({ data, socket, address }) {
        const request = new OpenConnectionRequestOne_1.OpenConnectionRequestOne().parse(data);
        const { protocol, mtuSize } = request.props;
        if (this.getClient(address)) {
            // TODO: Tell client?
            return;
        }
        let packet;
        if (protocol !== protocol_1.Protocol.PROTOCOL_VERSION) {
            packet = new IncompatibleProtocol_1.IncompatibleProtocol();
        }
        else {
            packet = new OpenConnectionReplyOne_1.OpenConnectionReplyOne({ mtuSize });
        }
        this.send({ packet, socket, address });
    }
    handleConnectionRequest2({ data, socket, address }) {
        const request = new OpenConnectionRequestTwo_1.OpenConnectionRequestTwo().parse(data);
        const { mtuSize, clientId } = request.props;
        const client = new Client_1.Client({
            id: clientId,
            address,
            mtuSize,
            socket,
        });
        this.addClient(client);
        const packet = new OpenConnectionReplyTwo_1.OpenConnectionReplyTwo({
            address,
            mtuSize,
        });
        this.send({ packet, socket, address });
    }
}
exports.Server = Server;
Server.logger = new logger_1.default('Server');
