import { Container } from '../containers/Container'
import { Living } from './Living'

export abstract class Creature<Events, Containers extends Container[] = []> extends Living<Events, Containers> {

}