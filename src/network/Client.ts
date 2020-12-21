interface SplitQueue {
  [splitId: number]: Array<BundledPacket<any>>,
}

export class Client {

  public static MAX_CHUNKS_PER_TICK = 5

  private logger: Logger = new Logger('Client')

  public id: bigint
  public mtuSize: number

  public address: IAddress
  public socket: Socket

  // private splitQueue: Map<number, BundledPacket<any>> = new Map()
  private splitQueue: SplitQueue = {}

  private sendQueue: BundledPacket<any>[] = []

  private sentPackets: Map<number, PacketBundle> = new Map()

  private lastSplitId = -1

  private player!: Player

  private viewDistance = 4

  private lastPlayerChunk: string | null = null // 'x:z' last chunk we generated nearby chunks from
  private recentlySentChunks: string[] = [] // ['x:z']

  private lastRightClickTime = 0
  private lastRightClickPos: Vector3 | null = null

  private animateQueue: Map<number, Animate> = new Map()

  private loginData!: BinaryData

  constructor({ id, address, socket, mtuSize }: IClientArgs, public sequenceNumber = -1) {
    this.id = id
    this.address = address
    this.socket = socket
    this.mtuSize = mtuSize

    this.logger.info('Created for', `${address.ip}:${address.port}`)

    // setInterval(() => {
    //   this.processSendQueue()
    // }, 50)
    GlobalTick.attach(this)
  }

  private get level() {
    return Server.i.level
  }

  public disconnect(message: string, hideScreen = false): void {
    this.send(new Disconnect({
      hideScreen,
      message,
    }))

    this.destroy()
  }

  private destroy() {
    Server.i.removeClient(this.address)
    Server.i.removePlayer(this.player.id)

    this.player.destroy()
  }

  public handlePacket(data: BinaryData): void {
    const flags = data.readByte(false)

    if(flags & BitFlag.ACK) {
      const { props: { sequences } } = new ACK().parse(data)

      sequences.forEach(seq => this.sentPackets.delete(seq))
    } else if(flags & BitFlag.NAK) {
      const { props: { sequences } } = new NAK().parse(data)
      for(const sequence of sequences) {
        const bundle = this.sentPackets.get(sequence)

        if(!bundle) console.log(`SEQUENCE ${sequence} NOT FOUND`)
        else this.resend(bundle)
      }
    } else {
      const { packets, sequenceNumber } = new PacketBundle().decode(data)

      this.sendACK(sequenceNumber)

      for(const packet of packets) {
        this.handleBundledPacket(packet)
      }
    }
  }

  private handleBundledPacket(packet: BundledPacket<any>) {
    const props = packet.props as IBundledPacket
    if(props.hasSplit && !packet.hasBeenProcessed) {
      // this.logger.debug(`Split #${props.splitId} (${props.splitIndex + 1}/${props.splitCount})`)
      let queue = this.splitQueue[props.splitId]

      if(!queue) queue = this.splitQueue[props.splitId] = []

      queue[props.splitIndex] = packet

      if(queue.filter(Boolean).length >= props.splitCount) {
        const pk = queue[0]
        for(const part of queue) {
          pk.append(part.data)
        }
        pk.data.pos = 0
        pk.hasBeenProcessed = true
        pk.decode()

        delete this.splitQueue[props.splitId]
        this.handleBundledPacket(pk)
      }
    } else {
      switch(packet.id) {
        case Packets.CONNECTION_REQUEST:
          this.handleConnectionRequest(packet as ConnectionRequest)
          break
        case Packets.NEW_INCOMING_CONNECTION:
          this.handleNewIncomingConnection(packet as NewIncomingConnection)
          break
        case Packets.PACKET_BATCH:
          this.handlePacketBatch(packet as PacketBatch)
          break
        case Packets.DISCONNECTION_NOTIFICATION:
          this.logger.info('Client disconnected, destroying...')
          this.destroy()
          break
        case Packets.CONNECTED_PING:
          this.handleConnectedPing(packet as ConnectedPing)
          break
        default:
          this.logger.debug(`Unknown packet: ${packet.id}`)
      }
    }
  }

  private sendACK(sequenceNumber: number) {
    Server.i.send({
      packet: new ACK([sequenceNumber]),
      socket: this.socket,
      address: this.address,
    })
  }

