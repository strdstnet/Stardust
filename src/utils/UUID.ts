export class UUID {

  public parts: number[]

  constructor(uuid: string) {
    this.parts = uuid.split('-').map(part => parseInt(part, 10))
  }

}
