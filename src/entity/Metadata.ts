import { MetadataFlag, MetadataType } from '../types/player'

export interface MetadataItem {
  type: MetadataType,
  value: any,
}

export interface MetadataRecord extends MetadataItem {
  flag: MetadataFlag,
}

export class Metadata {

  private map: Map<MetadataFlag, MetadataItem> = new Map()
  private generics: Map<MetadataFlag, [MetadataFlag, boolean]> = new Map()

  public get size(): number {
    return this.map.size + this.generics.size
  }

  public add(flag: MetadataFlag, type: MetadataType, value: any): void {
    this.map.set(flag, { type, value })
  }

  public addGeneric(flag: MetadataFlag, value: boolean): void {
    this.generics.set(flag >= 64 ? 94 : MetadataFlag.INDEX, [flag, value])
  }

  public all(): MetadataRecord[] {
    const normal = Array.from(this.map.entries())
      .map(([flag, { type, value }]) => ({ flag, type, value }))

    const generics = Array.from(this.generics.entries())
      .map(([property, [flag]]) => {
        const value = (this.map.get(property) as any).value

        return {
          flag: property,
          type: MetadataType.LONG,
          value: BigInt(value ^ (1 << flag)),
        }
      })

    return [...normal, ...generics]
  }

}