  public sendRaw(packet: Packet<any>): void {
    Server.i.send({
      packet,
      socket: this.socket,
      address: this.address,
    })
  }

  private send(packet: BundledPacket<any>) {
    this.sendQueue.push(packet)
  }

  private resend(packet: PacketBundle) {
    Server.i.send({
      packet,
      socket: this.socket,
      address: this.address,
    })
  }

  public onTick(): void {
    this.processSendQueue()
    this.sendAttributes()

    for(const [type, animate] of this.animateQueue) {
      this.handleAnimate(animate)
      this.animateQueue.delete(type)
    }
  }

  private processSendQueue() {
    if(!this.sendQueue.length) return

    const count = this.sendQueue.length/* > Client.MAX_CHUNKS_PER_TICK ? Client.MAX_CHUNKS_PER_TICK : this.sendQueue.length*/
    const packets: BundledPacket<any>[] = this.sendQueue.splice(0, count)

    const [bundles, sequenceNumber, lastSplitId] = bundlePackets(packets, this.sequenceNumber, this.lastSplitId, this.mtuSize)

    for(const packet of bundles) {
      this.sentPackets.set(packet.props.sequenceNumber, packet)

      Server.i.send({
        packet,
        socket: this.socket,
        address: this.address,
      })
    }

    // this.sendQueue = []
    this.sequenceNumber = sequenceNumber
    this.lastSplitId = lastSplitId
  }

  public sendBatched(packet: BatchedPacket<any>, reliability = Reliability.Unreliable): void {
    // this.logger.debug('Sending', packet.id)
    this.send(new PacketBatch({
      packets: [packet],
      reliability,
    }))
  }

  private sendBatchedMulti(packets: BatchedPacket<any>[], reliability = Reliability.ReliableOrdered) {
    this.send(new PacketBatch({ packets, reliability }))
  }

  private handleConnectedPing(packet: ConnectedPing) {
    const { time } = packet.props

    this.send(new ConnectedPong({
      pingTime: time,
      pongTime: time + 1n,
    }))
  }

  private handleConnectionRequest(packet: ConnectionRequest) {
    this.send(new ConnectionRequestAccepted({
      address: this.address,
      systemIndex: 0,
      systemAddresses: new Array<IAddress>(Protocol.SYSTEM_ADDRESSES).fill(DummyAddress),
      requestTime: packet.props.sendPingTime,
      time: Server.i.runningTime,
    }))
  }

  private handlePacketBatch(packet: PacketBatch) {
    if(!(packet instanceof PartialPacket)) {
      const { packets } = packet.props

      for(const pk of packets) {
        // this.logger.debug(`Received (${pk.id}) ${pk.constructor.name}`)
        switch(pk.id) {
          case Packets.LOGIN:
            this.handleLogin(pk)
            break
          case Packets.RESOURCE_PACKS_RESPONSE:
            this.handleResourcePacksResponse(pk)
            break
          case Packets.REQUEST_CHUNK_RADIUS:
            this.handleChunkRadiusRequest(pk)
            break
          case Packets.TEXT:
            this.handleText(pk)
            break
          case Packets.MOVE_PLAYER:
            this.handleMove(pk)
            break
          case Packets.SET_LOCAL_PLAYER_INITIALIZED:
            this.handlePlayerSpawned(pk)
            break
          case Packets.COMMAND_REQUEST:
            this.handleCommandRequest(pk)
            break
          case Packets.PACKET_VIOLATION_WARNING:
            const { type, severity, packetId, message } = (pk as PacketViolationWarning).props

            this.logger.error('Packet Violation:', { type, severity, packetId, message })
            break
          case Packets.INTERACT:
            this.handleInteract(pk)
            break
          case Packets.PLAYER_ACTION:
            this.handlePlayerAction(pk)
            break
          case Packets.ANIMATE:
            this.animateQueue.set((pk as Animate).props.action, pk)
            break
          case Packets.LEVEL_SOUND:
            this.handleLevelSound(pk)
            break
          case Packets.EMOTE:
            this.handleEmote(pk)
            break
          case Packets.CONTAINER_CLOSE:
            this.handleCloseContainer(pk)
            break
          case Packets.CONTAINER_TRANSACTION:
            this.handleContainerTransaction(pk)
            break
          case Packets.ENTITY_EQUIPMENT:
            this.handleEntityEquipment(pk)
            break
          case Packets.ENTITY_ANIMATION:
            this.handleEntityAnimation(pk)
            break
          case Packets.RESPAWN:
            this.handleRespawn(pk)
            break
          case Packets.TICK_SYNC:
            this.handleTickSync(pk)
            break
          default:
            this.logger.debug(`UNKNOWN BATCHED PACKET ${pk.id}`)
        }
      }
    }
  }

