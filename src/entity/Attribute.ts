import { FLOAT_MAX_VAL } from '../types'

export enum Attr {
  ABSORPTION = 0,
	SATURATION = 1,
	EXHAUSTION = 2,
	KNOCKBACK_RESISTANCE = 3,
	HEALTH = 4,
	MOVEMENT_SPEED = 5,
	FOLLOW_RANGE = 6,
	HUNGER = 7,
	FOOD = 7,
	ATTACK_DAMAGE = 8,
	EXPERIENCE_LEVEL = 9,
	EXPERIENCE = 10,
	UNDERWATER_MOVEMENT = 11,
	LUCK = 12,
	FALL_DAMAGE = 13,
	HORSE_JUMP_STRENGTH = 14,
	ZOMBIE_SPAWN_REINFORCEMENTS = 15,
  LAVA_MOVEMENT = 16,
}

export class Attribute {

  public static attributes: Map<Attr, Attribute> = new Map()

  public desynchronized = true

  constructor(
    public id: number,
    public name: string,
    public minVal: number,
    public maxVal: number,
    public defaultVal: number,
    public shouldSend = true,
    public value = defaultVal
  ) {}

  public static initAttributes(): void {
    Attribute.attributes.set(Attr.ABSORPTION, new Attribute(Attr.ABSORPTION, 'minecraft:absorption', 0, FLOAT_MAX_VAL, 0))
    Attribute.attributes.set(Attr.SATURATION, new Attribute(Attr.SATURATION, 'minecraft:player.saturation', 0, 20, 20))
    Attribute.attributes.set(Attr.EXHAUSTION, new Attribute(Attr.EXHAUSTION, 'minecraft:player.exhaustion', 0, 5, 0, false))
    Attribute.attributes.set(Attr.KNOCKBACK_RESISTANCE, new Attribute(Attr.KNOCKBACK_RESISTANCE, 'minecraft:knockback_resistance', 0, 1, 0))
    Attribute.attributes.set(Attr.HEALTH, new Attribute(Attr.HEALTH, 'minecraft:health', 0, 20, 20))
    Attribute.attributes.set(Attr.MOVEMENT_SPEED, new Attribute(Attr.MOVEMENT_SPEED, 'minecraft:movement', 0, FLOAT_MAX_VAL, 0.1))
    Attribute.attributes.set(Attr.FOLLOW_RANGE, new Attribute(Attr.FOLLOW_RANGE, 'minecraft:follow_range', 0, 2048, 16, false))
    Attribute.attributes.set(Attr.HUNGER, new Attribute(Attr.HUNGER, 'minecraft:player.hunger', 0, 20, 20))
    Attribute.attributes.set(Attr.ATTACK_DAMAGE, new Attribute(Attr.ATTACK_DAMAGE, 'minecraft:attack_damage', 0, FLOAT_MAX_VAL, 1, false))
    Attribute.attributes.set(Attr.EXPERIENCE_LEVEL, new Attribute(Attr.EXPERIENCE_LEVEL, 'minecraft:player.level', 0, 24791, 0))
    Attribute.attributes.set(Attr.EXPERIENCE, new Attribute(Attr.EXPERIENCE, 'minecraft:player.experience', 0, 1, 0))
    Attribute.attributes.set(Attr.UNDERWATER_MOVEMENT, new Attribute(Attr.UNDERWATER_MOVEMENT, 'minecraft:underwater_movement', 0.0, FLOAT_MAX_VAL, 0.02))
    Attribute.attributes.set(Attr.LUCK, new Attribute(Attr.LUCK, 'minecraft:luck', -1024, 1024, 0))
    Attribute.attributes.set(Attr.FALL_DAMAGE, new Attribute(Attr.FALL_DAMAGE, 'minecraft:fall_damage', 0, FLOAT_MAX_VAL, 1))
    Attribute.attributes.set(Attr.HORSE_JUMP_STRENGTH, new Attribute(Attr.HORSE_JUMP_STRENGTH, 'minecraft:horse.jump_strength', 0, 2, 0.7))
    Attribute.attributes.set(Attr.ZOMBIE_SPAWN_REINFORCEMENTS, new Attribute(Attr.ZOMBIE_SPAWN_REINFORCEMENTS, 'minecraft:zombie.spawn_reinforcements', 0, 1, 0))
    Attribute.attributes.set(Attr.LAVA_MOVEMENT, new Attribute(Attr.LAVA_MOVEMENT, 'minecraft:lava_movement', 0, FLOAT_MAX_VAL, 0.02))
  }

  public static getAttribute(id: Attr): Attribute | null {
    return Attribute.attributes.get(id) || null
  }

  public static getByName(name: string): Attribute | null {
    for(const [, attr] of Attribute.attributes) {
      if(attr.name === name) return attr.clone()
    }

    return null
  }

  public clone(): Attribute {
    return new Attribute(this.id, this.name, this.minVal, this.maxVal, this.defaultVal, this.shouldSend)
  }

  public isDesynchronized(): boolean {
    return this.shouldSend && this.desynchronized
  }

  public markSynchronized(synced = true): void {
    this.desynchronized = !synced
  }

}