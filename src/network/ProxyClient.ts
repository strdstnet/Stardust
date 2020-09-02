import { IAddress, Packets, IBundledPacket, Dimension, Protocol, ResourcePackResponseStatus, PlayStatusType } from '../types'
import Logger from '@bwatton/logger'
import { PacketData, BitFlag } from './PacketData'
import { PacketBundle } from './raknet/PacketBundle'
import { ConnectionRequest, ACK, OpenConnectionReplyOne, OpenConnectionRequestOne, OpenConnectionRequestTwo, OpenConnectionReplyTwo, IncompatibleProtocol, ConnectionRequestAccepted, NAK } from './raknet'
import { BundledPacket } from './raknet/BundledPacket'
import { Socket } from 'dgram'
import { NewIncomingConnection } from './raknet/NewIncomingConnection'
import { PacketBatch } from './bedrock/PacketBatch'
import { Transfer, ChangeDimension, Disconnect, Login, ResourcePacksInfo, ResourcePacksResponse, PacketViolationWarning, StartGame, RequestChunkRadius, ChunkRadiusUpdated, SetLocalPlayerInitialized, DisconnectionNotification } from './bedrock'
import { ConnectedPing } from './raknet/ConnectedPing'
import { Vector3 } from 'math3d'
import { Stardust } from '../Stardust'
import dgram from 'dgram'
import dns from 'dns'
import { Packet } from './Packet'
import { ConnectedPong } from './raknet/ConnectedPong'
import { PlayStatus } from './bedrock/PlayStatus'
import { bundlePackets } from '../utils'
import { ProxyLogger } from '../utils/ProxyLogger'
import { BatchedPacket } from './bedrock/BatchedPacket'

export enum Direction {
  DOWNSTREAM,
  UPSTREAM,
}

enum State {
  INITIALISATION,   // Downstream init'ing connection with Upstream via Proxy. Packets recorded for later use
  NEGOTIATION,      // Downstream negotiating with Upstream via Proxy (bundled). Packets recorded for later use
  PROXYING,         // Downstream communicating with Upstream via Proxy, packets not being recorded
  P_INITIALISATION, // Proxy init'ing connection with Upstream, using data parsed from packets during INITIALISATION
  P_NEGOTIATION,    // Proxy negotiating with Upstream (bundled), using data parsed from packets during NEGOTIATION
}

const InitStates = [State.INITIALISATION, State.P_INITIALISATION]
// const NegoStates = [State.NEGOTIATION, State.P_NEGOTIATION]
const ProxyStates = [State.INITIALISATION, State.NEGOTIATION, State.PROXYING]
const CatchStates = [State.P_INITIALISATION, State.P_NEGOTIATION]

interface SplitQueue {
  [splitId: number]: BundledPacket<any>,
}

interface SplitQueues {
  [Direction.DOWNSTREAM]: SplitQueue,
  [Direction.UPSTREAM]: SplitQueue,
}

export class ProxyClient {

  public static TICK_RATE = 20 // Ticks per second (TPS, Hz)
  public static TICK_TIME = 1000 / ProxyClient.TICK_RATE // Milliseconds allocated per tick

  private clientId!: bigint
  private XUID!: string
  private protocol!: number
  private chainData!: string
  private clientData!: string

  private mtuSize = Protocol.DEFAULT_MTU
  private clientMtuSize: number = Protocol.DEFAULT_MTU
  private serverMtuSize: number = Protocol.DEFAULT_MTU

  private _state: State = State.INITIALISATION

  private logger: Logger = new Logger('ProxyClient')
  private pLogger = new ProxyLogger()

  private isInDimensionScreen = false

  private splitQueues: SplitQueues = {
    [Direction.DOWNSTREAM]: {},
    [Direction.UPSTREAM]: {},
  }

  private upstream!: Socket

  // private clientId = 0x00000000003c6d0dn
  private started = Date.now()

  private downAddrId: string

  private upAddr!: IAddress
  private upAddrId!: string

  private sequenceUp = 0
  private sequenceDown = 0
  private sequences = {
    [Packets.NEW_INCOMING_CONNECTION]: -1,
  }
  private lastSplitId = -1

  private sequenceNumbers: {
    [k: number]: BundledPacket<any>,
  } = {}

  private lastUpstreamSequence = 0
  private lastDownstreamSequence = 0

