import { Entity } from './Entity'
import { Attribute, Attr } from './Attribute'
import { Container, Armor } from '../containers'

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

  public get armor(): Armor {
    return this.containers[0]
  }

}