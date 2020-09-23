import { Air } from './block/Air'
import { ItemMap } from './item/ItemMap'

ItemMap.registerItems()

const air = new Air()

console.log(air)

console.log(air.clone())
