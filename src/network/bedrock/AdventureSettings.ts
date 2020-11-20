import { Packets } from '../../types/protocol'
import { AdventureSettingsFlag, BITFLAG_SECOND_SET } from '../../types/world'
import { ParserType } from '../Packet'
import { BatchedPacket } from '../bedrock/BatchedPacket'

interface IAdventureSettings {
  flags: Array<[AdventureSettingsFlag, boolean]>,
  commandPermission: number,
  playerPermission: number,
  entityUniqueId: bigint,
}

export class AdventureSettings extends BatchedPacket<IAdventureSettings> {

  constructor(p?: IAdventureSettings) {
    super(Packets.ADVENTURE_SETTINGS, [
      {
        parser({ type, data, props }) {
          if(type === ParserType.ENCODE) {
            let flags = 0
            let flags2 = 0

            for(const [flag, value] of props.flags) {
              let f = (flag & BITFLAG_SECOND_SET) !== 0

              if(value) {
                if(f) flags2 |= flag
                else flags |= flag
              } else {
                if(f) flags2 &= ~flag
                else flags &= ~flag
              }
            }

            data.writeUnsignedVarInt(flags)
            data.writeUnsignedVarInt(props.commandPermission)
            data.writeUnsignedVarInt(flags2)
            data.writeUnsignedVarInt(props.playerPermission)
            data.writeUnsignedVarInt(0)
            data.writeLLong(props.entityUniqueId)
          } else {
            // TODO: DECODE
          }
        },
      },
    ])

    if(p) this.props = Object.assign({}, p)
  }

}
