import { TileIsSpawnable } from '@strdstnet/utils.binary'
import { Tile } from './Tile'

export class Spawnable extends Tile {

  public [TileIsSpawnable] = true

}