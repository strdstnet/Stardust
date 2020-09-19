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
            let flags2 = -1

            for(const [flag, value] of props.flags) {
              if((flag & BITFLAG_SECOND_SET) !== 0) {
                if(value) flags2 |= flag
                else flags2 &= ~flag
              } else {
                if(value) flags |= flag
                else flags &= ~flag
              }
            }

            data.writeUnsignedVarInt(flags)
            data.writeUnsignedVarInt(props.commandPermission)
            data.writeUnsignedVarInt(flags2)
            data.writeUnsignedVarInt(props.playerPermission)
            data.writeUnsignedVarInt(0)
            data.writeLLong(BigInt(props.entityUniqueId))
          } else {
            // TODO: DECODE
          }
        },
      },
    ])

    if(p) this.props = Object.assign({}, p)
  }

}