  private downstreamOffset = 0
  private upstreamOffset = 0

  // private ticker: NodeJS.Timeout

  private receiveQueue: Array<[Direction, PacketData]> = []
  private sendQueue: Array<[Direction, PacketData]> = []

  constructor(public downAddr: IAddress, private socket: Socket) {
    this.downAddrId = Stardust.instance.getAddrId(this.downAddr)

    this.logger.info('Created for', `DOWN(${this.downAddrId})`)

    // setTimeout(() => {
    //   this.sendBatchedMulti([
    //     new SetTitle({
    //       command: TitleCommand.SET_TITLE,
    //       text: 'welcome to creative',
    //     }),
    //     new SetGamemode({
    //       mode: Gamemode.CREATIVE,
    //     })
    //   ], Direction.DOWNSTREAM)
    // }, 15 * 1000)

    // this.ticker = setInterval(() => {
    //   this.processReceiveQueue()
    //   this.processSendQueue()
    // }, ProxyClient.TICK_TIME)
  }

  private get state() {
    return this._state
  }

  private set state(state: State) {
    this.logger.info(`State is now ${state}`)
    this._state = state
  }

  private processReceiveQueue() {
    const items = this.receiveQueue.slice()
    this.receiveQueue.splice(0, items.length)

    for(const [dir, data] of items) {
      if(dir === Direction.DOWNSTREAM) {
        this.handleDownstream(data)
      } else {
        this.handleUpstream(data)
      }
    }
  }

  private processSendQueue() {
    const items = this.sendQueue.slice()
    this.sendQueue.splice(0, items.length)

    for(const [dir, data] of items) {
      let socket: Socket
      let addr: IAddress

      if(dir === Direction.DOWNSTREAM) {
        socket = this.socket
        addr = this.downAddr
      } else {
        socket = this.upstream
        addr = this.upAddr
      }

      socket.send(data.toBuffer(), addr.port, addr.ip)
    }
  }

  public async init(upAddr: IAddress): Promise<void> {
    await this.setUpstreamAddr(upAddr)

    this.socket.on('message', (msg, rAddr) => {
      const data = new PacketData(msg)
      const addrId = Stardust.instance.getAddrId(rAddr)

      if(addrId === this.downAddrId) this.handleUpstream(data)
      // if(addrId === this.downAddrId) this.receiveQueue.push([Direction.UPSTREAM, data])
    })
  }

  private async setUpstreamAddr({ ip, port, family }: IAddress) {
    return new Promise(resolve => {
      dns.resolve(ip, (err, addresses) => {
        this.upAddr = {
          ip: addresses && addresses.length ? addresses[0] : ip,
          port,
          family,
        }
        this.sequenceUp = 0
        this.upAddrId = Stardust.instance.getAddrId(this.upAddr)
        this.logger.info(`Set upstream: ${this.upAddrId}`)

        this.upstream = dgram.createSocket({ type: 'udp4', reuseAddr: true })
        this.upstream.on('message', (msg, rAddr) => {
          const data = new PacketData(msg)
          const addrId = Stardust.instance.getAddrId(rAddr)

          if(addrId === this.upAddrId) this.handleDownstream(data)
          // if(addrId === this.upAddrId) this.receiveQueue.push([Direction.DOWNSTREAM, data])
          else {
            this.logger.error(`Message from unknown addr ${addrId}`)
          }
        })

        resolve()
      })
    })
  }

  private get uptime() {
    return BigInt(Date.now() - this.started)
  }

  public disconnect(message: string, hideScreen = false): void {
    this.sendPacket(new Disconnect({
      hideScreen,
      message,
    }), Direction.DOWNSTREAM)

    this.destroy()
  }

  private destroy() {
    // Server.current.removeClient(this.address)
  }

  public handleUpstream(data: PacketData): void {
    if(data.buf[0] === Packets.UNCONNECTED_PING) return
    // this.logger.debug(`incoming up: ${data.buf[0]}`)

    const proxy = this.handle(data, Direction.UPSTREAM)

    if(proxy) {
      // this.logger.warn('---   PROXYING UP   ---')
      this.pLogger.logRaw(Direction.UPSTREAM, 'Packet', data.buf[0])
      this.send(data, Direction.UPSTREAM)
    }
  }

