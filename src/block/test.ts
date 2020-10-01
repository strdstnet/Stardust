import fs from 'fs'
import path from 'path'
import { NBTFile, NBTFileId } from '../data/NBTFile'
import { ListTag } from '../nbt/ListTag'
import { BinaryData } from '../utils/BinaryData'

// const legacyStates: any[] = []
// const data = fs.readFileSync(path.join(__dirname, '..', 'data', 'bedrock', 'r12_to_current_block_map.bin'))
// const legacyStateData = new BinaryData(data)

// while(!legacyStateData.feof) {
//   const name = legacyStateData.readString()
//   const meta = legacyStateData.readLShort()
//   const state = legacyStateData.readTag()

//   legacyStates.push({
//     name,
//     meta,
//     state,
//   })
// }

// console.log(legacyStates)
// fs.writeFileSync(path.join(__dirname, '..', 'data', 'block_states.json'), JSON.stringify(legacyStates, null, 2))


function equals(a: any, b: any): boolean {
  const selfProps = Object.getOwnPropertyNames(a)
  const tagProps = Object.getOwnPropertyNames(b)

  if(selfProps.length != tagProps.length) return false

  for(let i = 0; i < selfProps.length; i++) {
    const propName = selfProps[i]

    if(a[propName] !== b[propName]) return false
  }

  return true
}


import R12ToCurrent from './r12_to_current_block_map.json'

const parser = new NBTFile(NBTFileId.BLOCK_STATES)
const raw = parser.readTag<ListTag>()
const blockStates = JSON.parse(JSON.stringify(raw))

const newStates = []

;(async() => {
  for(let i = 0; i < blockStates.length; i++) {
    const { id, block: { name, states } } = blockStates[i]
    const current = R12ToCurrent.find(b => b.name === name && equals(b.state.states, states))

    if(current) {
      newStates.push({
        name,
        id,
        meta: current.meta,
        runtimeId: i,
        states,
      })
    }

  }

  fs.writeFileSync(path.join(__dirname, 'block_states3.json'), JSON.stringify(newStates, null, 2))
})()

// console.log(states)
// console.log(JSON.stringify(states, null, 2))
// fs.writeFileSync(path.join(__dirname, '..', 'data', 'block_states.json'), JSON.stringify(states, null, 2))


// import BlockStates from '../data/block_states.json'

// ;(async() => {
//   const states = []

//   for await(const rashawn of BlockStates) {
//     states.push({
//       name: rashawn.block.name,
//       id: rashawn.id,
//       states: rashawn.block.states,
//     })
//   }

//   console.log(states)

//   fs.writeFileSync(path.join(__dirname, 'block_states2.json'), JSON.stringify(states, null, 2))
// })()


// const file = fs.readFileSync(path.join(__dirname, 'gamepedia.txt'))
// const str = file.toString()
// const rows = str
//   .replace(/({{|}})/g, '')
//   .replace(/(Data table\|)/g, '')
//   .split(/\r?\n/g)

// interface IBlock {
//   id: number,
//   name: string,
// }

// console.log(rows)

// const blocks: IBlock[] = []

// let currentId = 0
// for(const row of rows) {
//   const parts = row.split(/\|/)

//   const id = currentId++
//   const defaultName = parts[0].toLowerCase().replace(/ /g, '_')
//   const nameId = /nameid=(?<name>[^\||}}]+)/g.exec(row)
//   const name = nameId && nameId.groups ? (nameId.groups.name || defaultName) : defaultName

//   blocks.push({
//     id,
//     name: `minecraft:${name}`,
//   })
// }

// fs.writeFileSync(path.join(__dirname, 'blocks2.json'), JSON.stringify({
//   defaults: {
//     vars: 0,
//   },
//   blocks,
// }, null, 2))

// import blocks from './blocks3.json'
// import blockHardnesses from './block_hardnesses.json'

// const newBlocks = blocks

// for(const [name, hardness] of Object.entries(blockHardnesses)) {
//   const actualName = `minecraft:${name.toLowerCase().replace(/ /g, '_')}`

//   const index = newBlocks.blocks.findIndex(b => b.name === actualName)

//   if(index === -1) throw new Error(`Cannot find block for ${name} :: ${actualName}`)

//   ;(newBlocks.blocks[index] as any).hardness = hardness
// }

// newBlocks.blocks.forEach(block => {
//   if(block.id >= 413) block.id++
//   if(block.id >= 460) block.id++
// })

// console.log(newBlocks)
// console.log(newBlocks.blocks.filter((b: any) => {
//   return !b.name.includes(':element') && typeof b.hardness === 'undefined'
// }))

// fs.writeFileSync(path.join(__dirname, 'blocks5.json'), JSON.stringify(newBlocks, null, 2))
