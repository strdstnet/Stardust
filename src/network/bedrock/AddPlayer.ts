import { Item } from '../../item/Item'
import { DataType, PlayerPosition } from '../../types/data'
import { Packets } from '../../types/protocol'
import { UUID } from '../../utils/UUID'
import { BatchedPacket } from '../bedrock/BatchedPacket'
import { ParserType } from '../Packet'

interface IAddPlayerRequired {
  uuid: UUID,
  username: string,
  entityUniqueId: bigint,
  entityRuntimeId: bigint,
  position: PlayerPosition,
}

interface IAddPlayerOptional {
  platformChatId: string,
  item: Item,
  deviceId: string,
  buildPlatform: number,
}

type IAddPlayer = IAddPlayerRequired & IAddPlayerOptional

export class AddPlayer extends BatchedPacket<IAddPlayer> {

  constructor(p?: IAddPlayerRequired & Partial<IAddPlayerOptional>) {
    super(Packets.ADD_PLAYER, [
      { name: 'uuid', parser: DataType.UUID },
      { name: 'username', parser: DataType.STRING },
      { name: 'entityUniqueId', parser: DataType.VARLONG },
      { name: 'entityRuntimeId', parser: DataType.U_VARLONG },
      { name: 'platformChatId', parser: DataType.STRING, resolve: () => '' },
      {
        parser({ type, props, data }) {
          if(type === ParserType.ENCODE) {
            data.writeVector3(props.position.location)
            data.writeVector3(props.position.motion)
            data.writeLFloat(props.position.pitch)
            data.writeLFloat(props.position.yaw)
            data.writeLFloat(props.position.headYaw || props.position.yaw)
          }
        },
      },
      { name: 'item', parser: DataType.CONTAINER_ITEM, resolve: () => Item.AIR },
      {
        name: 'metadata',
        parser({ type, data }) {
          if(type === ParserType.ENCODE) {
            data.writeUnsignedVarInt(0) // TODO: _
          }
        },
      },
      { parser: DataType.U_VARINT, resolve: () => 0 },
      { parser: DataType.U_VARINT, resolve: () => 0 },
      { parser: DataType.U_VARINT, resolve: () => 0 },
      { parser: DataType.U_VARINT, resolve: () => 0 },
      { parser: DataType.U_VARINT, resolve: () => 0 },
      { parser: DataType.L_LONG, resolve: () => 0n },
      { parser: DataType.U_VARINT, resolve: () => 0 }, // Link count
      { name: 'deviceId', parser: DataType.STRING, resolve: () => '' },
      { name: 'buildPlatform', parser: DataType.L_INT, resolve: () => 0 },
    ])

    if(p) this.props = Object.assign({}, p as IAddPlayer)
  }

}
