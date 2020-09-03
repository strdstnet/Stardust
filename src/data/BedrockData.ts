import fs from 'fs'
import path from 'path'

export class BedrockData {

  public static BIOME_DEFINITIONS: Buffer
  public static ENTITY_DEFINITIONS: Buffer

  public static loadData(): void {
    BedrockData.BIOME_DEFINITIONS = fs.readFileSync(path.join(__dirname, 'biome_definitions.nbt'))
    BedrockData.ENTITY_DEFINITIONS = fs.readFileSync(path.join(__dirname, 'entity_definitions.nbt'))
  }

}