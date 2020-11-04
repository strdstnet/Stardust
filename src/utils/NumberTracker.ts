import { ValueTracker } from './ValueTracker'

export class NumberTracker extends ValueTracker<number> {

  constructor(
    value: number,
    public minValue?: number,
    public maxValue?: number,
    dirty?: boolean,
  ) {
    super(value, dirty)
  }

  protected filter(value: number): number {
    if(this.minValue) value = Math.max(value, this.minValue)
    if(this.maxValue) value = Math.min(value, this.maxValue)

    return value
  }

}