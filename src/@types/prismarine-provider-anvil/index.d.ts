

declare module 'prismarine-provider-anvil' {
  export class AnvilClass {
    constructor(path: string)

    loadRaw(x: number, y: number): Promise<any>
  }
  export function Anvil(ver: string): typeof AnvilClass
  // const v: any
  // export default v
}