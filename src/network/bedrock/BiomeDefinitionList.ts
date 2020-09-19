import { Packets } from '../../types/protocol'
import { ParserType } from '../Packet'
import { BatchedPacket } from '../bedrock/BatchedPacket'
import { BedrockData } from '../../data/BedrockData'

interface IBiomeDefinitionList {
  biomeDefinitions: Buffer,
}

export class BiomeDefinitionList extends BatchedPacket<IBiomeDefinitionList> {

  constructor(p?: Partial<IBiomeDefinitionList>) {
    super(Packets.BIOME_DEFINITION_LIST, [
      {
        parser({ type, data, props, value }) {
          if(type === ParserType.ENCODE) {
            data.append(value)
          } else {
            props.biomeDefinitions = data.readRemaining()
          }
        },
        resolve: () => BedrockData.BIOME_DEFINITIONS,
      },
    ])

    if(p) this.props = Object.assign({}, p as IBiomeDefinitionList)
  }

}