  private handleNewIncomingConnection(packet: NewIncomingConnection) {}

  public handleLogin(packet: Login): void {
    this.loginData = packet.data
    // TODO: Login verification, already logged in?, ...

    this.player = Player.createFrom(packet, this)

    // if (!this.player.XUID) {
    //   this.disconnect('You are not authenticated with Xbox Live.')
    // }

    // TODO: Actually implement packs
    this.sendBatchedMulti([
      new PlayStatus({
        status: PlayStatusType.SUCCESS,
      }),
      new ResourcePacksInfo({
        mustAccept: false,
        hasScripts: false,
        behaviourPacks: [],
        resourcePacks: [],
      }),
    ])
    // this.sendBatched()
    // this.sendBatched()
  }

  public ezTransfer(serverType: string): void {
    this.sendRaw(new EzTransfer({
      serverType,
      clientId: this.id,
      sequenceNumber: this.sequenceNumber,
      loginData: this.loginData,
    }))
    this.destroy()
  }

  private async handleResourcePacksResponse(packet: ResourcePacksResponse) {
    const { status } = packet.props

    // TODO: Implement other statuses
    switch(status) {
      case ResourcePackResponseStatus.HAVE_ALL_PACKS:
        this.sendBatched(new ResourcePacksStack({
          mustAccept: false,
          behaviourPacks: [],
          resourcePacks: [],
          experiments: {
            experiments: [],
            previouslyEnabled: false,
          },
          gameVersion: Protocol.BEDROCK_VERSION,
        }))
        break
      case ResourcePackResponseStatus.COMPLETED:
        this.completeLogin()
        break
      default:
        this.logger.error(`Unknown ResourcePackResponseStatus: ${status}`)
    }
  }

  private handleChunkRadiusRequest(packet: RequestChunkRadius) {
    const { radius } = packet.props

    this.sendBatched(new ChunkRadiusUpdated({
      radius,
    }))

    // this.sendBatched(new NetworkChunkPublisher({
    //   x: this.player.position.x,
    //   y: this.player.position.y,
    //   z: this.player.position.z,
    //   radius: this.viewDistance * 16,
    // }))
  }

  private handleText(packet: Text) {
    const {
      type,
      message,
    } = packet.props

    if(type === TextType.CHAT) {
      this.player.chat(message)
    }
  }

  private handleMove(packet: MovePlayer) {
    const {
      positionX: x,
      positionY: y,
      positionZ: z,
      pitch,
      yaw,
      headYaw,
    } = packet.props

    if(!this.player.alive) return

    if(y < 0) {
      // this.player.kill(DamageCause.VOID, [this.player.displayName])
    } else {
      this.player.position.update(new EntityPosition(x, y, z, pitch, yaw, headYaw), PosUpdateType.PLAYER_MOVEMENT)
    }

    this.sendNearbyChunks()
  }

  private handlePlayerSpawned(packet: SetLocalPlayerInitialized) {
    this.sendBatched(new NetworkChunkPublisher({
      x: this.player.position.x,
      y: this.player.position.y,
      z: this.player.position.z,
      radius: this.viewDistance * 16,
    }))

    Server.i.spawnToAll(this.player)

    Server.i.players.forEach(async player => {
      if(this.id === player.clientId) return

      this.sendBatched(new AddPlayer({
        uuid: player.UUID,
        username: player.username,
        entityUniqueId: player.id,
        entityRuntimeId: player.id,
        position: player.position.coords,
        motion: player.position.motion,
        pitch: player.position.pitch,
        yaw: player.position.yaw,
        headYaw: player.position.headYaw,
        metadata: player.metadata,
        permissions: player.permissionLevel,
      }))
    })
    Chat.i.broadcastPlayerJoined(this.player)

    Server.i.emit('playerSpawned', new PlayerEvent({
      player: this.player,
    }))
  }

