import fs from 'fs'
import path from 'path'
import { Tag } from '../nbt/Tag'
import { BinaryData } from '../utils/BinaryData'

export enum NBTFile {
  ENTITY_DEFINITIONS = 'entity_definitions.nbt',
  BLOCK_STATES = 'block_states.nbt',
}

export class NBTParser<V extends Tag = Tag> {

  private data: BinaryData

  constructor(file: NBTFile) {
    const buf = fs.readFileSync(path.join(__dirname, file))
    this.data = new BinaryData(buf)
  }

  public parse(): V {
    return this.data.readTag() as V
  }

}

