import { Chunk } from './Chunk'
import { SubChunk } from './SubChunk'
import PrisAnvil from 'prismarine-provider-anvil'
import path from 'path'
import { CompoundTag, IntArrayTag, IntTag, LongTag, StringTag, Tag, TagType, LongArrayTag, ListTag, EndTag, ByteTag, ByteArrayTag } from '../nbt'

const Anvil = PrisAnvil.Anvil('1.16')

const WORLDS_DIR = path.join(__dirname, '..', 'worlds')

export class Level {

  private static LAST_ID = 0

  public id = ++Level.LAST_ID

  private chunkCache: Map<string, Chunk> = new Map()

  constructor(public name: string, public anvil: PrisAnvil.AnvilClass) {
    // for(const chunk of chunks) {
    //   this.chunks.set(Level.getChunkId(chunk.x, chunk.y), chunk)
    // }
    // level.loadRaw(0, 0).then(data => console.log('LOADED', data))
    this.loadChunk(0, 0)
  }

  public async loadChunk(x: number, y: number): Promise<void> {
    const nbt = await this.anvil.loadRaw(x, y)

    const translated = this.translateNBT(nbt)

    console.log(translated)
    console.log(JSON.stringify(translated, null, 2))
  }

  public translateNBT(nbt: any, name: string = nbt.name, nbtType: string = nbt.type): Tag {
    let tag: Tag

    const type = this.translateNBTType(nbtType)

    switch(type) {
      case TagType.Compound:
        tag = new CompoundTag(name)

        for(const [name, child] of Object.entries(nbt.value)) {
          (tag as CompoundTag).add(this.translateNBT(child, name))
        }
        break
      case TagType.Int:
        tag = new IntTag(name, nbt.value)
        break
      case TagType.IntArray:
        tag = new IntArrayTag(name, nbt.value)
        break
      case TagType.Long:
        tag = new LongTag(name, nbt.value)
        break
      case TagType.LongArray:
        tag = new LongArrayTag(name, nbt.value)
        break
      case TagType.String:
        tag = new StringTag(name, nbt.value)
        break
      case TagType.List:
        const values = nbt.value.value.map((t: any) => this.translateNBT({ value: t }, t.name, nbt.value.type))
        tag = new ListTag(name, this.translateNBTType(nbt.value.type), values)
        break
      case TagType.End:
        tag = new EndTag(name)
        break
      case TagType.Byte:
        tag = new ByteTag(name, nbt.value)
        break
      case TagType.ByteArray:
        tag = new ByteArrayTag(name, nbt.value)
        break
      default:
        throw new Error(`Unknown tag type: ${nbt.type}`)
    }

    return tag
  }

  private translateNBTType(type: string): TagType {
    switch(type) {
      case 'compound':
        return TagType.Compound
      case 'int':
        return TagType.Int
      case 'intArray':
        return TagType.IntArray
      case 'long':
        return TagType.Long
      case 'longArray':
        return TagType.LongArray
      case 'string':
        return TagType.String
      case 'list':
        return TagType.List
      case 'end':
        return TagType.End
      case 'byte':
        return TagType.Byte
      case 'byteArray':
        return TagType.ByteArray
      default:
        throw new Error(`Unknown tag type: ${type}`)
    }
  }

  public static getChunkId(x: number, y: number): string {
    return `chunk:${x}:${y}`
  }

  public static TestWorld(): Level {
    return new Level('TestLevel', new Anvil(path.join(WORLDS_DIR, 'world', 'region')))
  }

  public getChunkAt(x: number, y: number): Chunk | null {
    return this.chunkCache.get(Level.getChunkId(x, y)) || null
  }

  // public get baseChunk(): Chunk {
  //   return this.getChunkAt(0, 0) as Chunk
  // }

}