  private handleInteract(packet: Interact) {
    const { action } = packet.props

    switch(action) {
      case InteractAction.OPEN_INVENTORY:
        this.sendBatched(new ContainerOpen({
          windowId: ContainerId.INVENTORY,
          containerType: ContainerType.INVENTORY,
          containerX: 0,
          containerY: 0,
          containerZ: 0,
          containerEntityId: this.player.id,
        }))
        break
      default:
        this.logger.error(`Unknown interact ID: ${action}`)
    }
  }

  private handleCloseContainer(packet: ContainerClose) {
    const { windowId } = packet.props

    this.sendBatched(new ContainerClose({
      windowId,
    }))
  }

  private async handleContainerTransaction(packet: ContainerTransaction) {
    const { transactionType: type, transaction } = packet.props

    switch(type) {
      case ContainerTransactionType.NORMAL:
        return this.handleNormalTransaction(packet)
      case ContainerTransactionType.USE_ITEM:
        return this.handleUseItem(transaction)
      case ContainerTransactionType.USE_ITEM_ON_ENTITY:
        return this.handleUseItemOnEntity(transaction)
      default:
        this.logger.error(`Unknown ContainerTransactionType: ${type}`)
    }
  }

  private handleNormalTransaction(transaction: ContainerTransaction): void {
    const { actions, transaction: pos } = transaction.props

    Server.i.level.dropItem(new Vector3(this.player.position.x, this.player.position.y + 1.3, this.player.position.z), actions[0].newItem)
  }

  private handleUseItem(transaction: ITransaction): void {
    const { type, position: pos, itemHolding, face } = transaction

    const block = this.level.getBlockAt(pos.x, pos.y, pos.z)

    const item = this.player.inventory.itemHolding

    switch(type) {
      case UseItemType.BREAK_BLOCK:
        item.useOnBlock()

        Server.i.broadcastLevelEvent(LevelEventType.PARTICLE_DESTROY, pos.x + 0.5, pos.y + 0.5, pos.z + 0.5, block.rid)
        Server.i.level.setBlock(pos.x, pos.y, pos.z, BlockMap.AIR)
        Server.i.level.dropItem(new Vector3(pos.x + 0.5, pos.y + 0.5, pos.z + 0.5), block.item)
        break
      case UseItemType.CLICK_BLOCK:
        this.handleClickBlock(pos, itemHolding, face as number)
        break
      default:
        this.logger.error(`Unknown UseItemType: ${type}`)
    }
  }

  private handleUseItemOnEntity(transaction: ITransaction): void {
    const { type, entityRuntimeId } = transaction

    const target = entityRuntimeId ? Server.i.level.getEntity(entityRuntimeId) : null

    if(!target) return

    const item = this.player.inventory.itemHolding

    switch(type) {
      case UseItemOnEntityType.ATTACK:
        if(!(target instanceof Living)) throw new Error(`Attempted to attack non-Living entity: ${target.type}`)
        if(!target.alive) return

        if (!this.player.canAttack) return

        this.player.attack(target, item)
        break
      default:
        this.logger.error(`Unknown UseItemOnEntityType: ${type}`)
    }
  }

  private async handleClickBlock(pos: Vector3, itemHolding: IItem, face: number): Promise<void> {
    const item = ItemMap.from(itemHolding)
    if(!item || item.nid === Namespaced.AIR) return

    const clientDidSpam = (
      this.lastRightClickPos &&
      (Date.now() - this.lastRightClickTime) < 100 &&
      (Math.round(pos.x) === Math.round(this.lastRightClickPos.x)) &&
      (Math.round(pos.y) === Math.round(this.lastRightClickPos.y)) &&
      (Math.round(pos.z) === Math.round(this.lastRightClickPos.z))
    )

    this.lastRightClickPos = pos
    this.lastRightClickTime = Date.now()

    if(clientDidSpam) return

    const block = BlockMap.get(item.nid)
    const blockPos = Server.i.level.getRelativeBlockPosition(pos.x, pos.y, pos.z, face)

    if(!await Server.i.level.canPlace(block, blockPos)) {
      return
    }

    Server.i.broadcastLevelSound(WorldSound.PLACE, blockPos, block.rid, ':', false, false)
    Server.i.level.setBlock(blockPos.x, blockPos.y, blockPos.z, block)
  }

