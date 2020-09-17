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

export abstract class Tag {

  public value: any

  constructor(public type: TagType, public name: string = '') {

  }

}
