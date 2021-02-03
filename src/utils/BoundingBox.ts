import { Vector3 } from '@strdstnet/utils.binary'

export class BoundingBox {

  constructor(
    public minX: number,
    public minY: number,
    public minZ: number,
    public maxX: number = minX + 1,
    public maxY: number = minY + 1,
    public maxZ: number = minZ + 1,
  ) {}

  public intersectsWith(box: BoundingBox, tolerance = 0.00001): boolean {
    if(box.maxX - this.minX > tolerance && this.maxX - box.minX > tolerance) {
      if(box.maxY - this.minY > tolerance && this.maxY - box.minY > tolerance) {
        return box.maxZ - this.minZ > tolerance && this.maxZ - box.minZ > tolerance
      }
    }

    return false
  }

  public static from(v3: Vector3, maxD = 1): BoundingBox {
    return new BoundingBox(
      v3.x,
      v3.y,
      v3.z,
      v3.x + maxD,
      v3.y + maxD,
      v3.z + maxD,
    )
  }

  public clone(): BoundingBox {
    return new BoundingBox(this.minX, this.minY, this.minZ, this.maxX, this.maxY, this.maxZ)
  }

  public extend(dx: number, dy: number, dz: number): this {
    if (dx < 0) this.minX += dx
    else this.maxX += dx

    if (dy < 0) this.minY += dy
    else this.maxY += dy

    if (dz < 0) this.minZ += dz
    else this.maxZ += dz

    return this
  }

  public contract(x: number, y: number, z: number): this {
    this.minX += x
    this.minY += y
    this.minZ += z
    this.maxX -= x
    this.maxY -= y
    this.maxZ -= z
    return this
  }

  public expand(x: number, y: number, z: number): this {
    this.minX -= x
    this.minY -= y
    this.minZ -= z
    this.maxX += x
    this.maxY += y
    this.maxZ += z
    return this
  }

  public offset(x: number, y: number, z: number): this {
    this.minX += x
    this.minY += y
    this.minZ += z
    this.maxX += x
    this.maxY += y
    this.maxZ += z
    return this
  }

}