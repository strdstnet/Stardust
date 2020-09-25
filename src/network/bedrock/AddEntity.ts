import { EntityPosition } from '../../entity/EntityPosition'
import { Metadata } from '../../entity/Metadata'
import { DataType } from '../../types/data'
import { Packets } from '../../types/protocol'
import { BatchedPacket } from '../bedrock/BatchedPacket'
import { ParserType } from '../Packet'

interface IAddEntityRequired {
  entityRuntimeId: bigint,
  type: string,
  position: EntityPosition,
  metadata: Metadata,
}

interface IAddEntityOptional {
  entityUniqueId: bigint,
}

type IAddEntity = IAddEntityRequired & IAddEntityOptional

export class AddEntity extends BatchedPacket<IAddEntity> {

  constructor(p?: IAddEntityRequired & Partial<IAddEntityOptional>) {
    super(Packets.ADD_ENTITY, [
      { name: 'entityUniqueId', parser: DataType.VARLONG, resolve: props => props.entityUniqueId || props.entityRuntimeId },
      { name: 'entityRuntimeId', parser: DataType.U_VARLONG },
      { name: 'type', parser: DataType.STRING },
      {
        parser({ type, props, data }) {
          if(type === ParserType.ENCODE) {
            data.writeVector3(props.position.coords)
            data.writeVector3(props.position.motion)
            data.writeLFloat(props.position.pitch)
            data.writeLFloat(props.position.yaw)
            data.writeLFloat(props.position.headYaw || props.position.yaw)
          }
        },
      },
      { name: 'attributes', parser: DataType.U_VARINT, resolve: () => 0 },
      { name: 'metadata', parser: DataType.ENTITY_METADATA },
      { name: 'links', parser: DataType.U_VARINT, resolve: () => 0 },
    ])

    if(p) this.props = Object.assign({}, p as IAddEntity)
  }

}
