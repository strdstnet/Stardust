import { Packets } from '../../types'
import { ParserType } from '../Packet'
import { BatchedPacket } from './BatchedPacket'
import { BedrockData } from '../../data/BedrockData'

interface IBiomeDefinitionList {
  biomeDefinitions: Buffer,
}

export class BiomeDefinitionList extends BatchedPacket<IBiomeDefinitionList> {

  constructor(p?: Partial<IBiomeDefinitionList>) {
    super(Packets.CHANGE_DIMENSION, [
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
