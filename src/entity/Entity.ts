import { Container } from '../containers/Container'
import { EventEmitter, EventDict } from '@strdstnet/utils.events'

interface IEntityEvents {
  _: () => void,
}

export abstract class Entity<Events extends EventDict = EventDict, Containers extends Container[] = any> extends EventEmitter<Events & IEntityEvents> {

  public static entityCount = 0

  protected gravity = 0.08
  protected drag = 0.02

  public baseOffset = 0

  public temporalVector = new Vector3(0, 0, 0)

  public id = BigInt(++Entity.entityCount)

  public attributeMap = new AttributeMap()
  public metadata = new Metadata()

  protected containers: Containers = ([] as any as Containers)

  public position = EntityPosition.from(Server.i.level.spawn)

  protected dragBeforeGravity = false

  public level = Server.i.level

  public fallingTo = -1 // y coord falling to
  public fallRate = 14 / Server.TPS // 14 blocks per second

  protected doPhysics = false
  public physics: Physics

  constructor(
    public name: string, // Ex. Zombie
    public gameId: string, // Ex. minecraft:zombie
    public dimensions: [number, number] = [1, 1], // [width, height] in blocks
  ) {
    super()

    this.physics = new Physics(this)

    GlobalTick.attach(this)

    this.initContainers()
    this.addAttributes()
    this.addMetadata()
  }

  public get boundingBox(): BoundingBox {
    const hWidth = this.width / 2
    const pos = this.position

    const y = pos.y - this.baseOffset
    return new BoundingBox(
      pos.x - hWidth,
      y,
      pos.z - hWidth,
      pos.x + hWidth,
      y + this.height,
      pos.z + hWidth,
    )
  }

  public async onTick(): Promise<void> {
    if(this.doPhysics && !this.physics.onGround) {
      // console.log('POS', this.position.coords, this.physics.entity.pos)
      this.physics.doPhysics()
    }

    if(this.position.hasUpdate) {
      this.updateLocation()
      this.position.acknowledgeUpdate()
    }
  }

  public move(deltaX: number, deltaY: number, deltaZ: number, type = PosUpdateType.PLAYER_MOVEMENT): void {
    this.position.update(deltaX, deltaY - this.baseOffset, deltaZ, type)
  }

  public get type(): string {
    return this.constructor.name
  }

  public get falling(): boolean {
    return this.fallingTo >= 0
  }

  public get basePosition(): EntityPosition {
    if(this.baseOffset === 0) return this.position

    const pos = this.position.clone()
    pos.y = pos.y -= this.baseOffset

    return pos
  }

  public updateLocation(): void {
    Server.i.moveEntity(this)
  }

  public updateHealth(): void {}

  public destroy(): void {
    GlobalTick.detach(this)

    this.despawn()
  }

  public despawn(): void {
    Server.i.removeEntity(this.id)
  }

  protected initContainers(): void {}

  protected addAttributes(): void {}

  protected addMetadata(): void {
    this.metadata.add(MetadataFlag.FLAGS, MetadataType.LONG, 0n)
    this.metadata.add(MetadataFlag.MAX_AIR, MetadataType.SHORT, 400)
    this.metadata.add(MetadataFlag.ENTITY_LEAD_HOLDER_ID, MetadataType.LONG, -1n)
    this.metadata.add(MetadataFlag.SCALE, MetadataType.FLOAT, 1)
    this.metadata.add(MetadataFlag.BOUNDING_BOX_WIDTH, MetadataType.FLOAT, this.width)
    this.metadata.add(MetadataFlag.BOUNDING_BOX_HEIGHT, MetadataType.FLOAT, this.height)
    this.metadata.add(MetadataFlag.AIR, MetadataType.SHORT, 0)

    this.metadata.setGeneric(MetadataGeneric.AFFECTED_BY_GRAVITY, true)
    this.metadata.setGeneric(MetadataGeneric.HAS_COLLISION, true)
  }

