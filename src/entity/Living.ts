import { Attribute, Attr } from './Attribute'
import { Entity } from './Entity'
import { Container } from '../containers/Container'
import { Armor } from '../containers/Armor'
import { MetadataFlag, MetadataType } from '../types/player'

type LivingContainers = [Armor]

export abstract class Living<Events, Containers extends Container[] = []> extends Entity<Events, [...LivingContainers, ...Containers]> {

  protected initContainers(): void {
    this.containers.push(new Armor())
  }

  protected addAttributes(): void {
    super.addAttributes()

    this.attributeMap.addAttribute(Attribute.getAttribute(Attr.HEALTH))
    this.attributeMap.addAttribute(Attribute.getAttribute(Attr.FOLLOW_RANGE))
    this.attributeMap.addAttribute(Attribute.getAttribute(Attr.KNOCKBACK_RESISTANCE))
    this.attributeMap.addAttribute(Attribute.getAttribute(Attr.MOVEMENT_SPEED))
    this.attributeMap.addAttribute(Attribute.getAttribute(Attr.ATTACK_DAMAGE))
    this.attributeMap.addAttribute(Attribute.getAttribute(Attr.ABSORPTION))
  }

  protected addMetadata(): void {
    super.addMetadata()

    this.metadata.add(MetadataFlag.INDEX, MetadataType.LONG, 0)
    this.metadata.add(MetadataFlag.MAX_AIR, MetadataType.SHORT, 400)
    this.metadata.add(MetadataFlag.ENTITY_LEAD_HOLDER_ID, MetadataType.LONG, -1)
    this.metadata.add(MetadataFlag.SCALE, MetadataType.FLOAT, 1)
    this.metadata.add(MetadataFlag.BOUNDING_BOX_WIDTH, MetadataType.FLOAT, 0.6)
    this.metadata.add(MetadataFlag.BOUNDING_BOX_HEIGHT, MetadataType.FLOAT, 1.8)
    this.metadata.add(MetadataFlag.AIR, MetadataType.SHORT, 0)

    // this.metadata.addGeneric(MetadataFlag.AFFECTED_BY_GRAVITY, true)
    // this.metadata.addGeneric(MetadataFlag.HAS_COLLISION, true)
  }

  public get armor(): Armor {
    return this.containers[0]
  }

}