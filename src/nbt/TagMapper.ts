export class TagMapper {

  public static get(type: TagType): Tag {
    switch(type) {
      case TagType.Byte:
        return new ByteTag()
      case TagType.Short:
        return new ShortTag()
      case TagType.Int:
        return new IntTag()
      case TagType.Long:
        return new LongTag()
      case TagType.Float:
        return new FloatTag()
      case TagType.Double:
        return new DoubleTag()
      case TagType.ByteArray:
        return new ByteArrayTag()
      case TagType.String:
        return new StringTag()
      case TagType.List:
        return new ListTag()
      case TagType.Compound:
        return new CompoundTag()
      case TagType.IntArray:
        return new IntArrayTag()
      case TagType.LongArray:
        return new LongArrayTag()
      default:
        throw new Error(`Unknow tag type: ${type}`)
    }
  }

}

import { ByteArrayTag } from './ByteArrayTag'
import { ByteTag } from './ByteTag'
import { CompoundTag } from './CompoundTag'
import { DoubleTag } from './DoubleTag'
import { FloatTag } from './FloatTag'
import { IntArrayTag } from './IntArrayTag'
import { IntTag } from './IntTag'
import { ListTag } from './ListTag'
import { LongArrayTag } from './LongArrayTag'
import { LongTag } from './LongTag'
import { ShortTag } from './ShortTag'
import { StringTag } from './StringTag'
import { Tag, TagType } from './Tag'
