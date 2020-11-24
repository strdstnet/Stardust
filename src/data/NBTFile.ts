import { DataFile } from './DataFile'

export enum NBTFileId {
  ENTITY_DEFINITIONS = 'entity_definitions.nbt',
}

export class NBTFile extends DataFile {

  constructor(file: NBTFileId) {
    super(file)
  }

}