  public handleDownstream(data: PacketData): void {
    // const flags = data.readByte(false)
    // this.logger.debug(`incoming down: ${flags}`)

    const proxy = this.handle(data, Direction.DOWNSTREAM)

    if(proxy) {
      // this.logger.warn('---   PROXYING DOWN   ---')
      this.pLogger.logRaw(Direction.DOWNSTREAM, 'Packet', data.buf[0])
      this.send(data, Direction.DOWNSTREAM)
    }
  }

  private handle(data: PacketData, dir: Direction) {
    let proxy = ProxyStates.includes(this.state)
    let proxySq = -1
    const arr = dir === Direction.DOWNSTREAM ? '<-' : '->'

    const flags = data.readByte(false)
    // this.logger.debug(`[RCVD]  ${arr} (1) ${flags}`)
    try {
      if(InitStates.includes(this.state)) {
        let packet: Packet<any>
        // this.logger.debug(`  <- (2) ${flags}`)
        switch(flags) {
          case Packets.INCOMPATIBLE_PROTOCOL:
            packet = new IncompatibleProtocol()
            packet.decode(data)
            this.handleIncompatibleProtocol(packet)
            break
          case Packets.OPEN_CONNECTION_REQUEST_ONE:
            packet = new OpenConnectionRequestOne()
            const { mtuSize } = packet.decode(data)
            this.clientMtuSize = mtuSize
            break
          case Packets.OPEN_CONNECTION_REPLY_ONE:
            packet = new OpenConnectionReplyOne()
            packet.decode(data)
            this.handleOpenConnectionReplyOne(packet)
            break
          case Packets.OPEN_CONNECTION_REPLY_TWO:
            packet = new OpenConnectionReplyTwo()
            packet.decode(data)
            this.handleOpenConnectionReplyTwo()
            break
        }
      } else {
        if(flags & BitFlag.ACK) {
          const ack = new ACK().decode(data)
          // this.logger.warn(`[RCVD]  ${arr} ACK (${ack.sequences})`)

          if(dir === Direction.DOWNSTREAM) {
            if(ack.sequences.includes(this.sequences[Packets.NEW_INCOMING_CONNECTION])) {
              this.handleNewIncomingConnectionAck()
            }
          }
        } else if(flags & BitFlag.NAK) {
          const nak = new NAK()
          const { sequences } = nak.decode(data)
          this.pLogger.log(nak, dir)
          // this.logger.warn(`[RCVD]  ${arr} NAK (${sequences}) (${this.sequenceDown}, ${this.sequenceUp})`)
          if(CatchStates.includes(this.state)) {
            sequences.forEach(sqn => console.log(this.sequenceNumbers[sqn]))
            process.exit()
          }
        } else {
          const { packets, sequenceNumber } = new PacketBundle().decode(data)
          proxySq = sequenceNumber

          if(dir === Direction.UPSTREAM) {
            // Client -> Server

            if(this.state === State.PROXYING && this.upstreamOffset) {
              data.pos = 1
              const sequence = proxySq = sequenceNumber + this.upstreamOffset
              data.writeLTriad(sequence)
            }
          }

          if(dir === Direction.DOWNSTREAM) {
            // Server -> Client

            if(this.state === State.PROXYING && this.downstreamOffset) {
              data.pos = 1
              const sequence = proxySq = sequenceNumber + this.downstreamOffset
              data.writeLTriad(sequence)
            }
          }

          if(CatchStates.includes(this.state)) {
            this.sendACK(sequenceNumber, dir === Direction.DOWNSTREAM ? Direction.UPSTREAM : Direction.DOWNSTREAM)
          }

          for(const packet of packets) {
            const bundledProxy = this.handleBundledPacket(packet, dir)
            proxy = proxy && bundledProxy
          }
        }
      }
    } catch(e) {
      const err = e as Error
      if(err.message !== 'invalid block type') this.logger.error(e)
    }

    if(proxy && proxySq !== -1) {
      if(dir === Direction.DOWNSTREAM) {
        this.lastDownstreamSequence = proxySq
      } else {
        this.lastUpstreamSequence = proxySq
      }
    }

    return proxy
  }

