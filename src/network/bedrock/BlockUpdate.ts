import { Vector3 } from 'math3d'
import { DataType } from '../../types/data'
import { Packets } from '../../types/protocol'
import { BatchedPacket } from './BatchedPacket'

export enum BlockUpdateFlags {
  NONE      = 0b0000,
  NEIGHBORS = 0b0001,
  NETWORK   = 0b0010,
  NOGRAPHIC = 0b0100,
  PRIORITY  = 0b1000,
}

export enum BlockUpdateDataLayer {
  NORMAL = 0,
  LIQUID = 1,
}

interface IBlockUpdateRequired {
  position: Vector3,
  blockRuntimeId: number,
}

interface IBlockUpdateOptional {
  flags: BlockUpdateFlags,
  dataLayer: BlockUpdateDataLayer,
}

type IBlockUpdate = IBlockUpdateRequired & IBlockUpdateOptional

export class BlockUpdate extends BatchedPacket<IBlockUpdate> {

  constructor(p?: IBlockUpdateRequired & Partial<IBlockUpdateOptional>) {
    super(Packets.BLOCK_UPDATE, [
      { name: 'position', parser: DataType.BLOCK_POSITION },
      { name: 'blockRuntimeId', parser: DataType.U_VARINT },
      { name: 'flags', parser: DataType.U_VARINT, resolve: () => BlockUpdateFlags.NONE },
      { name: 'dataLayer', parser: DataType.U_VARINT, resolve: () => BlockUpdateDataLayer.NORMAL },
    ])

    if(p) this.props = p as IBlockUpdate
  }

}