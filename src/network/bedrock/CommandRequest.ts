import { Item } from '../../item/Item'
import { CommandOriginType } from '../../types/commands'
import { DataType } from '../../types/data'
import { Packets } from '../../types/protocol'
import { UUID } from '../../utils/UUID'
import { BatchedPacket } from '../bedrock/BatchedPacket'

interface ICommandRequest {
  command: string,
  originType: CommandOriginType,
  originUUID: UUID,
  requestId: string,
  internal: boolean,
}

export class CommandRequest extends BatchedPacket<ICommandRequest> {

  constructor(p?: ICommandRequest) {
    super(Packets.COMMAND_REQUEST, [
      { name: 'command', parser: DataType.STRING },
      { name: 'originType', parser: DataType.U_VARINT },
      { name: 'originUUID', parser: DataType.UUID },
      { name: 'requestId', parser: DataType.STRING },
      { name: 'internal', parser: DataType.BOOLEAN },
    ])

    if(p) this.props = Object.assign({}, p as ICommandRequest)
  }

}
