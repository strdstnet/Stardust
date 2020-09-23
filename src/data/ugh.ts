import fs from 'fs'
import path from 'path'
import { CompoundTag } from '../nbt/CompoundTag'
import { IntTag } from '../nbt/IntTag'
import { ListTag } from '../nbt/ListTag'
import { ShortTag } from '../nbt/ShortTag'
import { StringTag } from '../nbt/StringTag'
import { BinaryData } from '../utils/BinaryData'

const buf = fs.readFileSync(path.join(__dirname, 'entity_definitions.nbt'))
// const buf = fs.readFileSync(path.join(__dirname, 'block_states.nbt'))
const data = new BinaryData(buf)

type BlockStates = ListTag<CompoundTag<{
  id: ShortTag,
  block: CompoundTag<{
    name: StringTag,
    version: IntTag,
    states: CompoundTag,
  }>,
}>>

const tag = data.readTag() /*as BlockStates*/
// console.log(tag)

// console.log(tag.value.idlist)
// console.log(tag.value.idlist.value[0].value)
console.log(tag.value.idlist.value.map((v: any) => console.log(v.value)))

// console.log(tag.value[0].value)
// console.log(tag.value[0].value.block.value)
// console.log(tag.value[1].value.block.value)
// console.log(tag.value[2].value.block.value)

// for(const block of tag.value) {
//   const id = block.val('id')
//   const data = block.get('block')

//   console.log(`Got block #${id} (${data.val('name')}, ver: ${data.val('version')}) with states:`)
//   console.log(JSON.stringify(data.val('states')))
//   console.log('\n')
// }

