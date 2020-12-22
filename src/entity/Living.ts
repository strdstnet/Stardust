import { Entity } from './Entity'
import { DamageCause } from '../types/player'

type LivingContainers = [Armor]

interface ILivingEvents {
  _: () => void,
}

export abstract class Living<Events extends EventDict = EventDict, Containers extends Container[] = []> extends Entity<Events & ILivingEvents, [...LivingContainers, ...Containers]> {

  protected gravity = 0.08
  protected drag = 0.02
  protected lastAttack = 0

  public maxHealth = 20
  private _health = new NumberTracker(this.maxHealth, 0, this.maxHealth)

  protected lastDamageCause: DamageCause = DamageCause.GENERIC
  protected lastDamageArgs: string[] = []

  public async onTick(): Promise<void> {
    await super.onTick()

    if(this._health.isDirty()) {
      this.updateHealth()
    }

    if(this.lastAttack > 0) this.lastAttack--
  }

  protected initContainers(): void {
    this.containers.push(new Armor())
  }

  protected addAttributes(): void {
    super.addAttributes()

    this.attributeMap.setAttribute(Attribute.getAttribute(Attr.HEALTH))
    this.attributeMap.setAttribute(Attribute.getAttribute(Attr.FOLLOW_RANGE))
    this.attributeMap.setAttribute(Attribute.getAttribute(Attr.KNOCKBACK_RESISTANCE))
    this.attributeMap.setAttribute(Attribute.getAttribute(Attr.MOVEMENT_SPEED))
    this.attributeMap.setAttribute(Attribute.getAttribute(Attr.ATTACK_DAMAGE))
    this.attributeMap.setAttribute(Attribute.getAttribute(Attr.ABSORPTION))
  }

  public doDamage(halfHearts: number, cause: DamageCause = DamageCause.GENERIC, causeArgs: string[] = [this.name]): void {
    if(halfHearts < 0) throw new Error(`Damage cannot be negative (${halfHearts} half hearts)`)

    this.lastDamageCause = cause
    this.lastDamageArgs = causeArgs
    this._health.set(this.health - halfHearts)

    Server.i.broadcastEntityAnimation(this, EntityAnimationType.HURT, 0)

    if(this.health <= 0) {
      this.kill()
    }
  }

  public regerate(halfHearts: number): void {
    if(halfHearts < 0) throw new Error(`Regeneration cannot be negative (${halfHearts} half hearts)`)

    this._health.set(this.health + halfHearts)
  }

  public resetHealth(): void {
    this._health.set(20)
  }

  public attack(target: Living<any, any>, item: Item): void {
    const action = item.useOnEntity()

    if(!action) return

    this.lastAttack = Math.round(Server.TPS / 3)

    // if(item instanceof Tool) {
    //   target.doDamage(action.damage, DamageCause.PVP_ITEM, [target.name, this.name, `%${item.name}`])
    // } else {
    target.doDamage(action.damage, DamageCause.PVP, [target.name, this.name])
    // }

    const deltaX = target.position.x - this.position.x
    const deltaZ = target.position.z - this.position.z
    Server.i.broadcastEntityAnimation(target, EntityAnimationType.HURT, 0)
    target.knockBack(deltaX, deltaZ, 0.4)
  }

  public kill(cause?: DamageCause, args?: string[]): void {
    if(cause) this.lastDamageCause = cause
    if(args) this.lastDamageArgs = args

    this._health.set(0)
  }

  public get canAttack(): boolean {
    return this.lastAttack <= 0
  }

  public get armor(): Armor {
    return this.containers[0]
  }

  public get alive(): boolean {
    return this.health >= 1
  }

  public get health(): number {
    return this._health.get()
  }

  protected resetLastDamage(): void {
    this.lastDamageCause = DamageCause.GENERIC
    this.lastDamageArgs = []
  }

}

import { Attribute, Attr } from './Attribute'
import { Container } from '../containers/Container'
import { Armor } from '../containers/Armor'
import { EntityAnimationType } from '../types/player'
import { Item } from '../item/Item'
import { Server } from '../Server'
import { Tool } from '../item/Tool'
import { EventDict } from '@strdstnet/utils.events'
import { ValueTracker } from '../utils/ValueTracker'
import { NumberTracker } from '../utils/NumberTracker'
import { DroppedItem } from './DroppedItem'

