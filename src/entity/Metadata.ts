import { MetadataFlag, MetadataGeneric, MetadataType } from '../types/player'

export interface MetadataItem {
  type: MetadataType,
  value: any,
}

export interface MetadataRecord extends MetadataItem {
  flag: MetadataFlag,
}

export class Metadata extends Map<MetadataFlag, MetadataItem> {

  public add(flag: MetadataFlag, type: MetadataType, value: any): void {
    this.set(flag, { type, value })
  }

  public addDataFlag(property: number, flag: number, value = true, type = MetadataType.LONG): void {
    console.log('2', property, flag, value)
    if(this.getDataFlag(property, flag) !== value) {
      let flags: bigint = (this.get(property) as any).value
      console.log('3', flags)
      flags ^= (1n << BigInt(flag))
      console.log('4', flags)

      this.set(property, {
        type,
        value: flags,
      })
    }
  }

  public getDataFlag(property: number, flag: number): boolean {
    const val: bigint | undefined = this.get(property) as any
    if(!val || typeof val !== 'bigint') return false

    return (val & (1n << BigInt(flag))) > 0
  }

  public addGeneric(flag: MetadataGeneric, value: boolean): void {
    console.log('1', flag)
    const property = flag >= 64 ? MetadataFlag.FLAGS_EXTENDED : MetadataFlag.FLAGS
    this.addDataFlag(property, flag % 64, value)
  }

  public all(): MetadataRecord[] {
    return Array.from(this.entries())
      .map(([flag, { type, value }]) => ({ flag, type, value }))
  }

}