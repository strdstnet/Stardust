import { EventEmitter, DefaultEventMap } from 'tsee'

interface IEntityEvents extends DefaultEventMap {
  _: () => void, // TODO: Remove when events are added
}

export abstract class Entity<Events = unknown> extends EventEmitter<IEntityEvents & Events> {

  public static entityCount = 0

  public id = ++Entity.entityCount

  constructor(
    public name: string, // Ex. Zombie
    public gameId: string // Ex. minecraft:zombie
  ) {
    super()
  }

}