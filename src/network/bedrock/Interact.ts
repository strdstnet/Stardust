import { BatchedPacket } from '../bedrock/BatchedPacket'
import { Packets } from '../../types/protocol'
import { DataType } from '../../types/data'
import { InteractAction } from '../../types/player'

interface IInteract {
  action: number,
  target: bigint,
  x: number,
  y: number,
  z: number,
}

export class Interact extends BatchedPacket<IInteract> {

  constructor(p?: IInteract) {
    super(Packets.INTERACT, [
      { name: 'action', parser: DataType.BYTE },
      { name: 'target', parser: DataType.U_VARLONG },
      {
        parser({ data, props }) {
          if (props.action == InteractAction.MOUSE_OVER) {
            data.readLFloat()
            data.readLFloat()
            data.readLFloat()
          }
        },
      },
    ])

    if(p) this.props = p
  }

}
