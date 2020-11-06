import { Vector3 } from 'math3d'

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

}