  private async handlePlayerAction(packet: PlayerAction) {
    const { action, actionX, actionY, actionZ, face } = packet.props

    const block = this.level.getBlockAt(actionX, actionY, actionZ)
    const item = this.player.inventory.itemHolding

    switch(action) {
      case PlayerEventAction.START_BREAK:
        const breakTime = Math.ceil(block.getItemBreakTime(item) * 20)
        Server.i.broadcastLevelEvent(LevelEventType.BLOCK_START_BREAK, actionX, actionY, actionZ, 65535 / breakTime)
        break
      case PlayerEventAction.CONTINUE_BREAK:
        Server.i.broadcastLevelEvent(LevelEventType.PARTICLE_PUNCH_BLOCK, actionX, actionY, actionZ, block.rid | (face << 24))
        break
      case PlayerEventAction.ABORT_BREAK:
      case PlayerEventAction.STOP_BREAK:
        Server.i.broadcastLevelEvent(LevelEventType.BLOCK_STOP_BREAK, actionX, actionY, actionZ, 0)
        break
      case PlayerEventAction.START_SNEAK:
        this.player.metadata.setGeneric(MetadataGeneric.SNEAKING, true)
        Server.i.broadcastMetadata(this.player, this.player.metadata)
        break
      case PlayerEventAction.STOP_SNEAK:
        this.player.metadata.setGeneric(MetadataGeneric.SNEAKING, false)
        Server.i.broadcastMetadata(this.player, this.player.metadata)
        break
      case PlayerEventAction.JUMP:
        //
        break
      case PlayerEventAction.START_SPRINT:
        this.player.metadata.setGeneric(MetadataGeneric.SPRINTING, true)
        Server.i.broadcastMetadata(this.player, this.player.metadata)
        break
      case PlayerEventAction.STOP_SPRINT:
        this.player.metadata.setGeneric(MetadataGeneric.SPRINTING, false)
        Server.i.broadcastMetadata(this.player, this.player.metadata)
        break
      case PlayerEventAction.START_SWIMMING:
        this.player.metadata.setGeneric(MetadataGeneric.SWIMMING, true)
        Server.i.broadcastMetadata(this.player, this.player.metadata, true)
        break
      case PlayerEventAction.STOP_SWIMMING:
        this.player.metadata.setGeneric(MetadataGeneric.SWIMMING, false)
        Server.i.broadcastMetadata(this.player, this.player.metadata, true)
        break
      case PlayerEventAction.INTERACT_BLOCK:
        //
        break
      default:
        this.logger.error(`Unhandled PlayerAction ID: ${action}`)
    }
  }

  private async handleAnimate(packet: Animate) {
    const { action } = packet.props

    Server.i.broadcastAnimate(this.player, action)
  }

  private handleCommandRequest(packet: CommandRequest) {
    const { command } = packet.props

    const [ trigger, ...args ] = CommandHandler.parse(command.substr(1, command.length - 1))

    CommandHandler.handle(trigger, this.player, args)
  }

  // TODO: Handle falling server side.
  private handleEntityFall() {
    // const { fallDistance, isInVoid } = packet.props

    // const fallDamage = Math.ceil(fallDistance - 3)

    // if (fallDamage > 0) {
    //   this.player.doDamage(fallDamage, DamageCause.FALL_ACCIDENT)

    //   Server.i.broadcastEntityAnimation(this.player, EntityAnimationType.HURT, 0) // TODO: Move to player.doDamage
    // }
  }

  private handleLevelSound(packet: LevelSound) {
    const { sound, position, extraData, entityType, isBabyMob, disableRelativeVolume } = packet.props

    Server.i.broadcastLevelSound(
      sound,
      position,
      extraData,
      entityType,
      isBabyMob,
      disableRelativeVolume,
    )
  }

