import { TileTag, Vector3 } from '@strdstnet/utils.binary'
import { Spawnable } from './Spawnable'
import { BedColor } from './types'
import { ByteTag } from '@strdst/utils.nbt'

export class Bed extends Spawnable {

  constructor(pos: Vector3, public color = BedColor.RED) {
    super('minecraft:bed', pos)
  }

  protected modifyTag(tag: TileTag): TileTag {
    tag.add(new ByteTag().assign('color', this.color))
    return tag
  }

}