import { Packets, DataType, Dimension } from '../../types'
import { Vector3 } from 'math3d'
import { ParserType } from '../Packet'
import { BatchedPacket } from './BatchedPacket'

interface IChangeDimension {
  dimension: Dimension,
  position: Vector3,
  respawn?: boolean
}

export class ChangeDimension extends BatchedPacket<IChangeDimension> {

  constructor(p?: IChangeDimension) {
    super(Packets.CHANGE_DIMENSION, [
      { name: 'dimension', parser: DataType.VARINT },
      { name: 'position', parser: DataType.VECTOR3 },
      {
        parser({ type, data, props }) {
          if(type === ParserType.ENCODE) {
            data.writeBoolean(props.respawn || false)
          } else {
            props.respawn = data.readBoolean()
          }
        },
      },
    ])

    if(p) this.props = Object.assign({}, p)
  }

}