  public notifyPlayers(players: Player[], data: Metadata = this.metadata): void {
    for(const player of players) {
      player.sendEntityMetadata(this.id, data)
    }
  }

  public knockBack(x: number, z: number, base: number): void {
    let f = Math.sqrt(x * x + z * z)

    if(f <= 0) return

    const knockBackResistance = this.attributeMap.get(Attr.KNOCKBACK_RESISTANCE)
    const resistance = knockBackResistance ? knockBackResistance.value : 0

    if(mtRand() / 2147483647 > resistance) {
      f = 1 / f

      let mX = this.position.motion.x / 2
      let mY = this.position.motion.y / 2
      let mZ = this.position.motion.z / 2

      mX += x * f * base
      mY += base
      mZ += z * f * base

      if (mY > base) {
        mY = base
      }
      this.position.motion = new Vector3(mX, mY, mZ)
      this.setMotion()
    }
  }

  public directionVector(): Vector3 {
    const y = -Math.sin(deg2Rad(this.position.pitch))
    const xz = Math.cos(deg2Rad(this.position.pitch))
    const x = -xz * Math.sin(deg2Rad(this.position.yaw))
    const z = xz * Math.cos(deg2Rad(this.position.yaw))

    return this.temporalVector.setComponents(x, y, z).normalize()
  }


  public getAttributeValue(attr: Attr, def = 0): number {
    const attribute = this.attributeMap.get(attr)

    return attribute ? attribute.value : def
  }

  public setAttribute(attribute: Attribute | null): void {
    this.attributeMap.setAttribute(attribute)
  }

  public setMotion(): void {
    Server.i.sendMotion(this, this.position.motion)
  }

  public get scale(): number {
    const data = this.metadata.get(MetadataFlag.SCALE)

    return data ? data.value : 1
  }

  public set scale(val: number) {
    this.metadata.add(MetadataFlag.SCALE, MetadataType.FLOAT, val)
  }

  public get immobile(): boolean {
    return this.metadata.getGeneric(MetadataGeneric.IMMOBILE)
  }

  public set immobile(val: boolean) {
    this.metadata.setGeneric(MetadataGeneric.IMMOBILE, val)
  }

  public get affectedByGravity(): boolean {
    return this.metadata.getGeneric(MetadataGeneric.AFFECTED_BY_GRAVITY)
  }

  public set affectedByGravity(val: boolean) {
    this.metadata.setGeneric(MetadataGeneric.AFFECTED_BY_GRAVITY, val)
  }

  public get width(): number {
    return this.dimensions[0]
  }

  public set width(val: number) {
    this.dimensions[0] = val
    this.metadata.add(MetadataFlag.BOUNDING_BOX_WIDTH, MetadataType.FLOAT, val)
  }

  public get height(): number {
    return this.dimensions[1]
  }

  public set height(val: number) {
    this.dimensions[1] = val
    this.metadata.add(MetadataFlag.BOUNDING_BOX_HEIGHT, MetadataType.FLOAT, val)
  }

  public set canClimb(val: boolean) {
    this.metadata.setGeneric(MetadataGeneric.CAN_CLIMB, val)
  }

  public get canClimb(): boolean {
    return this.metadata.getGeneric(MetadataGeneric.CAN_CLIMB)
  }

}

import { AttributeMap } from './AttributeMap'
import { Player } from '../Player'
import { GlobalTick } from '../tick/GlobalTick'
import { EntityPosition, PosUpdateType } from './EntityPosition'
import { Server } from '../Server'
import { BoundingBox } from '../utils/BoundingBox'
import { mtRand } from '../utils/mtRand'
import { Attr, Attribute } from './Attribute'
import { Metadata } from '@strdstnet/utils.binary/lib/Metadata'
import { MetadataFlag, MetadataGeneric, MetadataType, Namespaced, Vector3 } from '@strdstnet/utils.binary'
import { deg2Rad } from '../utils/deg2rad'
import { Physics } from '../physics/Physics'
