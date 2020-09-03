import { Packets } from '../../types'
import { ParserType } from '../Packet'
import { BatchedPacket } from './BatchedPacket'
import { BedrockData } from '../../data/BedrockData'

interface IEntityDefinitionList {
  entityDefinitions: Buffer,
}

export class EntityDefinitionList extends BatchedPacket<IEntityDefinitionList> {

  constructor(p?: Partial<IEntityDefinitionList>) {
    super(Packets.ENTITY_DEFINITION_LIST, [
      {
        parser({ type, data, props, value }) {
          if(type === ParserType.ENCODE) {
            data.append(value)
          } else {
            props.entityDefinitions = data.readRemaining()
          }
        },
        resolve: () => BedrockData.ENTITY_DEFINITIONS,
      },
    ])

    if(p) this.props = Object.assign({}, p as IEntityDefinitionList)
  }

}
