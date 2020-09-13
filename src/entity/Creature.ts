import { Container } from '../containers'
import { Living } from './Living'

export abstract class Creature<Events, Containers extends Container[] = []> extends Living<Events, Containers> {

}