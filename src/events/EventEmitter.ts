import { Event } from './Event'

type Handler<EventType extends Event> = (event: EventType, identifier: string) => Promise<void>

export class EventEmitter<EventType extends Event = Event> {

  private handlers: {
    [k: string]: Handler<EventType>[],
  } = {
    '*': [],
  }

  public on(identifier: string, handler: Handler<EventType>): this {
    const id = identifier as any

    if(!this.handlers[id]) this.handlers[id] = []

    this.handlers[id].push(handler)

    return this
  }

  public async emit(identifier: string, event: EventType): Promise<void> {
    const id = identifier as any

    const handlers = [...(this.handlers[id] || []), ...this.handlers['*']]

    let i = 0
    while(!event.isCancelled && i < handlers.length) {
      const handler = handlers[i++]
      await handler(event, id)
    }
  }

}