  private handleEmote(packet: Emote) {
    const { runtimeEntityId, emoteId, flags } = packet.props

    this.player.sendMessage('Emotes are currently disabled on this server.')

    // Server.i.broadcastEmote(this.player, emoteId, flags)
  }

  private handleEntityEquipment(packet: EntityEquipment) {
    const { item, inventorySlot, hotbarSlot, containerId } = packet.props

    this.player.inventory.itemInHand = hotbarSlot

    Server.i.broadcastEntityEquipment(this.player, item, inventorySlot, hotbarSlot, containerId)

    // this.sendBatched(new FormRequest({
    //   formId: 1,
    //   formData: '{"type": "form","title": "§l§4Teleporter","buttons": [{"text": "§l§eMurder Mystery","image": {"type": "url","data": "https://64.media.tumblr.com/dcb08efc82f1fdde9bf1a7e744847888/tumblr_p3neymZXlx1qk55bko8_250.jpg"}},{"text": "§l§bHide n Seek", "image": {"type": "url", "data": "https://cdn.discordapp.com/attachments/690813365978791976/760203902439653386/tumblr_p7b48tPzXj1whvc9so9_1280.png"}}],"content": "§7Where do you want to go?"}',
    // }))
  }

  private handleEntityAnimation(packet: EntityAnimation) {}

  private handleRespawn(packet: Respawn) {
    const { state, entityRuntimeId } = packet.props

    if (state === RespawnState.CLIENT_READY) {
      this.sendBatched(new Respawn({
        position: Server.i.level.spawn,
        state: RespawnState.SERVER_READY,
        entityRuntimeId,
      }))
      this.player.respawn()
    }
  }

  private handleTickSync({ props }: TickSync) {
    this.sendBatched(new TickSync({
      clientRequestTimestamp: props.clientRequestTimestamp,
      serverReceptionTimestamp: BigInt(Date.now()),
    }))
  }

  private async completeLogin() {
    const pos = this.player.position.forSpawn()

    this.sendBatched(new StartGame({
      entityUniqueId: this.player.id,
      entityRuntimeId: this.player.id,
      position: pos.coords,
      pitch: pos.pitch,
      yaw: pos.yaw,
      spawnLocation: Server.i.level.spawn,
      itemTable: ItemMap.itemTable,
      defaultPlayerPermission: this.player.permissionLevel,
    }))

    console.log(ItemMap.itemTable.filter(i => i.rid > 1000))

    this.sendBatched(new ItemComponent())

    // // TODO: Name tag visible, can climb, immobile
    // // https://github.com/pmmp/PocketMine-MP/blob/e47a711494c20ac86fea567b44998f2e24f3dbc7/src/pocketmine/Player.php#L2255

    Server.logger.info(`${this.player.name} logged in from ${this.address.ip}:${this.address.port} with MTU ${this.mtuSize}`)

    this.sendBatched(new BiomeDefinitionList())
    this.sendBatched(new EntityDefinitionList())
    this.sendBatched(new CreativeContent())

    this.doSpawn()
  }

  public async doSpawn(): Promise<void> {
    this.sendAdventureSettings()

    this.sendAvailableCommands()
    this.sendAttributes(true)

    // // TODO: Potion effects?
    // // https://github.com/pmmp/PocketMine-MP/blob/5910905e954f98fd1b1d24190ca26aa727a54a1d/src/network/mcpe/handler/PreSpawnPacketHandler.php#L96-L96

    this.sendMetadata()

    Server.i.addPlayer(this.player)
    this.sendBatched(new PlayerList({
      type: PlayerListType.ADD,
      players: Array.from(Server.i.players.values()),
    }))

    this.player.notifySelf()
    this.player.notifyContainers()
    this.player.notifyHeldItem()

    await this.sendNearbyChunks()

    this.sendBatched(new PlayStatus({
      status: PlayStatusType.PLAYER_SPAWN,
    }))
  }

