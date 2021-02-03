export class BlockMap {

  private static blocks: Map<string, Block> = new Map()
  private static nameToId: Map<string, number> = new Map()
  private static idToName: Map<number, string> = new Map()

  public static runtimeToLegacy: Map<number, number> = new Map()
  public static legacyToRuntime: Map<number, number> = new Map()

  public static WATERLIKE_BLOCKS = ['minecraft:flowing_water', 'minecraft:water', 'minecraft:seagrass', 'minecraft:kelp', 'minecraft:bubble_column']

  public static get AIR(): Block {
    return this.blocks.get('minecraft:air') as Block
  }

  public static get count(): number {
    return this.blocks.size
  }

  public static add(name: string, id: number, meta = 0, hardness = 0, item?: string, edu = false, toolType = BlockToolType.NONE): Block {
    if(this.idToName.has(id)) return this.blocks.get(name) as Block

    const block = new Block(name, meta, hardness, item || name, edu, toolType)

    this.blocks.set(name, block)
    this.nameToId.set(name, id)
    this.idToName.set(id, name)

    return block.clone()
  }

  private static clear(): void {
    this.blocks.clear()
    this.nameToId.clear()
    this.idToName.clear()
  }

  public static get(name: string): Block {
    const block = this.blocks.get(name)

    if(!block) throw new Error(`Unknown block: ${name}`)

    return block.clone()
  }

  public static getById(id: number): Block {
    return this.get(this.getName(id))
  }

  public static getName(id: number): string {
    const name = this.idToName.get(id)

    if(!name) throw new Error(`Couldn't find block name for ID: ${id}`)

    return name
  }

  public static getId(name: string): number {
    const id = this.nameToId.get(name.toLowerCase())

    if(typeof id === 'undefined') throw new Error(`Couldn't find block ID for name: ${name}`)

    return id
  }

  private static async registerBlocks(): Promise<void> {
    this.clear()

    for await(const block of BlockDefinition.blocks) {
      const { name, id, edu, hardness, item, toolType } = Object.assign({}, BlockDefinition.defaults, block)
      this.add(name, id, 0, hardness, item, edu, toolType)
    }
  }

  public static async populate(): Promise<void> {
    await this.registerBlocks()

    const BlockStates = (await import('../data/block_states.json')).default

    for await(const { id, meta, runtimeId } of BlockStates) {
      this.legacyToRuntime.set((id << 4) | meta, runtimeId)
      this.runtimeToLegacy.set(runtimeId, (id << 4) | meta)
    }
  }

}

import { Block } from './Block'
import BlockDefinition from '../data/blocks.json'
import { BlockToolType } from '../item/Tool'
