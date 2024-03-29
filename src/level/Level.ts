export type ChunkDelta = Map<string, Block> // Map<`x:y:z`, Block>
type ChunkDeltaList = Map<string, ChunkDelta>

export class Level {

  private static LAST_ID = 0

  private static Y_MASK = 0xFF
  private static MAX_HEIGHT = 256

  public id = ++Level.LAST_ID

  private chunkCache: Map<string, Chunk> = new Map()

  private chunkDelta: ChunkDeltaList = new Map() // Map<ChunkIndex, Map<BlockIndex, Block>>
  private dirtyBlocks: Set<[Vector3, Block]> = new Set()

  private blocks: Uint8Array = new Uint8Array()

  private entities: Map<bigint, Entity<any>> = new Map()

  constructor(public name: string, public spawn: Vector3, public generator: Generator) {}

  public async init(): Promise<this> {
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

    return this
  }

  public onTick(): void {
    for(const [pos, block] of this.dirtyBlocks) {
      Server.i.updateBlock(pos, block)
    }

    this.dirtyBlocks.clear()
  }

  public static getChunkId(x: number, z: number): string {
    return `chunk:${x}:${z}`
  }

  public static async TestWorld(): Promise<Level> {
    return new Level('TestLevel', new Vector3(0, 70, 0), await Anvil.init('hsn'))
  }

  public static async BedWars(): Promise<Level> {
    return new Level('BedWars', new Vector3(0, 5, 0), await Anvil.init('BedWars'))
  }

  public static async load(dir: string, spawn = new Vector3(0, 70, 0)): Promise<Level> {
    return new Level(dir, spawn, await Anvil.init(dir)).init()
  }

  public static Flat(): Level {
    return new Level('Flat', new Vector3(0, 5, 0), new Flat())
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
    const block = delta ? delta.get(`${x & 0x0f}:${y}:${z & 0x0f}`) : null

    return block || null
  }

  public async getBlockInfoAt(x: number, y: number, z: number): Promise<[number, number]> {
    const fromDelta = this.getBlockFromDelta(x, y, z)
    if(fromDelta) return [fromDelta.rid, fromDelta.meta]

    const chunkX = x >> 4
    const chunkZ = z >> 4
    const chunkIndex = Level.getChunkId(chunkX, chunkZ)
    const chunk = this.chunkCache.get(chunkIndex)
      || await this.getChunkAt(chunkX, chunkZ)

    // if(!chunk) throw new Error('Tried getting block in uncached chunk')

    return chunk.getBlockInfoAt(x & 0x0f, y, z & 0x0f)
  }

  public async getBlockAt(x: number, y: number, z: number): Promise<Block> {
    const fromDelta = this.getBlockFromDelta(x, y, z)
    if(fromDelta) return fromDelta

    const chunkX = x >> 4
    const chunkZ = z >> 4
    const chunkIndex = Level.getChunkId(chunkX, chunkZ)
    const chunk = this.chunkCache.get(chunkIndex)
      || await this.getChunkAt(chunkX, chunkZ)

    // if(!chunk) throw new Error('Tried getting block in uncached chunk')

    return chunk.getBlockAt(x & 0x0f, y, z & 0x0f)
  }

  /**
   * @param filter A function to filter the results by
   */
  public async getBlocksInBB(box: BoundingBox, filterFn?: (block: Block) => boolean): Promise<Array<[Block, Vector3]>> {
    const blocks: Array<[Block, Vector3]> = []

    const cursor = new Vector3(0, 0, 0)
    for (cursor.y = Math.floor(box.minY); cursor.y <= Math.floor(box.maxY); cursor.y++) {
      for (cursor.z = Math.floor(box.minZ); cursor.z <= Math.floor(box.maxZ); cursor.z++) {
        for (cursor.x = Math.floor(box.minX); cursor.x <= Math.floor(box.maxX); cursor.x++) {
          const block = await this.getBlockAt(cursor.x, cursor.y, cursor.z)

          if(!filterFn || filterFn(block)) blocks.push([block, new Vector3(cursor.x, cursor.y, cursor.z)])
        }
      }
    }

    return blocks
  }

