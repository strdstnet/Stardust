export type ChunkDelta = Map<string, Block> // Map<`x:y:z`, Block>
export type ChunkDeltaList = Map<string, ChunkDelta>

export class Level {

  private static LAST_ID = 0

  private static Y_MASK = 0xFF
  private static MAX_HEIGHT = 256

  public id = ++Level.LAST_ID

  private chunkCache: Map<string, Chunk> = new Map()

  private chunkDelta: ChunkDeltaList = new Map() // Map<ChunkIndex, Map<BlockIndex, Block>>
  private dirtyBlocks: Set<[Vector3, Block]> = new Set()

  private entities: Map<bigint, Entity> = new Map()

  constructor(public name: string, public generator: Generator) {}

  public async init(): Promise<void> {
    await this.loadChunk(0, 0)
    await this.loadChunk(0, -1)
    await this.loadChunk(0, 1)
    await this.loadChunk(1, 0)
    await this.loadChunk(1, 1)
    await this.loadChunk(1, -1)
    await this.loadChunk(-1, 0)
    await this.loadChunk(-1, 1)
    await this.loadChunk(-1, -1)

    GlobalTick.attach(this)
  }

  public onTick(): void {
    this.dirtyBlocks.forEach(dirty => {
      this.dirtyBlocks.delete(dirty)

      const [pos, block] = dirty
      Server.i.updateBlock(pos, block)
    })
  }

  public static getChunkId(x: number, z: number): string {
    return `chunk:${x}:${z}`
  }

  public static TestWorld(): Level {
    return new Level('TestLevel', new Anvil('hsn'))
  }

  public static Flat(): Level {
    return new Level('Flat', new Flat())
  }

  public async loadChunk(x: number, z: number): Promise<Chunk> {
    const chunk = await this.generator.chunk(x, z)
    this.chunkCache.set(Level.getChunkId(x, z), chunk)

    return chunk
  }

  public async getChunkAt(x: number, z: number): Promise<Chunk> {
    const inCache = this.chunkCache.get(Level.getChunkId(x, z))

    const chunk = inCache || await this.loadChunk(x, z)
    const delta = this.getChunkDelta(x, z)

    return chunk.applyDelta(delta)
  }

  private getChunkDelta(x: number, z: number): ChunkDelta | null {
    return this.chunkDelta.get(Level.getChunkId(x, z)) || null
  }

  private setChunkDelta(x: number, z: number, delta: ChunkDelta): void {
    this.chunkDelta.set(Level.getChunkId(x, z), delta)
  }

  private getBlockFromDelta(x: number, y: number, z: number): Block | null {
    const delta = this.getChunkDelta(x >> 4, z >> 4)
    const block = delta ? delta.get(`${x}:${y}:${z}`) : null

    return block || null
  }

  public getBlockAt(x: number, y: number, z: number): Block {
    const fromDelta = this.getBlockFromDelta(x, y, z)
    if(fromDelta) return fromDelta

    const chunkIndex = Level.getChunkId(x >> 4, z >> 4)
    const chunk = this.chunkCache.get(chunkIndex)

    if(!chunk) throw new Error('Tried getting block in uncached chunk')

    return chunk.getBlockAt(x & 0x0f, y, z & 0x0f)
  }

  public setBlock(x: number, y: number, z: number, block: Block | string): void {
    if(typeof block === 'string') block = BlockMap.get(block)

    const blockIndex = `${x & 0x0f}:${y}:${z & 0x0f}`
    const chunkX = x >> 4
    const chunkZ = z >> 4
    const deltaChunk = this.getChunkDelta(chunkX, chunkZ)
    this.setChunkDelta(chunkX, chunkZ, deltaChunk ? deltaChunk.set(blockIndex, block) : new Map([[blockIndex, block]]))

    this.dirtyBlocks.add([new Vector3(x, y, z), block])
  }

  public getRelativeBlockPosition(x: number, y: number, z: number, face: BlockFace): Vector3 {
    const v = { x, y, z }

    switch(face) {
      case BlockFace.BOTTOM:
        v.y--
        break
      case BlockFace.EAST:
        v.x--
        break
      case BlockFace.NORTH:
        v.z++
        break
      case BlockFace.SOUTH:
        v.z--
        break
      case BlockFace.UP:
        v.y++
        break
      case BlockFace.WEST:
        v.x++
        break
    }

    return new Vector3(v.x, v.y, v.z)
  }

  private getDiff(a: number, b: number): number {
    if (a > b) return a - b

    return b - a
  }

  public async canPlace(block: Block, pos: Vector3): Promise<boolean> {
    const box = new BoundingBox(
      pos.x,
      pos.y,
      pos.z,
    )
    const canPlace = true

    for await(const [, entity] of this.entities) {
      if(entity.boundingBox.intersectsWith(box)) return false
    }

    return canPlace
  }

  public addEntity(entity: Entity): void {
    this.entities.set(entity.id, entity)
  }

  public getEntity(entityId: bigint): Entity | null {
    return this.entities.get(entityId) || null
  }

}

import { Chunk } from './Chunk'
import { Generator } from './generator/Generator'
import { Anvil } from './generator/Anvil'
import { Flat } from './generator/Flat'
import { Block, BlockFace } from '../block/Block'
import { BlockMap } from '../block/BlockMap'
import { Vector3 } from 'math3d'
import { GlobalTick } from '../tick/GlobalTick'
import { Server } from '../Server'
import { Entity } from '../entity/Entity'
import { BoundingBox } from '../utils/BoundingBox'
