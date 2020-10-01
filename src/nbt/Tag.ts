export enum TagType {
  End,
	Byte,
	Short,
	Int,
	Long,
	Float,
	Double,
	ByteArray,
	String,
	List,
	Compound,
	IntArray,
	LongArray,
}

export abstract class Tag<V = any> {

  public value: V = null as any as V
  public name = ''

  constructor(public type: TagType) {}

  public abstract readValue(data: BinaryData): V
  public abstract writeValue(data: BinaryData): void

  public assign(name: string, value: V): this {
    this.name = name
    this.value = value

    return this
  }

  public toJSON(): any {
    return this.value
  }

}

import { BinaryData } from '../utils/BinaryData'
