import { Packets } from '../../types/protocol'
import { DataType } from '../../types/data'
import { ParserType } from '../Packet'
import { BatchedPacket } from '../bedrock/BatchedPacket'

export enum TextType {
  RAW = 0,
  CHAT = 1,
  TRANSLATION = 2,
	POPUP = 3,
	JUKEBOX_POPUP = 4,
	TIP = 5,
	SYSTEM = 6,
	WHISPER = 7,
	ANNOUNCEMENT = 8,
	JSON_WHISPER = 9,
	JSON = 10,
}

export interface IText {
  type: TextType,
  needsTranslation: boolean,
  sourceName: string,
  message: string,
  parameters: string[],
  xboxUserId: string,
  platformChatId: string,
}

export class Text extends BatchedPacket<IText> {

  constructor(props?: Partial<IText>) {
    super(Packets.TEXT, [
      { name: 'type', parser: DataType.BYTE },
      { name: 'needsTranslation', parser: DataType.BOOLEAN, resolve: (props) => props.type === TextType.TRANSLATION },
      {
        parser({ type, data, props }) {
          if(type === ParserType.DECODE) {
            props.parameters = []
            props.sourceName = ''
            switch(props.type) {
              case TextType.CHAT:
              case TextType.WHISPER:
              case TextType.ANNOUNCEMENT:
                props.sourceName = data.readString()
              case TextType.RAW:
              case TextType.TIP:
              case TextType.SYSTEM:
              case TextType.JSON_WHISPER:
              case TextType.JSON:
                props.message = data.readString()
                break
              case TextType.TRANSLATION:
              case TextType.POPUP:
              case TextType.JUKEBOX_POPUP:
                props.message = data.readString()
                const count = data.readUnsignedVarInt()
                for(let i = 0; i < count; i++) {
                  props.parameters.push(data.readString())
                }
                break
              default:
                throw new Error(`Unknown TextType ${props.type} (DECODE)`)
            }
          } else {
            switch(props.type) {
              case TextType.CHAT:
              case TextType.WHISPER:
              case TextType.ANNOUNCEMENT:
                data.writeString(props.sourceName)
              case TextType.RAW:
              case TextType.TIP:
              case TextType.SYSTEM:
              case TextType.JSON_WHISPER:
              case TextType.JSON:
                data.writeString(props.message)
                break
              case TextType.TRANSLATION:
              case TextType.POPUP:
              case TextType.JUKEBOX_POPUP:
                data.writeString(props.message)
                data.writeUnsignedVarInt(props.parameters.length)
                for(const param of props.parameters) {
                  data.writeString(param)
                }
                break
              default:
                throw new Error(`Unknown TextType ${props.type} (ENCODE)`)
            }
          }
        },
      },
      { name: 'xboxUserId', parser: DataType.STRING, resolve: () => '' },
      { name: 'platformChatId', parser: DataType.STRING, resolve: () => '' },
    ])

    if(props) this.props = Object.assign({}, props as IText)
  }

}
