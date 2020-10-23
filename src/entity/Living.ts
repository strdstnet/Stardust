import { Entity } from './Entity'

type LivingContainers = [Armor]

export abstract class Living<Events, Containers extends Container[] = []> extends Entity<Events, [...LivingContainers, ...Containers]> {

  protected gravity = 0.08
  protected drag = 0.02
  protected lastAttack = 0

  public async onTick(): Promise<void> {
    super.onTick()

    if(this.lastAttack > 0) this.lastAttack--
  } 

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

  public attack(target: Living<any, any>, item: Item): void {
    const action = item.useOnEntity()

    if(!action) return

    this.lastAttack = Math.round(Server.TPS / 3)

    target.health -= action.damage
    const deltaX = target.position.x - this.position.x
    const deltaZ = target.position.z - this.position.z
    Server.i.broadcastEntityAnimation(target, EntityAnimationType.HURT, 0)
    target.knockBack(deltaX, deltaZ, 0.4)
  }

  public get canAttack(): boolean {
    return this.lastAttack <= 0
  }

  public get armor(): Armor {
    return this.containers[0]
  }

}

import { Attribute, Attr } from './Attribute'
import { Container } from '../containers/Container'
import { Armor } from '../containers/Armor'
import { EntityAnimationType } from '../types/player'
import { Item } from '../item/Item'
import { Server } from '../Server'

