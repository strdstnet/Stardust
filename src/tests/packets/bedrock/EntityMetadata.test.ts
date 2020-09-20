import { Metadata } from '../../../entity/Metadata'
import { EntityMetadata } from '../../../network/bedrock/EntityMetadata'
import { MetadataFlag, MetadataType } from '../../../types/player'
import { BinaryData, DataLengths } from '../../../utils/BinaryData'

describe('EntityMetadata', () => {
  it('encodes & decodes correctly', async () => {
    const id = 1n
    const metadata = new Metadata()

    metadata.add(MetadataFlag.INDEX, MetadataType.LONG, 0n)
    metadata.add(MetadataFlag.MAX_AIR, MetadataType.SHORT, 400)
    metadata.add(MetadataFlag.ENTITY_LEAD_HOLDER_ID, MetadataType.LONG, -1n)
    metadata.add(MetadataFlag.NAMETAG, MetadataType.STRING, 'boobies')
    metadata.add(MetadataFlag.SCALE, MetadataType.FLOAT, 1)
    metadata.add(MetadataFlag.BOUNDING_BOX_WIDTH, MetadataType.FLOAT, 2)
    metadata.add(MetadataFlag.BOUNDING_BOX_HEIGHT, MetadataType.FLOAT, 5)
    metadata.add(MetadataFlag.AIR, MetadataType.SHORT, 0)

    const encoded = new EntityMetadata({
      entityRuntimeId: id,
      metadata,
    }).encode().toBuffer()

    const decoded = new EntityMetadata().parse(new BinaryData(encoded)).props

    expect(decoded.metadata.size).toBe(metadata.size)
    expect(decoded.metadata.all()).toEqual(metadata.all())
  })
})
