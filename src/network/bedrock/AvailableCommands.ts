import { Packets } from '../../types/protocol'
import { ParserType } from '../Packet'
import { BatchedPacket } from '../bedrock/BatchedPacket'

interface IAvailableCommands {
}

// TODO: Implement Commands
export class AvailableCommands extends BatchedPacket<IAvailableCommands> {

  constructor(p?: Partial<IAvailableCommands>) {
    super(Packets.AVAILABLE_COMMANDS, [
      {
        parser({ type, data }) {
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
