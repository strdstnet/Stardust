type BlockStateNBT = CompoundTag<{
  id: ShortTag,
  block: CompoundTag<{
    name: StringTag,
    version: IntTag,
    states: CompoundTag,
  }>,
}>

type R12StateNBT = CompoundTag<{
  name: StringTag,
  version: IntTag,
  states: CompoundTag,
}>

interface IR12State {
  name: string,
  meta: number,
  state: R12StateNBT,
}

export class BlockMap {

  private static blocks: Map<string, Block> = new Map()
  private static idToName: Map<number, string> = new Map()

  public static runtimeToLegacy: Map<number, number> = new Map()
  public static legacyToRuntime: Map<number, number> = new Map()

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

  public static getName(id: number): string | null {
    return this.idToName.get(id) || null
  }

  private static registerItems(): void {
    this.clear()

    for(const [ name, id ] of Object.entries(LegacyIdMap)) {
      this.idToName.set(id, name)
    }

    this.AIR = this.add(new Air())
    this.add(new Stone())
    this.add(new Grass())
    this.add(new Dirt())
  }

  public static populate(): void {
    this.registerItems()

    const parser = new NBTFile(NBTFileId.BLOCK_STATES)
    const states = parser.readTag<ListTag<BlockStateNBT>>().value

    const legacyStates: IR12State[] = []
    const legacyStateData = new DataFile('r12_to_current_block_map.bin')
    while(!legacyStateData.feof) {
      const name = legacyStateData.readString()
      const meta = legacyStateData.readLShort()
      const state: R12StateNBT = legacyStateData.readTag()

      legacyStates.push({
        name,
        meta,
        state,
      })
    }



    const idToState: Map<string, Set<number>> = new Map()
    for(const [ id, state ] of states.entries()) {
      const name = state.get('block').val('name')

      const set = idToState.get(name)
      idToState.set(name, set ? set.add(id) : new Set([ id ]))
    }

    stateLoop: for(const { name, meta, state } of legacyStates) {
      const id = (LegacyIdMap as any)[name]

      if(typeof id === 'undefined') throw new Error(`No legacy ID found for ${name}`)

      if(meta > 15) continue

      const mappedName = state.val('name')
      const stateVal = idToState.get(mappedName)

      if(!stateVal) throw new Error(`No network ID found for ${mappedName}`)

      for(const networkStateId of stateVal) {
        const networkState = states[networkStateId]

        if(state.equals(networkState.get('block'))) {
          this.legacyToRuntime.set((id << 4) | meta, networkStateId)
          this.runtimeToLegacy.set(networkStateId, (id << 4) | meta)
          continue stateLoop
        }
      }
    }
  }

}

import { Air } from './Air'
import { Block } from './Block'
import { Dirt } from './Dirt'
import { Grass } from './Grass'
import { Stone } from './Stone'
import { NBTFile, NBTFileId } from '../data/NBTFile'
import { ListTag } from '../nbt/ListTag'
import { CompoundTag } from '../nbt/CompoundTag'
import { ShortTag } from '../nbt/ShortTag'
import { StringTag } from '../nbt/StringTag'
import { IntTag } from '../nbt/IntTag'
import LegacyIdMap from '../data/legacy_id_map.json'
import { DataFile } from '../data/DataFile'