  private async sendNearbyChunks(): Promise<void> {
    const [ chunkX, chunkZ ] = Chunk.getChunkCoords(this.player.position)

    const chunkXZ = `${chunkX}:${chunkZ}`
    if(chunkXZ === this.lastPlayerChunk) return
    this.lastPlayerChunk = chunkXZ

    const neededChunks: [number, number][] = []
    const chunkCoords: string[] = []

    const maybePush = (x: number, z: number) => {
      const coords = `${x}:${z}`
      if(!this.recentlySentChunks.includes(coords)) {
        neededChunks.push([x, z])
        chunkCoords.push(coords)
        this.recentlySentChunks.push(coords)
      }
    }
    maybePush(chunkX, chunkZ)

    for(let d = 1; d <= this.viewDistance; d++) { // x+
      maybePush(chunkX + d, chunkZ)

      for(let d2 = 1; d2 <= this.viewDistance; d2++) {
        maybePush(chunkX + d, chunkZ - d2)
      }
    }

    for(let d = 1; d <= this.viewDistance; d++) { // x-
      maybePush(chunkX - d, chunkZ)

      for(let d2 = 1; d2 <= this.viewDistance; d2++) {
        maybePush(chunkX - d, chunkZ + d2)
      }
    }

    for(let d = 1; d <= this.viewDistance; d++) { // z+
      maybePush(chunkX, chunkZ + d)

      for(let d2 = 1; d2 <= this.viewDistance; d2++) {
        maybePush(chunkX + d2, chunkZ + d)
      }
    }

    for(let d = 1; d <= this.viewDistance; d++) { // z-
      maybePush(chunkX, chunkZ - d)

      for(let d2 = 1; d2 <= this.viewDistance; d2++) {
        maybePush(chunkX - d2, chunkZ - d)
      }
    }

    for(const [x, z] of neededChunks) {
      const chunk = await Server.i.level.getChunkAt(x, z)
      // const chunk = new Chunk(x, z, [SubChunk.grassPlatform], [], [], [], [])

      this.sendBatched(new LevelChunk({
        chunk,
        cache: false,
        usedHashes: [],
      }))
    }

    if(neededChunks.length > 1) {
      // setTimeout(() => {
      this.sendBatched(new NetworkChunkPublisher({
        x: this.player.position.x,
        y: this.player.position.y,
        z: this.player.position.z,
        radius: this.viewDistance * 16,
      }))
      // }, 2000)
    }

    if(this.recentlySentChunks.length > (this.nearbyChunkCount * 2)) {
      this.recentlySentChunks.splice(0, this.nearbyChunkCount)
    }
  }

  private get nearbyChunkCount() {
    return ((this.viewDistance * this.viewDistance) + this.viewDistance) * 4
  }

  public sendAttributes(all = false): void {
    if (!this.player) return
    const entries = all ? this.player.attributeMap.all() : this.player.attributeMap.needSend()

    if(entries.length) {
      this.sendBatched(new UpdateAttributes({
        entityRuntimeId: this.player.id,
        entries,
      }))

      entries.forEach(e => e.markSynchronized())
    }
  }

  private sendMetadata(metadata = this.player.metadata) {
    this.sendBatched(new EntityMetadata({
      entityRuntimeId: this.player.id,
      metadata,
      tick: 0n,
    }))
  }

  private sendAvailableCommands() {
    this.sendBatched(new AvailableCommands({
      commands: Array.from(CommandHandler.commands.values()),
    }))
  }

  private sendAdventureSettings() {
    this.sendBatched(new AdventureSettings({
      flags: [
        [AdventureSettingsFlag.WORLD_IMMUTABLE, this.player.isSpectator()],
        [AdventureSettingsFlag.NO_PVP, this.player.isSpectator()],
        [AdventureSettingsFlag.AUTO_JUMP, this.player.autoJump],
        [AdventureSettingsFlag.ALLOW_FLIGHT, this.player.allowFlight],
        [AdventureSettingsFlag.NO_CLIP, this.player.isSpectator()], // TODO: Disable?
        [AdventureSettingsFlag.FLYING, this.player.flying],
      ],
      commandPermission: CommandPermissions.NORMAL,
      playerPermission: this.player.permissionLevel,
      entityUniqueId: this.player.id,
    }))
  }

  public sendEntityMetadata(entityRuntimeId: bigint, metadata: Metadata): void {
    this.sendBatched(new EntityMetadata({
      entityRuntimeId,
      metadata,
      tick: 0n,
    }))
  }

