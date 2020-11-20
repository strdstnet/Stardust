import fs from 'fs'
import path from 'path'
import { BinaryData } from '../utils/BinaryData'
import gay from './bedrock/gay.json'

export class BedrockData {

  public static BIOME_DEFINITIONS: Buffer
  public static ENTITY_DEFINITIONS: Buffer
  public static ITEM_DATA_PALETTE: Buffer

  public static loadData(): void {
    BedrockData.BIOME_DEFINITIONS = fs.readFileSync(path.join(__dirname, 'bedrock', 'biome_definitions.nbt'))
    BedrockData.ENTITY_DEFINITIONS = fs.readFileSync(path.join(__dirname, 'bedrock', 'entity_definitions.nbt'))

    const data = new BinaryData()
    data.writeUnsignedVarInt(gay.length)
    for(const g of gay) {
      data.writeString(g.name)
      data.writeLShort(g.id)
      data.writeBoolean(false)
    }

    BedrockData.ITEM_DATA_PALETTE = data.toBuffer()
  }

}