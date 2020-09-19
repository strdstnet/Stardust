"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Client = void 0;
const logger_1 = __importDefault(require("@bwatton/logger"));
const Server_1 = require("../Server");
const Player_1 = require("../Player");
const math3d_1 = require("math3d");
const Disconnect_1 = require("./bedrock/Disconnect");
const BinaryData_1 = require("../utils/BinaryData");
const PacketBatch_1 = require("./bedrock/PacketBatch");
const parseBundledPackets_1 = require("../utils/parseBundledPackets");
const Reliability_1 = require("../utils/Reliability");
const PartialPacket_1 = require("./custom/PartialPacket");
const PlayStatus_1 = require("./bedrock/PlayStatus");
const ResourcePacksInfo_1 = require("./bedrock/ResourcePacksInfo");
const ResourcePacksStack_1 = require("./bedrock/ResourcePacksStack");
const ChunkRadiusUpdated_1 = require("./bedrock/ChunkRadiusUpdated");
const Text_1 = require("./bedrock/Text");
const StartGame_1 = require("./bedrock/StartGame");
const EntityDefinitionList_1 = require("./bedrock/EntityDefinitionList");
const BiomeDefinitionList_1 = require("./bedrock/BiomeDefinitionList");
const Chunk_1 = require("../level/Chunk");
const LevelChunk_1 = require("./bedrock/LevelChunk");
const UpdateAttributes_1 = require("./bedrock/UpdateAttributes");
const AvailableCommands_1 = require("./bedrock/AvailableCommands");
const AdventureSettings_1 = require("./bedrock/AdventureSettings");
const EntityNotification_1 = require("./bedrock/EntityNotification");
const ContainerNotification_1 = require("./bedrock/ContainerNotification");
const EntityEquipment_1 = require("./bedrock/EntityEquipment");
const PacketBundle_1 = require("./raknet/PacketBundle");
const NAK_1 = require("./raknet/NAK");
const protocol_1 = require("../types/protocol");
const ACK_1 = require("./raknet/ACK");
const ConnectedPong_1 = require("./raknet/ConnectedPong");
const ConnectionRequestAccepted_1 = require("./raknet/ConnectionRequestAccepted");
const world_1 = require("../types/world");
const data_1 = require("../types/data");
class Client {
    constructor({ id, address, socket, mtuSize }) {
        this.logger = new logger_1.default('Client');
        // private splitQueue: Map<number, BundledPacket<any>> = new Map()
        this.splitQueue = {};
        this.sendQueue = [];
        this.sentPackets = new Map();
        this.sequenceNumber = -1;
        this.lastSplitId = -1;
        this.viewDistance = 4;
        this.id = id;
        this.address = address;
        this.socket = socket;
        this.mtuSize = mtuSize;
        this.logger.info('Created for', `${address.ip}:${address.port}`);
        setInterval(() => {
            this.processSendQueue();
        }, 50);
    }
    disconnect(message, hideScreen = false) {
        this.send(new Disconnect_1.Disconnect({
            hideScreen,
            message,
        }));
        this.destroy();
    }
    destroy() {
        Server_1.Server.current.removeClient(this.address);
    }
    handlePacket(data) {
        const flags = data.readByte(false);
        if (flags & BinaryData_1.BitFlag.ACK) {
            const { props: { sequences } } = new NAK_1.NAK().parse(data);
            console.log('GOT ACK:', sequences);
        }
        else if (flags & BinaryData_1.BitFlag.NAK) {
            const { props: { sequences } } = new NAK_1.NAK().parse(data);
            console.log('GOT NAK, resending:', sequences);
            for (const sequence of sequences) {
                const bundle = this.sentPackets.get(sequence);
                if (!bundle)
                    console.log(`SEQUENCE ${sequence} NOT FOUND`);
                else
                    this.resend(bundle);
            }
        }
        else {
            const { packets, sequenceNumber } = new PacketBundle_1.PacketBundle().decode(data);
            this.sendACK(sequenceNumber);
            for (const packet of packets) {
                this.handleBundledPacket(packet);
            }
        }
    }
    handleBundledPacket(packet) {
        const props = packet.props;
        if (props.hasSplit && !packet.hasBeenProcessed) {
            if (props.splitIndex === 0) {
                this.logger.debug(`Initial split packet for ${packet.data.buf[0]}`, packet);
                packet.data.pos = packet.data.length;
                this.splitQueue[props.splitId] = packet;
                // this.splitQueue.set(props.splitId, packet)
            }
            else {
                const queue = this.splitQueue[props.splitId];
                this.logger.debug(`Split packet ${props.splitIndex + 1}/${props.splitCount}`);
                // const bundled = this.splitQueue.get(props.splitId)
                if (!queue) {
                    throw new Error(`Invalid Split ID: ${props.splitId} for packet: ${packet.id}`);
                }
                else {
                    queue.append(packet.data);
                    if (props.splitIndex === props.splitCount - 1) {
                        queue.data.pos = 0;
                        queue.decode();
                        queue.hasBeenProcessed = true;
                        this.handleBundledPacket(queue);
                        delete this.splitQueue[props.splitId];
                    }
                }
            }
        }
        else {
            switch (packet.id) {
                case protocol_1.Packets.CONNECTION_REQUEST:
                    this.handleConnectionRequest(packet);
                    break;
                case protocol_1.Packets.NEW_INCOMING_CONNECTION:
                    this.handleNewIncomingConnection(packet);
                    break;
                case protocol_1.Packets.PACKET_BATCH:
                    this.handlePacketBatch(packet);
                    break;
                case protocol_1.Packets.DISCONNECTION_NOTIFICATION:
                    this.logger.info('Client disconnected, destroying...');
                    this.destroy();
                    break;
                case protocol_1.Packets.CONNECTED_PING:
                    this.handleConnectedPing(packet);
                    break;
                default:
                    this.logger.debug(`Unknown packet: ${packet.id}`);
            }
        }
    }
    sendACK(sequenceNumber) {
        Server_1.Server.current.send({
            packet: new ACK_1.ACK([sequenceNumber]),
            socket: this.socket,
            address: this.address,
        });
    }
    // private send(packet: BundledPacket<any>, sequenceNumber = ++this.sequenceNumber) {
    send(packet) {
        // Server.current.send({
        //   packet: new PacketBundle({
        //     sequenceNumber,
        //     packets: [packet],
        //   }),
        //   socket: this.socket,
        //   address: this.address,
        // })
        this.sendQueue.push(packet);
    }
    resend(packet) {
        Server_1.Server.current.send({
            packet,
            socket: this.socket,
            address: this.address,
        });
    }
    processSendQueue() {
        if (!this.sendQueue.length)
            return;
        const [bundles, sequenceNumber, lastSplitId] = parseBundledPackets_1.bundlePackets(this.sendQueue, this.sequenceNumber, this.lastSplitId, this.mtuSize);
        for (const packet of bundles) {
            this.sentPackets.set(packet.props.sequenceNumber, packet);
            Server_1.Server.current.send({
                packet,
                socket: this.socket,
                address: this.address,
            });
        }
        this.sendQueue = [];
        this.sequenceNumber = sequenceNumber;
        this.lastSplitId = lastSplitId;
    }
    sendBatched(packet, reliability = Reliability_1.Reliability.Unreliable) {
        this.send(new PacketBatch_1.PacketBatch({
            packets: [packet],
            reliability,
        }));
    }
    sendBatchedMulti(packets, reliability = Reliability_1.Reliability.ReliableOrdered) {
        this.send(new PacketBatch_1.PacketBatch({ packets, reliability }));
    }
    handleConnectedPing(packet) {
        const { time } = packet.props;
        this.send(new ConnectedPong_1.ConnectedPong({
            pingTime: time,
            pongTime: time + 1n,
        }));
    }
    handleConnectionRequest(packet) {
        this.send(new ConnectionRequestAccepted_1.ConnectionRequestAccepted({
            address: this.address,
            systemIndex: 0,
            systemAddresses: new Array(protocol_1.Protocol.SYSTEM_ADDRESSES).fill(protocol_1.DummyAddress),
            requestTime: packet.props.sendPingTime,
            time: Server_1.Server.current.runningTime,
        }));
    }
    handlePacketBatch(packet) {
        if (!(packet instanceof PartialPacket_1.PartialPacket)) {
            const { packets } = packet.props;
            for (const pk of packets) {
                switch (pk.id) {
                    case protocol_1.Packets.LOGIN:
                        this.handleLogin(pk);
                        break;
                    case protocol_1.Packets.RESOURCE_PACKS_RESPONSE:
                        this.handleResourcePacksResponse(pk);
                        break;
                    case protocol_1.Packets.REQUEST_CHUNK_RADIUS:
                        this.handleChunkRadiusRequest(pk);
                        break;
                    case protocol_1.Packets.TEXT:
                        this.handleText(pk);
                        break;
                    case protocol_1.Packets.PACKET_VIOLATION_WARNING:
                        const { type, severity, packetId, message } = pk.props;
                        this.logger.error('Packet Violation:', { type, severity, packetId, message });
                        break;
                    default:
                        this.logger.debug(`UNKNOWN BATCHED PACKET ${pk.id}`);
                }
            }
        }
    }
    handleNewIncomingConnection(packet) {
        // console.log('nic', packet.props)
    }
    handleLogin(packet) {
        // TODO: Login verification, already logged in?, ...
        this.player = Player_1.Player.createFrom(packet);
        this.initPlayerListeners();
        // TODO: Actually implement packs
        this.sendBatchedMulti([
            new PlayStatus_1.PlayStatus({
                status: world_1.PlayStatusType.SUCCESS,
            }),
            new ResourcePacksInfo_1.ResourcePacksInfo({
                mustAccept: false,
                hasScripts: false,
                behaviourPacks: [],
                resourcePacks: [],
            }),
        ], Reliability_1.Reliability.Unreliable);
        // this.sendBatched()
        // this.sendBatched()
    }
    async handleResourcePacksResponse(packet) {
        const { status } = packet.props;
        this.logger.debug(`Got resource pack status: ${packet.props.status}`, packet.props.packIds);
        // TODO: Implement other statuses
        switch (status) {
            case world_1.ResourcePackResponseStatus.HAVE_ALL_PACKS:
                this.sendBatched(new ResourcePacksStack_1.ResourcePacksStack({
                    mustAccept: false,
                    behaviourPacks: [],
                    resourcePacks: [],
                    experimental: false,
                    gameVersion: protocol_1.Protocol.BEDROCK_VERSION,
                }));
                break;
            case world_1.ResourcePackResponseStatus.COMPLETED:
                this.completeLogin();
                break;
            default:
                this.logger.error(`Unknown ResourcePackResponseStatus: ${status}`);
        }
    }
    handleChunkRadiusRequest(packet) {
        const { radius } = packet.props;
        this.sendBatched(new ChunkRadiusUpdated_1.ChunkRadiusUpdated({
            radius,
        }));
    }
    handleText(packet) {
        const { type, message, } = packet.props;
        if (type === Text_1.TextType.CHAT) {
            this.player.chat(message);
        }
    }
    async completeLogin() {
        const playerPosition = new data_1.PlayerPosition(0, 0, 0, 0, 0);
        this.sendBatched(new StartGame_1.StartGame({
            entityUniqueId: this.player.id,
            entityRuntimeId: this.player.id,
            playerPosition,
            spawnLocation: new math3d_1.Vector3(0, 0, 0),
        }), Reliability_1.Reliability.Unreliable);
        // // TODO: Name tag visible, can climb, immobile
        // // https://github.com/pmmp/PocketMine-MP/blob/e47a711494c20ac86fea567b44998f2e24f3dbc7/src/pocketmine/Player.php#L2255
        Server_1.Server.logger.info(`${this.player.name} logged in from ${this.address.ip}:${this.address.port} with MTU ${this.mtuSize}`);
        // this.logger.debug('Sending EntityDefinitionList:', this.sequenceNumber + 1)
        this.sendBatched(new EntityDefinitionList_1.EntityDefinitionList(), Reliability_1.Reliability.Unreliable);
        this.logger.debug('Sending BiomeDefinitionList:', this.sequenceNumber + 1);
        this.sendBatched(new BiomeDefinitionList_1.BiomeDefinitionList(), Reliability_1.Reliability.Unreliable);
        this.sendAttributes(true);
        this.sendAvailableCommands();
        // this.sendAdventureSettings()
        // // TODO: Potion effects?
        // // https://github.com/pmmp/PocketMine-MP/blob/5910905e954f98fd1b1d24190ca26aa727a54a1d/src/network/mcpe/handler/PreSpawnPacketHandler.php#L96-L96
        // this.logger.debug('Sending PlayerList:', this.sequenceNumber + 1)
        Server_1.Server.current.addPlayer(this.player);
        // this.player.notifySelf()
        // this.player.notifyContainers()
        // this.player.notifyHeldItem()
        const neededChunks = [];
        for (let i = 0; i < 15; i++) {
            const x = i >> 32;
            const z = (i & 0xFFFFFFFF) << 32 >> 32;
            const [chunkX, chunkZ] = Chunk_1.Chunk.getChunkCoords(playerPosition);
            neededChunks[i] = [chunkX + x, chunkZ + z];
        }
        for await (const [x, z] of neededChunks) {
            const chunk = await Server_1.Server.current.level.getChunkAt(x, z);
            // const chunk = new Chunk(x, z, [SubChunk.grassPlatform], [], [], [], [])
            this.sendBatched(new LevelChunk_1.LevelChunk({
                chunk,
                cache: false,
                usedHashes: [],
            }), Reliability_1.Reliability.Unreliable);
        }
        this.sendBatched(new PlayStatus_1.PlayStatus({
            status: world_1.PlayStatusType.PLAYER_SPAWN,
        }));
        // setTimeout(() => {
        //   this.sendBatched(new NetworkChunkPublisher({
        //     x: playerPosition.location.x,
        //     y: playerPosition.location.y,
        //     z: playerPosition.location.z,
        //     radius: this.viewDistance * 16,
        //   }), Reliability.Unreliable)
        // }, 250)
    }
    sendAttributes(all = false) {
        const entries = all ? this.player.attributeMap.all() : this.player.attributeMap.needSend();
        if (entries.length) {
            this.sendBatched(new UpdateAttributes_1.UpdateAttributes({
                entityRuntimeId: this.player.id,
                entries,
            }));
            entries.forEach(e => e.markSynchronized());
        }
    }
    sendAvailableCommands() {
        this.sendBatched(new AvailableCommands_1.AvailableCommands());
    }
    sendAdventureSettings() {
        this.sendBatched(new AdventureSettings_1.AdventureSettings({
            flags: [
                [world_1.AdventureSettingsFlag.WORLD_IMMUTABLE, this.player.isSpectator()],
                [world_1.AdventureSettingsFlag.NO_PVP, this.player.isSpectator()],
                [world_1.AdventureSettingsFlag.AUTO_JUMP, this.player.autoJump],
                [world_1.AdventureSettingsFlag.ALLOW_FLIGHT, this.player.allowFlight],
                [world_1.AdventureSettingsFlag.NO_CLIP, this.player.isSpectator()],
                [world_1.AdventureSettingsFlag.FLYING, this.player.flying],
            ],
            commandPermission: world_1.CommandPermissions.NORMAL,
            playerPermission: world_1.PlayerPermissions.MEMBER,
            entityUniqueId: this.player.id,
        }));
    }
    initPlayerListeners() {
        this.player.on('Client:entityNotification', (entityRuntimeId, metadata) => {
            this.sendBatched(new EntityNotification_1.EntityNotification({
                entityRuntimeId,
                metadata,
            }));
        });
        this.player.on('Client:containerNotification', container => {
            this.sendBatched(new ContainerNotification_1.ContainerNotification({
                type: container.type,
                items: container.items,
            }));
        });
        this.player.on('Client:heldItemNotification', (entityRuntimeId, item, inventorySlot, hotbarSlot, containerId) => {
            this.sendBatched(new EntityEquipment_1.EntityEquipment({
                entityRuntimeId,
                item,
                inventorySlot,
                hotbarSlot,
                containerId,
            }));
        });
        this.player.on('Client:sendMessage', (message, type) => {
            this.sendBatched(new Text_1.Text({
                type,
                message,
            }));
        });
    }
}
exports.Client = Client;
