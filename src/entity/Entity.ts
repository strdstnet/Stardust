import { EventEmitter, DefaultEventMap } from 'tsee'
import { AttributeMap } from './AttributeMap'
import { Player } from '../Player'
import { Container } from '../containers/Container'
import { Metadata } from './Metadata'
import { MetadataFlag, MetadataGeneric, MetadataType } from '../types/player'
import { GlobalTick } from '../tick/GlobalTick'
import { EntityPosition, PosUpdateType } from './EntityPosition'
import { Server } from '../Server'
import { Vector3 } from 'math3d'

interface IEntityEvents extends DefaultEventMap {
  _: () => void, // TODO: Remove when events are added
}

export abstract class Entity<Events = unknown, Containers extends Container[] = []> extends EventEmitter<IEntityEvents & Events> {

  protected gravity = 0
  protected drag = 0

  public static entityCount = 0

  public id = BigInt(++Entity.entityCount)

  public attributeMap = new AttributeMap()
  public metadata = new Metadata()

  protected containers: Containers = ([] as any as Containers)

  public position = new EntityPosition(0, 80, 0, 0, 0, 0)

  protected dragBeforeGravity = false

  constructor(
    public name: string, // Ex. Zombie
    public gameId: string, // Ex. minecraft:zombie
  ) {
    super()

    GlobalTick.attach(this)

    this.initContainers()
    this.addAttributes()
    this.addMetadata()
  }

  public onTick(): void {
    if(this.position.hasUpdate) {
      // this.applyForces()
      this.updateLocation()
      this.position.acknowledgeUpdate()
    }
  }

  protected applyForces(): void {
    const friction = 1 - this.drag

    if(this.dragBeforeGravity) this.position.motion.y *= friction

    this.position.motion.y -= this.gravity

    if(!this.dragBeforeGravity) this.position.motion.y *= friction

    if(this.position.onGround) {
      // TODO: Block friction
    }

    this.position.motion.x *= friction
    this.position.motion.z *= friction
  }

  public updateLocation(): void {
    // TODO: Actually send entity movement
  }

  public destroy(): void {
    GlobalTick.detach(this)
  }

  protected initContainers(): void {}

  protected addAttributes(): void {}

  protected addMetadata(): void {
    this.metadata.add(MetadataFlag.FLAGS, MetadataType.LONG, 0n)
    this.metadata.add(MetadataFlag.MAX_AIR, MetadataType.SHORT, 400)
    this.metadata.add(MetadataFlag.ENTITY_LEAD_HOLDER_ID, MetadataType.LONG, -1n)
    this.metadata.add(MetadataFlag.SCALE, MetadataType.FLOAT, 1)
    this.metadata.add(MetadataFlag.BOUNDING_BOX_WIDTH, MetadataType.FLOAT, 0.6)
    this.metadata.add(MetadataFlag.BOUNDING_BOX_HEIGHT, MetadataType.FLOAT, 1.8)
    this.metadata.add(MetadataFlag.AIR, MetadataType.SHORT, 0)


    this.metadata.addGeneric(MetadataGeneric.AFFECTED_BY_GRAVITY, true)
    this.metadata.addGeneric(MetadataGeneric.HAS_COLLISION, true)
  }

  public notifyPlayers(players: Player[], data?: Metadata): void {
    const metadata = data || this.metadata // https://github.com/pmmp/PocketMine-MP/blob/e47a711494c20ac86fea567b44998f2e24f3dbc7/src/pocketmine/entity/Entity.php#L2094

    for(const player of players) {
      player.emit('Client:entityNotification', this.id, metadata)
    }
  }

}