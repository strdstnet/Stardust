import { Vector3 } from '@strdstnet/utils.binary'

export class PhysicsVector3 extends Vector3 {

  public clone(): PhysicsVector3 {
    return new PhysicsVector3(this.x, this.y, this.z)
  }

  public static from(v3: Vector3): PhysicsVector3 {
    return new PhysicsVector3(v3.x, v3.y, v3.z)
  }

  public offset(dx: number, dy: number, dz: number): PhysicsVector3 {
    return new PhysicsVector3(this.x + dx, this.y + dy, this.z + dz)
  }

  public apply(v3: Vector3): PhysicsVector3 {
    this.x += v3.x
    this.y += v3.y
    this.z += v3.z
    return this
  }

}