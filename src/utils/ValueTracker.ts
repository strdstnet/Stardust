import { Event, EventEmitter } from '@hyperstonenet/utils.events'

export class ValueTracker<T = any> extends EventEmitter<{
  changed: Event<{ from: T, to: T }>,
}> {

  constructor(
    protected _value: T,
    protected dirty = false,
  ) {
    super()
  }

  public get(): T {
    return this._value
  }

  public set(value: T): void {
    value = this.filter(value)

    if(value !== this._value) {
      this.emit('changed', new Event({
        from: this._value,
        to: value,
      }))

      this._value = value
    }
  }

  protected filter(value: T): T {
    return value
  }

  public isDirty(ack = true): boolean {
    const val = this.dirty

    if(ack) this.dirty = !this.dirty

    return val
  }

}