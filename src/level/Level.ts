import { Chunk } from './Chunk'
import { SubChunk } from './SubChunk'
import PrisAnvil from 'prismarine-provider-anvil'
import path from 'path'
import { CompoundTag } from '../nbt/CompoundTag'
import { IntArrayTag } from '../nbt/IntArrayTag'
import { IntTag } from '../nbt/IntTag'
import { LongTag } from '../nbt/LongTag'
import { StringTag } from '../nbt/StringTag'
import { Tag, TagType } from '../nbt/Tag'
import { LongArrayTag } from '../nbt/LongArrayTag'
import { ListTag } from '../nbt/ListTag'
import { EndTag } from '../nbt/EndTag'
import { ByteTag } from '../nbt/ByteTag'
import { ByteArrayTag } from '../nbt/ByteArrayTag'
import { ShortTag } from '../nbt/ShortTag'
import { DoubleTag } from '../nbt/DoubleTag'
import { FloatTag } from '../nbt/FloatTag'

const Anvil = PrisAnvil.Anvil('1.12')

const WORLDS_DIR = path.join(__dirname, '..', '..', 'worlds')

type LevelNBT = CompoundTag<{
  Level: CompoundTag<{
    LightPopulated: ByteTag,
    zPos: IntTag,
    HeightMap: IntArrayTag,
    LastUpdate: LongTag,
    Biomes: ByteArrayTag,
    InhabitedTime: LongTag,
    xPos: IntTag,
    TileEntities: ListTag<CompoundTag>,
    Entities: ListTag<CompoundTag>,
    TileTicks: ListTag,
    Sections: ListTag<CompoundTag<{
      Y: ByteTag,
      SkyLight: ByteArrayTag,
      Blocks: ByteArrayTag,
      BlockLight: ByteArrayTag,
      Data: ByteArrayTag,
    }>>,
    V: ByteTag,
    TerrainPopulated: ByteTag
  }>,
}>

export class Level {

  private static LAST_ID = 0

  public id = ++Level.LAST_ID

  private chunkCache: Map<string, Chunk> = new Map()

  constructor(public name: string, public anvil: PrisAnvil.AnvilClass) {
    this.loadChunk(0, 0)
  }

  private async loadChunk(x: number, z: number): Promise<Chunk> {
    const nbt = await this.anvil.loadRaw(x, z)

    if(!nbt) return new Chunk(x, z, [SubChunk.grassPlatform], [], [], [], [])

    const translated = (this.translateNBT(nbt) as LevelNBT)

    const level = translated.get('Level')
    const subChunks: SubChunk[] = []
    for(const section of level.val('Sections')) {
      if(section.val('Y') === -1) {
        subChunks.push(SubChunk.empty)
      } else {
        subChunks[section.val('Y')] = new SubChunk(
          SubChunk.reorderNibbles(section.val('Data') || []),
          SubChunk.reorderBytes(section.val('Blocks') || []),
          SubChunk.reorderNibbles(section.val('SkyLight') || []),
          SubChunk.reorderNibbles(section.val('BlockLight') || []),
        )
      }
    }

    const chunk = new Chunk(
      level.val('xPos'),
      level.val('zPos'),
      subChunks,
      level.val('Entities'),
      level.val('TileEntities'),
      level.val('Biomes'),
      level.val('HeightMap'),
    )

    this.chunkCache.set(Level.getChunkId(x, z), chunk)

    return chunk
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
      case TagType.Short:
        tag = new ShortTag(name, nbt.value)
        break
      case TagType.Double:
        tag = new DoubleTag(name, nbt.value)
        break
      case TagType.Float:
        tag = new FloatTag(name, nbt.value)
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
      case 'short':
        return TagType.Short
      case 'double':
        return TagType.Double
      case 'float':
        return TagType.Float
      default:
        throw new Error(`Unknown tag type: ${type}`)
    }
  }

  public static getChunkId(x: number, z: number): string {
    return `chunk:${x}:${z}`
  }

  public static TestWorld(): Level {
    // return new Level('TestLevel', new Anvil(path.join(WORLDS_DIR, 'one_eight_yes', 'region')))
    return new Level('TestLevel', new Anvil(path.join(WORLDS_DIR, '1_12_2', 'region')))
  }

  public async getChunkAt(x: number, z: number): Promise<Chunk> {
    // const inCache = this.chunkCache.get(Level.getChunkId(x, z))
    // return inCache ? inCache : await this.loadChunk(x, z)
    return this.loadChunk(x, z)
  }

  // public get baseChunk(): Chunk {
  //   return this.getChunkAt(0, 0) as Chunk
  // }

}