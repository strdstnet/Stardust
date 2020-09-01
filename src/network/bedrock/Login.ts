import { Packets, DataType } from '../../types'
import { ParserType } from '../Packet'
import { decodeJWT } from '../../utils'
import { BatchedPacket } from './BatchedPacket'
import { PacketData } from '../PacketData'

interface ILoginEncode {
  protocol: number,
  chainData: string,
  clientData: string,
}

interface ILogin extends ILoginEncode {
  displayName: string,
  identity: string,
  XUID: string,
  identityPublicKey: string,
  clientId: bigint,
  serverAddress: string,
}

interface IChainData {
  chain: [string, string, string],
}

interface IToken {
  identityPublicKey: string,
  exp: number,
  nbf: number,
  certificateAuthority?: boolean,
  randomNonce?: number,
  iss?: string,
  iat?: number,
  extraData?: {
    XUID: string,
    identity: string,
    displayName: string,
    titleId: string,
  },
}

interface IClientData {
  ClientRandomId: number,
  ServerAddress: string,
}

export class Login extends BatchedPacket<ILogin> {

  constructor(p?: ILoginEncode) {
    super(Packets.LOGIN, [
      { name: 'protocol', parser: DataType.INT },
      {
        name: 'logintest',
        parser({ type, data, props }) {
          if(type === ParserType.DECODE) {
            const sub = data.readByteArray()

            const chainDataStr = props.chainData = sub.readString(sub.readLInt())
            const chainData: IChainData = JSON.parse(chainDataStr)
            for(const token of chainData.chain) {
              const payload: IToken = decodeJWT(token)

              if(payload.extraData) {
                props.displayName = payload.extraData.displayName
                props.XUID = payload.extraData.XUID
                props.identity = payload.extraData.identity
                props.identityPublicKey = payload.identityPublicKey
              }
            }

            const clientDataStr = props.clientData = sub.readString(sub.readLInt())
            const clientData: IClientData = decodeJWT(clientDataStr)

            props.clientId = BigInt(clientData.ClientRandomId)
            props.serverAddress = clientData.ServerAddress
          } else {
            const sub = new PacketData()
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
