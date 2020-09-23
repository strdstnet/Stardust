import { Air } from './Air'
import { Block } from './Block'
import { Dirt } from './Dirt'
import { Grass } from './Grass'
import { Stone } from './Stone'

export class BlockMap {

  private static blocks: Map<string, Block> = new Map()
  private static idToName: Map<number, string> = new Map()

  public static AIR: Block

  public static add(block: Block): Block {
    this.blocks.set(block.name, block)
    this.idToName.set(block.id, block.name)

    return block
  }

  public static clear(): void {
    this.blocks.clear()
    this.idToName.clear()
  }

  public static get(name: string): Block {
    const block = this.blocks.get(name)

    if(!block) throw new Error(`Unknown block: "${name}"`)

    return block.clone()
  }

  public static getById(id: number): Block | null {
    const name = this.idToName.get(id)

    if(!name) return null

    const block = this.blocks.get(name)

    return block ? block.clone() : null
  }

  public static registerItems(): void {
    this.clear()

    this.AIR = this.add(new Air())
    this.add(new Stone())
    this.add(new Grass())
    this.add(new Dirt())
  }

}
