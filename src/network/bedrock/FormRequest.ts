import { Packets } from '../../types/protocol'
import { DataType } from '../../types/data'
import { BatchedPacket } from '../bedrock/BatchedPacket'

interface IFormRequest {
  formId: number,
  formData: string,
}

export class FormRequest extends BatchedPacket<IFormRequest> {

  constructor(p?: IFormRequest) {
    super(Packets.FORM_REQUEST, [
      { name: 'formId', parser: DataType.U_VARINT },
      { name: 'formData', parser: DataType.STRING },
    ])

    if(p) this.props = Object.assign({}, p)
  }

}
