import { ParserType } from '../Packet'
import { BatchedPacket } from '../bedrock/BatchedPacket'
import { IChainData, IClientData, IToken, Packets } from '../../types/protocol'
import { DataType } from '../../types/data'
import { decodeJWT } from '../../utils/JWT'
import { BinaryData } from '../../utils/BinaryData'

interface ILoginEncode {
  protocol: number,
  chainData: string,
  clientData: string,
}

interface ILogin extends ILoginEncode, IClientData {
  username: string,
  clientUUID: string,
  XUID: string,
  identityPublicKey: string,
  clientId: bigint,
  serverAddress: string,
}

export class Login extends BatchedPacket<ILogin> {

  constructor(p?: ILoginEncode) {
    super(Packets.LOGIN, [
      { name: 'protocol', parser: DataType.INT },
      {
        parser({ type, data, props }) {
          if(type === ParserType.DECODE) {
            const sub = data.readByteArray()

            const chainDataStr = props.chainData = sub.readString(sub.readLInt())
            const chainData = JSON.parse(chainDataStr) as IChainData
            for(const token of chainData.chain) {
              const payload: IToken = decodeJWT(token)

              if(payload.extraData) {
                props.username = payload.extraData.displayName
                props.XUID = payload.extraData.XUID
                props.clientUUID = payload.extraData.identity
                props.identityPublicKey = payload.identityPublicKey
              }
            }

            const clientDataStr = props.clientData = sub.readString(sub.readLInt())
            const clientData = decodeJWT(clientDataStr) as IClientData

            props.clientId = BigInt(clientData.ClientRandomId)
            props.serverAddress = clientData.ServerAddress

            Object.assign(props, clientData)
          } else {
            const sub = new BinaryData()
            // const pos = data.pos
            sub.writeLInt(props.chainData.length)
            sub.writeString(props.chainData, false)

            sub.writeLInt(props.clientData.length)
            sub.writeString(props.clientData, false)

            data.writeByteArray(sub)
          }
        },
      },
    ])

    if(p) this.props = (p as ILogin)
  }

}
