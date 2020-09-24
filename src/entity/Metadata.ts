export interface MetadataItem {
  type: MetadataType,
  value: any,
}

export interface MetadataRecord extends MetadataItem {
  flag: MetadataFlag,
}

export class Metadata extends Map<MetadataFlag, MetadataItem> {

  public generics: Map<MetadataGeneric, boolean> = new Map()

  public add(flag: MetadataFlag, type: MetadataType, value: any): void {
    this.set(flag, { type, value })
  }

  public toggleDataFlag(property: number, flag: number, type = MetadataType.LONG): void {
    let flags: bigint = (this.get(property) as any).value
    flags ^= (1n << BigInt(flag))

    this.set(property, {
      type,
      value: flags,
    })
  }

  public getDataFlag(property: number, flag: number): boolean {
    const val: bigint | undefined = this.get(property) as any
    if(!val || typeof val !== 'bigint') return false

    return (val & (1n << BigInt(flag))) > 0
  }

  public setGeneric(flag: MetadataGeneric, value: boolean): void {
    const property = flag >= 64 ? MetadataFlag.FLAGS_EXTENDED : MetadataFlag.FLAGS

    const generic = this.generics.get(flag)
    if(typeof generic === 'undefined' || generic !== value) {
      this.generics.set(flag, value)
      this.toggleDataFlag(property, flag % 64)
    }
  }

  public getGeneric(flag: MetadataGeneric): boolean {
    const property = flag >= 64 ? MetadataFlag.FLAGS_EXTENDED : MetadataFlag.FLAGS

    return this.getDataFlag(property, flag)
  }

  public all(): MetadataRecord[] {
    return Array.from(this.entries())
      .map(([flag, { type, value }]) => ({ flag, type, value }))
  }

}

import { MetadataFlag, MetadataGeneric, MetadataType } from '../types/player'
