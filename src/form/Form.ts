// this.sendBatched(new FormRequest({
//   formId: 1,
//   formData: '{"type": "form","title": "§l§4Teleporter","buttons": [{"text": "§l§eMurder Mystery","image": {"type": "url","data": "https://64.media.tumblr.com/dcb08efc82f1fdde9bf1a7e744847888/tumblr_p3neymZXlx1qk55bko8_250.jpg"}},{"text": "§l§bHide n Seek", "image": {"type": "url", "data": "https://cdn.discordapp.com/attachments/690813365978791976/760203902439653386/tumblr_p7b48tPzXj1whvc9so9_1280.png"}}],"content": "§7Where do you want to go?"}',
// }))

export interface IFormImage {
  type: 'url',
  data: string,
}

export interface IFormButton {
  text: string,
  image?: IFormImage,
}

export interface IForm {
  title: string,
  content: string,
  buttons: IFormButton[],
}

interface IFormRequest {
  formId: number,
  formData: string,
}

export class Form implements IForm {

  public static count = 0

  public id = ++Form.count

  constructor(
    public title: string = '',
    public content: string = '',
    public buttons: IFormButton[] = [],
  ) {}

  public setTitle(title: string): this {
    this.title = title

    return this
  }

  public setContent(content: string): this {
    this.content = content

    return this
  }

  public addButton(button: IFormButton): this {
    this.buttons.push(button)

    return this
  }

  public encode(): IFormRequest {
    return {
      formId: this.id,
      formData: JSON.stringify({
        type: 'form',
        title: this.title,
        content: this.content,
        buttons: this.buttons,
      }),
    }
  }

}
