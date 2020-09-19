import { Packet, ParserType } from '../Packet'
import { Packets } from '../../types/protocol'
import { BinaryData } from '../../utils/BinaryData'

interface IAcknowledgement {
  sequences: number[],
}

export abstract class Acknowledgement extends Packet<IAcknowledgement> {

  public static MAX_PACKETS = 4096

  constructor(pkId: Packets.ACK | Packets.NAK, sequences?: number[]) {
    super(pkId, [
      {
        parser({ type, data, props, self }) {
          const ack = (self as Acknowledgement)

          if(type === ParserType.ENCODE) {
            let records = 0

            const ids = props.sequences.sort((a, b) => a - b)

            const subData = new BinaryData()
            if(ids.length) {
              let start = ids[0]
              let last = ids[0]

              ids.forEach(id => {
                if((id - last) === 1) {
                  last = id
                } else if((id - last) > 1) {
                  ack.add(subData, start, last)

                  start = last = id
                  records++
                }
              })

              ack.add(subData, start, last)
              records++
            }

            data.writeShort(records)
            data.append(subData.buf)
          } else {
            props.sequences = []
            const count = data.readShort()
            let cnt = 0

            for(let i = 0; i < count && !data.feof && cnt < Acknowledgement.MAX_PACKETS; i++) {
              const range = !data.readBoolean()

              if(range) {
                const start = data.readLTriad()
                let end = data.readLTriad()

                if((end - start) > 512) {
                  end = start + 512
                }

                for(let c = start; c <= end; c++) {
                  props.sequences.push(c)
                  cnt++
                }
              } else {
                props.sequences.push(data.readLTriad())
                cnt++
              }
            }
          }
        },
      },
    ])

    if(sequences) this.props.sequences = sequences
  }

  private add(data: BinaryData, a: number, b: number) {
    if(a === b) {
      data.writeBoolean(true)
      data.writeLTriad(a)
    } else {
      data.writeBoolean(false)
      data.writeLTriad(a)
      data.writeLTriad(b)
    }
  }

}
