import { IFormButton, IFormImage } from './Form'

export class FormButton implements IFormButton {

  constructor(
    public text: string = '',
    public image?: IFormImage,
  ) {}

  public setText(text: string): this {
    this.text = text

    return this
  }

  public setImage(image: IFormImage): this {
    this.image = image

    return this
  }

}
