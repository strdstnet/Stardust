import { EventEmitter, DefaultEventMap } from 'tsee'
import { AttributeMap } from './AttributeMap'
import { Player } from '../Player'
import { Container } from '../containers/Container'
import { Metadata } from './Metadata'

interface IEntityEvents extends DefaultEventMap {
  _: () => void, // TODO: Remove when events are added
}

export abstract class Entity<Events = unknown, Containers extends Container[] = []> extends EventEmitter<IEntityEvents & Events> {

  public static entityCount = 0

  public id = BigInt(++Entity.entityCount)

  public attributeMap = new AttributeMap()
  public metadata = new Metadata()

  protected containers: Containers = ([] as any as Containers)

  constructor(
    public name: string, // Ex. Zombie
    public gameId: string, // Ex. minecraft:zombie
  ) {
    super()

    this.initContainers()
    this.addAttributes()
    this.addMetadata()
  }

  protected initContainers(): void {}

  protected addAttributes(): void {}

  protected addMetadata(): void {}

  public notifyPlayers(players: Player[], data?: any[]): void {
    const metadata = data || [] // https://github.com/pmmp/PocketMine-MP/blob/e47a711494c20ac86fea567b44998f2e24f3dbc7/src/pocketmine/entity/Entity.php#L2094

    for(const player of players) {
      player.emit('Client:entityNotification', this.id, metadata)
    }
  }

}