  public async isSolid(x: number, y: number, z: number): Promise<boolean> {
    if(y < 0) return false

    const [ id ] = await this.getBlockInfoAt(Math.floor(x), Math.floor(y), Math.floor(z))

    const rid = BlockMap.legacyToRuntime.get(id)

    if(typeof rid === 'undefined') return false

    return rid !== BlockMap.AIR.rid
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

  public async dropItem(location: Vector3, iItem: IItem, motion?: Vector3, delay = 10): Promise<void> {
    const item = ItemMap.from(iItem)
    if(!item) return

    const droppedItem = new DroppedItem(item, delay)

    droppedItem.position.motion = motion || new Vector3(Math.random() * 0.2 - 0.1, /*0.2*/0, Math.random() * 0.2 - 0.1)
    droppedItem.position.update(location.x, location.y, location.z)

    this.entities.set(droppedItem.id, droppedItem)

    Server.i.spawnToAll(droppedItem)

    // const items = this.getEntitiesNear(droppedItem, 1)

    // for (const item of await items) {
    //   if (item instanceof DroppedItem) {
    //     droppedItem.position.update(item.position)
    //   }
    // }
  }

  public addEntity(entity: Entity<any>): void {
    this.entities.set(entity.id, entity)
  }

  public getEntity(entityId: bigint): Entity<any> | null {
    return this.entities.get(entityId) || null
  }

  public removeEntity(entityId: bigint): void {
    this.entities.delete(entityId)
  }

  public async getEntitiesAt(location: Vector3): Promise<Entity[]> {
    const box = new BoundingBox(
      location.x,
      location.y,
      location.z,
    )

    const entities = []

    for await(const [, entity] of this.entities) {
      if(entity.boundingBox.intersectsWith(box)) {
        entities.push(entity)
      }
    }
    return entities
  }

  public isInRadius(pos: Vector3, center: Vector3, radius: number): boolean {
    const xD = Math.abs(pos.x - center.x)
    const yD = Math.abs(pos.y - center.y)

    if(xD + yD <= radius) return true
    if(xD > radius) return false
    if(yD > radius) return false
    if((xD * xD) + (yD * yD) <= (radius * radius)) return true

    return false
  }

  // TODO: Convert {center} and return to Vector2
  public getPointsAround2d(center: Vector3, radius: number): Array<[number, number]> {
    const points: Array<[number, number]> = []

    const maxY = center.y + radius
    const minY = center.y - radius
    const maxX = center.x + radius
    const minX = center.x - radius

    for(let y = minY; y <= maxY; y++) {
      for(let x = minX; x <= maxX; x++) {
        if(!(x === center.x && y === center.y)) points.push([x, y])
      }
    }

    return points
  }

  public getPointsAround3d(center: Vector3, radius: number): Array<Vector3> {
    const maxY = center.y + radius
    const minY = center.y - radius

    const points = []
    for(let y = minY; y <= maxY; y++) {
      const yPoints = this.getPointsAround2d(new Vector3(center.x, center.z, 0), radius)

      points.push(...yPoints.map(([x, z]) => new Vector3(x, y, z)))
    }

    return points
  }

  public async getEntitiesNear(nearEntity: Entity, radius: number): Promise<Entity[]> {
    const points = this.getPointsAround3d(nearEntity.basePosition.coords, radius)

    const entities = []
    for(const point of points) {
      for await(const [, entity] of this.entities) {
        if(entity.id === nearEntity.id) continue
        if(entity.boundingBox.intersectsWith(BoundingBox.from(point, 1))) entities.push(entity)
      }
    }

    return entities
  }

}

import { Chunk } from './Chunk'
import { Generator } from './generator/Generator'
import { Anvil } from './generator/Anvil'
import { Flat } from './generator/Flat'
import { Block, BlockFace } from '../block/Block'
import { BlockMap } from '../block/BlockMap'
import { IItem, Vector3 } from '@strdstnet/utils.binary'
import { GlobalTick } from '../tick/GlobalTick'
import { Server } from '../Server'
import { Entity } from '../entity/Entity'
import { BoundingBox } from '../utils/BoundingBox'
import { DroppedItem } from '../entity/DroppedItem'
import { ItemMap } from '../item/ItemMap'

