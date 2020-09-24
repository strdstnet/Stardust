import { Air } from './Air'
import { Block } from './Block'
import { Dirt } from './Dirt'
import { Grass } from './Grass'
import { Stone } from './Stone'
import { NBTFile, NBTParser } from '../data/NBTParser'
import { ListTag } from '../nbt/ListTag'
import { CompoundTag } from '../nbt/CompoundTag'
import { ShortTag } from '../nbt/ShortTag'
import { StringTag } from '../nbt/StringTag'
import { IntTag } from '../nbt/IntTag'

type BlockStateNBT = CompoundTag<{
  id: ShortTag,
  block: CompoundTag<{
    name: StringTag,
    version: IntTag,
    states: CompoundTag,
  }>,
}>

export class BlockMap {

  private static blocks: Map<string, Block> = new Map()
  private static idToName: Map<number, string> = new Map()

  private static blockStates: BlockStateNBT[]

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

  private static registerItems(): void {
    this.clear()

    this.AIR = this.add(new Air())
    this.add(new Stone())
    this.add(new Grass())
    this.add(new Dirt())
  }

  public static async populate(): Promise<void> {
    this.registerItems()

    const parser = new NBTParser<ListTag<BlockStateNBT>>(NBTFile.BLOCK_STATES)
    this.blockStates = parser.parse().value
  }

}
