import { Packets } from '../../types'
import { ParserType } from '../Packet'
import { BatchedPacket } from './BatchedPacket'

interface IAvailableCommands {
}

// TODO: Implement Commands
export class AvailableCommands extends BatchedPacket<IAvailableCommands> {

  constructor(p?: Partial<IAvailableCommands>) {
    super(Packets.AVAILABLE_COMMANDS, [
      {
        parser({ type, data, props, value }) {
          if(type === ParserType.ENCODE) {
            data.writeUnsignedVarInt(0)
            data.writeUnsignedVarInt(0)
            data.writeUnsignedVarInt(0)
            data.writeUnsignedVarInt(0)
            data.writeUnsignedVarInt(0)
            data.writeUnsignedVarInt(0)
          } else {
            // TODO: DECODE
          }
        },
      },
    ])

    if(p) this.props = Object.assign({}, p as IAvailableCommands)
  }

}
