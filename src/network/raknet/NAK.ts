import { Acknowledgement } from './Acknowledgement'
import { Packets } from '../../types'

export class NAK extends Acknowledgement {

  constructor(sequences?: number[]) {
    super(Packets.NAK, sequences)
  }

}