  private handleBundledPacket(packet: BundledPacket<any>, dir: Direction): boolean {
    let proxy = true
    const props = packet.props as IBundledPacket
    // this.logger.debug(`[RCVD]  ${arr} (5) ${packet.id} (split: ${props.hasSplit}, splitId: ${props.splitId}, splitIndex: ${props.splitIndex}, sq: ${props.sequenceIndex})`)
    if(props.hasSplit && !packet.hasBeenProcessed) {
      // this.logger.debug(`Split packet #${props.splitId} ${props.splitIndex + 1}/${props.splitCount}`)
      if(props.splitIndex === 0) {
        packet.data.pos = packet.data.length
        this.splitQueues[dir][props.splitId] = packet
      } else {
        const queue = this.splitQueues[dir][props.splitId]
        if(!queue) {
          throw new Error(`Invalid Split: #${props.splitId} for packet: ${packet.id}`)
        } else {
          queue.append(packet.data)

          if(props.splitIndex === props.splitCount - 1) {
            queue.data.pos = 0
            queue.decode()
            queue.hasBeenProcessed = true
            proxy = this.handleBundledPacket(queue, dir)
            delete this.splitQueues[dir][props.splitId]
          }
        }
      }
    } else {
      // this.logger.debug(`[RCVD]  ${arr} (3) ${packet.id}`)
      switch(packet.id) {
        case Packets.CONNECTION_REQUEST:
          // this.handleConnectionRequest(packet as ConnectionRequest)
          break
        case Packets.NEW_INCOMING_CONNECTION:
          this.handleNewIncomingConnection(packet as NewIncomingConnection)
          break
        case Packets.CONNECTION_REQUEST_ACCEPTED:
          this.handleConnectionRequestAccepted(packet as ConnectionRequestAccepted)
          break
        case Packets.PACKET_BATCH:
          proxy = this.handlePacketBatch(packet as PacketBatch)
          break
        case Packets.DISCONNECTION_NOTIFICATION:
          if(dir === Direction.DOWNSTREAM) {
            this.logger.info('Socket sent disconnection notifcation')
            proxy = false
          } else {
            this.logger.info('Client sent disconnection notifcation')

            // this.sendBundled(new DisconnectNotification(), Direction.UPSTREAM)
          }
          break
        case Packets.CONNECTED_PING:
          this.handleConnectedPing(packet as ConnectedPing, dir)
          break
        // case Packets.NEW_INCOMING_CONNECTION:
        //   break
        default:
          this.logger.debug(`Unknown packet: ${packet.id}`)
      }
    }

    return proxy
  }

  private handlePacketBatch(packet: PacketBatch): boolean {
    const { packets } = packet.props
    let proxy = true

    // console.log(`PK BATCH ${packets.map(pk => pk.id)}`)
    // console.log(packet.data.buf)

    for(const pk of packets) {
      switch(pk.id) {
        case Packets.TRANSFER:
          const { address, port } = (pk as Transfer).props
          this.smoothTransfer(address, port)
          proxy = false
          break
        case Packets.LOGIN:
          const { clientId, XUID, protocol, chainData, clientData } = (pk as Login).props

          this.clientId = clientId
          this.XUID = XUID
          this.protocol = protocol
          this.chainData = chainData
          this.clientData = clientData
          break
        case Packets.PLAY_STATUS:
          const { status } = (pk as PlayStatus).props

          if(this.isInDimensionScreen && status === PlayStatusType.PLAYER_SPAWN) {
            this.isInDimensionScreen = false
            proxy = true
          }
          break
        case Packets.RESOURCE_PACKS_INFO:
          this.handleResourcePackInfo(pk)
          // proxy = true
          break
        case Packets.RESOURCE_PACKS_STACK:
          this.handleResourcePackStack()
          break
        case Packets.START_GAME:
          this.handleStartGame(pk)
          break
        case Packets.CHUNK_RADIUS_UPDATED:
          this.handleChunkRadiusUpdated(pk)
          break
        case Packets.PACKET_VIOLATION_WARNING:
          const { type, severity, packetId, message } = (pk as PacketViolationWarning).props

          console.log({ type, severity, packetId, message })
          process.exit()
          // eslint-disable-next-line no-fallthrough
        default:
          this.logger.error(`Unknown batch: ${pk.id}`)
      }
    }

    return proxy
  }

  private sendACK(sequenceNumber: number, dir: Direction) {
    const ack = new ACK([sequenceNumber])
    this.pLogger.log(ack, dir)

    this.send(ack.encode(), dir)
  }

