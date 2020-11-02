import { EventDict } from '@hyperstonenet/utils.events'
import { Container } from '../containers/Container'
import { Living } from './Living'

interface ICreatureEvents {
  _: () => void,
}

export abstract class Creature<Events extends EventDict = EventDict, Containers extends Container[] = []> extends Living<Events & ICreatureEvents, Containers> {

}