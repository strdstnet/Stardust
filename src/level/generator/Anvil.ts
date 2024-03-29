import { Generator } from './Generator'
import { Anvil as McAnvil } from '@strdstnet/utils.anvil'
import path from 'path'
import { Chunk } from '../Chunk'
import { SubChunk } from '../SubChunk'
import { CompoundTag, ByteTag, IntTag, IntArrayTag, LongTag, ByteArrayTag, ListTag } from '@strdst/utils.nbt'

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

  private constructor(private anvil: McAnvil) {
    super()
  }

  public static async init(world: string): Promise<Anvil> {
    const levelPath = path.join(WORLDS_DIR, world)

    return new Anvil(await McAnvil.parse(levelPath))
  }

  public async chunk(x: number, z: number): Promise<Chunk> {
    const nbt = this.anvil.getChunk(x, z) as AnvilNBT

    if(!nbt) return new Chunk(x, z, [SubChunk.grassPlatform], [], [], [], [])

    const level = nbt.get('Level')
    const subChunks: SubChunk[] = []

    for(const section of level.val('Sections') || []) {
      if(section.val('Y') === -1) {
        subChunks.push(SubChunk.empty)
      } else {
        subChunks[section.val('Y')] = new SubChunk(
          SubChunk.reorderBytes(section.val('Blocks') || []),
          SubChunk.reorderNibbles(section.val('Data') || []),
          SubChunk.reorderNibbles(section.val('SkyLight') || [], 0xff),
          SubChunk.reorderNibbles(section.val('BlockLight') || []),
        )
      }
    }

    return new Chunk(
      level.val('xPos') || x,
      level.val('zPos') || z,
      subChunks,
      level.val('Entities') || [],
      level.val('TileEntities') || [],
      level.val('Biomes') || [],
      level.val('HeightMap') || [],
    )
  }

}