  private send(data: PacketData, dir: Direction) {

    // this.sendQueue.push([dir, data])

    let socket: Socket
    let addr: IAddress

    if(dir === Direction.DOWNSTREAM) {
      socket = this.socket
      addr = this.downAddr
    } else {
      socket = this.upstream
      addr = this.upAddr
    }
    socket.send(data.toBuffer(), addr.port, addr.ip)
  }

  private sendPacket(packet: Packet<any>, dir: Direction, props?: any) {
    const data = packet.encode(props)
    this.pLogger.log(packet, dir)
    this.send(data, dir)
  }

  private sendBundled(packet: BundledPacket<any>, dir: Direction, log = true) {
    const sequence = dir === Direction.DOWNSTREAM ? 'sequenceDown' : 'sequenceUp'
    const mtuSize = dir === Direction.DOWNSTREAM ? this.clientMtuSize : this.serverMtuSize

    const [bundles, sq, splitId] = bundlePackets([packet], this[sequence], this.lastSplitId, mtuSize)
    this[sequence] = sq
    this.lastSplitId = splitId

    for(const bundle of bundles) {
      const encoded = bundle.encode()
      if(log) this.pLogger.log(bundle, dir)
      this.send(encoded, dir)
      this.sequenceNumbers[this[sequence]] = packet
    }
  }

  private sendBatched(packet: BatchedPacket<any>, dir: Direction) {
    this.sendBatchedMulti([packet], dir)
  }

  private sendBatchedMulti(packets: Array<BatchedPacket<any>>, dir: Direction) {
    const batch = new PacketBatch({
      packets,
    })

    this.pLogger.log(batch, dir)

    this.sendBundled(batch, dir, false)
  }

  private handleConnectedPing(packet: ConnectedPing, dir: Direction) {
    const { time } = packet.props

    if(this.state === State.P_INITIALISATION || this.state === State.P_NEGOTIATION) {
      this.sendBundled(new ConnectedPong({
        pingTime: time,
        pongTime: time + 1n,
      }), dir === Direction.UPSTREAM ? Direction.DOWNSTREAM : Direction.UPSTREAM)
    }
  }

  private handleIncompatibleProtocol(packet: IncompatibleProtocol) {
    const { protocol } = packet.props

    if(this.state === State.P_INITIALISATION) {
      this.sendPacket(new OpenConnectionRequestOne({
        protocol,
        mtuSize: this.mtuSize,
      }), Direction.UPSTREAM)
    }
  }

  private handleOpenConnectionReplyOne(packet: OpenConnectionReplyOne) {
    const { mtuSize } = packet.props

    this.serverMtuSize = mtuSize

    if(this.state === State.P_INITIALISATION) {
      this.sendPacket(new OpenConnectionRequestTwo({
        address: this.downAddr,
        mtuSize,
        clientId: this.clientId,
      }), Direction.UPSTREAM)
    }
  }

  private handleOpenConnectionReplyTwo() {
    if(InitStates.includes(this.state)) {
      this.state = this.state === State.INITIALISATION ? State.NEGOTIATION : State.P_NEGOTIATION
    }

    if(this.state === State.P_NEGOTIATION) {
      const args = {
        clientId: this.clientId,
        sendPingTime: this.uptime,
        hasSecurity: false,
      }
      this.sendBundled(new ConnectionRequest(args), Direction.UPSTREAM)
    }
  }

  private handleConnectionRequestAccepted(packet: ConnectionRequestAccepted) {
    const { address, systemAddresses, time } = packet.props

    if(this.state === State.P_NEGOTIATION) {
      this.sequences[Packets.NEW_INCOMING_CONNECTION] = this.sequenceUp
      this.sendBundled(new NewIncomingConnection({
        address,
        systemAddresses,
        pingTime: time,
        pongTime: time + 1n,
      }), Direction.UPSTREAM)
    }
  }

  private handleNewIncomingConnectionAck() {
    if(this.state === State.P_NEGOTIATION) {
      this.sendBatched(new Login({
        protocol: this.protocol,
        chainData: this.chainData,
        clientData: this.clientData,
      }), Direction.UPSTREAM)
    }
  }

  // private handleConnectionRequest(packet: ConnectionRequest) {
  //   this.send(new ConnectionRequestAccepted({
  //     address: this.address,
  //     systemIndex: 0,
  //     systemAddresses: new Array<IAddress>(Protocol.SYSTEM_ADDRESSES).fill(DummyAddress),
  //     requestTime: packet.props.sendPingTime,
  //     time: Server.current.runningTime,
  //   }))
  // }

