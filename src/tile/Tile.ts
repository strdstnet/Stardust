import { ITile, TileIsSpawnable, TileTag, Vector3 } from '@strdstnet/utils.binary'
import { CompoundTag, StringTag, IntTag } from '@strdst/utils.nbt'

export class Tile implements ITile {

  public static tileCount = 0

  public [TileIsSpawnable] = false

  public id = ++Tile.tileCount

  constructor(public nid: string, public pos: Vector3) {
  }

  public get tag(): TileTag {
    const tag: TileTag = new CompoundTag()
    tag.add(new StringTag().assign('id', this.nid))
    tag.add(new IntTag().assign('x', this.pos.x))
    tag.add(new IntTag().assign('y', this.pos.y))
    tag.add(new IntTag().assign('z', this.pos.z))

    return this.modifyTag(tag)
  }

  protected modifyTag(tag: TileTag): TileTag {
    return tag
  }

}