  public sendMessage(message: string, type: TextType, parameters: string[]): void {
    this.sendBatched(new Text({
      type,
      message,
      parameters,
    }))
  }

  public sendTitle(text: string, type: TitleType, fadeInTime: number, stayTime: number, fadeOutTime: number): void {
    this.sendBatched(new SetTitle({
      command: TitleCommand.SET_ANIMATION_TIMES,
      text: '',
      fadeInTime,
      stayTime,
      fadeOutTime,
    }))
    this.sendBatched(new SetTitle({
      command: type as any as TitleCommand,
      text,
      fadeInTime,
      stayTime,
      fadeOutTime,
    }))
  }

  public sendEntityEquipment(entityRuntimeId: bigint, item: Item, inventorySlot: number, hotbarSlot: number, containerId: number): void {
    this.sendBatched(new EntityEquipment({
      entityRuntimeId,
      item,
      inventorySlot,
      hotbarSlot,
      containerId,
    }))
  }

  public setHealth(health: number): void {
    this.player.attributeMap.setAttribute(Attribute.getAttribute(Attr.HEALTH, health))
  }

  public sendContainer(container: Container): void {
    this.sendBatched(new ContainerNotification({
      containerId: container.id,
      items: container.items,
    }))
  }

  public sendContainerUpdate(container: Container, slot: number): void {
    this.sendBatched(new ContainerUpdate({
      containerId: container.id,
      slot,
      item: container.items[slot],
    }))
  }

  public updateGamemode(gameMode: Gamemode): void {
    this.sendBatched(new SetGamemode({
      mode: gameMode,
    }))
  }

}

import Logger from '@bwatton/logger'
import { Socket } from 'dgram'
import { Server } from '../Server'
import { Player } from '../Player'
import { Chunk } from '../level/Chunk'
import { DummyAddress, IClientArgs } from '../types/network'
import { Chat } from '../Chat'
import { DamageCause, LevelEventType, PlayerEventAction } from '../types/player'
import { EntityPosition, PosUpdateType } from '../entity/EntityPosition'
import { ContainerId, ContainerType} from '../types/containers'
import { Container } from '../containers/Container'
import { GlobalTick } from '../tick/GlobalTick'
import { BlockMap } from '../block/BlockMap'
import { Item } from '../item/Item'
import { Living } from '../entity/Living'
import { Attr, Attribute } from '../entity/Attribute'
import { PlayerEvent } from '../events/PlayerEvent'
import { CommandHandler } from '../command/CommandHandler'
import { ACK, AddPlayer, AdventureSettings, AdventureSettingsFlag, Animate, AvailableCommands, BatchedPacket, BiomeDefinitionList, BitFlag, BundledPacket, bundlePackets, ChunkRadiusUpdated, CommandPermissions, CommandRequest, ConnectedPing, ConnectedPong, ConnectionRequest, ConnectionRequestAccepted, ContainerClose, ContainerNotification, ContainerOpen, ContainerTransaction, ContainerTransactionType, ContainerUpdate, CreativeContent, Disconnect, Emote, EntityAnimation, EntityDefinitionList, EntityEquipment, EntityMetadata, EzTransfer, Gamemode, IBundledPacket, Interact, InteractAction, ItemComponent, ITransaction, LevelChunk, LevelSound, Login, MovePlayer, NAK, NetworkChunkPublisher, NewIncomingConnection, Packet, PacketBatch, PacketBundle, Packets, PacketViolationWarning, PartialPacket, PlayerAction, PlayerList, PlayerListType, PlayStatus, PlayStatusType, Protocol, Reliability, RequestChunkRadius, ResourcePackResponseStatus, ResourcePacksInfo, ResourcePacksResponse, ResourcePacksStack, Respawn, RespawnState, SetGamemode, SetLocalPlayerInitialized, SetTitle, StartGame, Text, TextType, TickSync, TitleCommand, TitleType, UpdateAttributes, UseItemOnEntityType, UseItemType, WorldSound } from '@strdstnet/protocol'
import { BinaryData, IAddress, IItem, MetadataGeneric, Namespaced, Vector3 } from '@strdstnet/utils.binary'
import { Metadata } from '@strdstnet/utils.binary/lib/Metadata'
import { ItemMap } from '../item/ItemMap'