  private handleResourcePackInfo(packet: ResourcePacksInfo) {
    const { resourcePacks, behaviourPacks } = packet.props

    if(this.state === State.P_NEGOTIATION) {
      // this.setProxying()
      this.sendBatched(new ResourcePacksResponse({
        status: ResourcePackResponseStatus.HAVE_ALL_PACKS,
        packIds: [],
      }), Direction.UPSTREAM)

      // process.exit()

    }
  }

  private handleResourcePackStack() {
    this.sendBatched(new ResourcePacksResponse({
      status: ResourcePackResponseStatus.COMPLETED,
      packIds: [],
    }), Direction.UPSTREAM)
  }

  private handleStartGame(packet: StartGame) {
    if(this.state === State.P_NEGOTIATION) {
      console.log(packet.props)
      // process.exit()
      const { entityRuntimeId, entityUniqueId } = packet.props
      this.sendBatched(new RequestChunkRadius({
        radius: 4, // TODO: Sync with client. Capture when connecting to first server
      }), Direction.UPSTREAM)
      this.setProxying()
      this.sendBatched(new SetLocalPlayerInitialized({
        entityRuntimeId,
      }), Direction.UPSTREAM)
      this.smoothSpawn()
    }
  }

  private handleChunkRadiusUpdated(packet: ChunkRadiusUpdated) {
    console.log(packet.props)
    process.exit()
  }

  private setProxying() {
    console.log('\n\nPROXYING\n\n')
    console.log(this.sequenceDown)
    console.log(this.sequenceUp)
    console.log(this.lastDownstreamSequence)
    console.log(this.lastUpstreamSequence)

    this.downstreamOffset = this.lastDownstreamSequence - this.sequenceDown - 2
    this.upstreamOffset = this.sequenceUp - this.lastUpstreamSequence - 1
    console.log('OFFSETS')
    console.log(this.downstreamOffset)
    console.log(this.upstreamOffset)
    this.state = State.PROXYING
    // this.lastClientSequence = this.sequenceUp - 1
    // this.lastServerSequence = this.sequenceDown - 1
    // process.exit()
  }

  private smoothSpawn() {
    this.isInDimensionScreen = false
    this.sendBatchedMulti([
      new ChangeDimension({
        dimension: Dimension.OVERWOLD,
        position: new Vector3(0, 0, 0),
        respawn: true,
      }),
      new PlayStatus({
        status: PlayStatusType.PLAYER_SPAWN,
      }),
      // new ChangeDimension({
      //   dimension: Dimension.NETHER,
      //   position: new Vector3(0, 0, 0),
      //   respawn: true,
      // }),
      // new PlayStatus({
      //   status: PlayStatusType.PLAYER_SPAWN,
      // }),
      // LevelChunk.empty,
      // new ChangeDimension({
      //   dimension: Dimension.NETHER,
      //   position: new Vector3(0, 0, 0),
      //   respawn: true,
      // }),
      // new PlayStatus({
      //   status: PlayStatusType.PLAYER_SPAWN,
      // }),
      // new ChangeDimension({
      //   dimension: Dimension.OVERWOLD,
      //   position: new Vector3(0, 0, 0),
      //   respawn: true,
      // }),
      // new PlayStatus({
      //   status: PlayStatusType.PLAYER_SPAWN,
      // }),
    ], Direction.DOWNSTREAM)
  }

  private async smoothTransfer(ip: string, port: number) {
    this.state = State.P_INITIALISATION
    this.sendBundled(new DisconnectionNotification(), Direction.UPSTREAM)

    await this.setUpstreamAddr({ ip, port, family: ip.includes(':') ? 6 : 4 })

    this.isInDimensionScreen = true
    this.sendBatched(new ChangeDimension({
      dimension: Dimension.NETHER,
      position: new Vector3(0, 0, 0),
      respawn: true,
    }), Direction.DOWNSTREAM)

    this.sendPacket(new OpenConnectionRequestOne({
      protocol: Protocol.PROTOCOL_VERSION,
      mtuSize: this.mtuSize,
    }), Direction.UPSTREAM)
  }

  private handleNewIncomingConnection(packet: NewIncomingConnection) {
    console.log('nic', packet.props)
  }

}
