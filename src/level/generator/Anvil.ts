import { Generator } from './Generator'
import PrisAnvil from 'prismarine-provider-anvil'
import path from 'path'
import { Chunk } from '../Chunk'
import { SubChunk } from '../SubChunk'
import { Tag, TagType } from '../../nbt/Tag'
import { CompoundTag } from '../../nbt/CompoundTag'
import { ByteTag } from '../../nbt/ByteTag'
import { IntTag } from '../../nbt/IntTag'
import { IntArrayTag } from '../../nbt/IntArrayTag'
import { LongTag } from '../../nbt/LongTag'
import { ByteArrayTag } from '../../nbt/ByteArrayTag'
import { ListTag } from '../../nbt/ListTag'
import { TagMapper } from '../../nbt/TagMapper'

const WORLDS_DIR = path.join(__dirname, '..', '..', '..', 'worlds')

type AnvilNBT = CompoundTag<{
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

export class Anvil extends Generator {

  private anvil: PrisAnvil.AnvilClass

  constructor(world: string, version = '1.12') {
    super()

    this.anvil = new (PrisAnvil.Anvil(version))(path.join(WORLDS_DIR, world, 'region'))
  }

  public async chunk(x: number, z: number): Promise<Chunk> {
    const nbt = await this.anvil.loadRaw(x, z)

    if(!nbt) return new Chunk(x, z, [SubChunk.grassPlatform], [], [], [], [])

    const translated = (this.translateNBT(nbt) as AnvilNBT)

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

    return new Chunk(
      level.val('xPos'),
      level.val('zPos'),
      subChunks,
      level.val('Entities'),
      level.val('TileEntities'),
      level.val('Biomes'),
      level.val('HeightMap'),
    )
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  public translateNBT(nbt: any, name: string = nbt.name, nbtType: string = nbt.type): Tag {
    const type = this.translateNBTType(nbtType)

    const tag = TagMapper.get(type)
    tag.name = name

    switch(type) {
      case TagType.Compound:
        for(const [name, child] of Object.entries(nbt.value)) {
          (tag as CompoundTag).add(this.translateNBT(child, name))
        }
        break
      case TagType.List:
        tag.value = nbt.value.value.map((t: any) => this.translateNBT({ value: t }, t.name, nbt.value.type))
        ;(tag as ListTag).valueType = this.translateNBTType(nbt.value.type)
        break
      case TagType.Int:
      case TagType.IntArray:
      case TagType.Long:
      case TagType.LongArray:
      case TagType.String:
      case TagType.Byte:
      case TagType.ByteArray:
      case TagType.Short:
      case TagType.Double:
      case TagType.Float:
        tag.value = nbt.value
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

}