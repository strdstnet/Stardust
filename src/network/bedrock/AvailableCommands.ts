import { Packets } from '../../types/protocol'
import { ParserType } from '../Packet'
import { BatchedPacket } from '../bedrock/BatchedPacket'
import { CommandHandler } from '../../command/CommandHandler'

// TODO: Implement Commands
export class AvailableCommands extends BatchedPacket<never> {

  constructor() {
    super(Packets.AVAILABLE_COMMANDS, [
      {
        parser({ type, data }) {
          if(type === ParserType.ENCODE) {
            data.writeUnsignedVarInt(0) // enum values
            data.writeUnsignedVarInt(0) // postfix data
            data.writeUnsignedVarInt(0) // enum indexes

            data.writeUnsignedVarInt(CommandHandler.commands.size)
            for(const [, command] of CommandHandler.commands) {
              data.writeString(command.trigger)
              data.writeString(command.description)
              data.writeByte(0)
              data.writeByte(command.permission)
              data.writeLInt(-1) // alias enum indexes
              data.writeUnsignedVarInt(1)
              data.writeUnsignedVarInt(command.args.length)
              for(const arg of command.args) {
                data.writeString(arg.name)
                data.writeLInt(0x100000 | arg.type)
                data.writeBoolean(arg.optional)
                data.writeByte(0)
              }
            }

            data.writeUnsignedVarInt(0)
            data.writeUnsignedVarInt(0)
          } else {
            // TODO: DECODE
          }
        },
      },
    ])
  }

}
