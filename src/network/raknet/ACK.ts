import { Acknowledgement } from './Acknowledgement'
import { Packets } from '../../types/protocol'

export class ACK extends Acknowledgement {

  constructor(sequences?: number[]) {
    super(Packets.ACK, sequences)
  }

}
