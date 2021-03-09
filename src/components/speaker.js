import { Vector } from "../math/vector";
import { Component } from "./component";

export class Speaker extends Component
{
    constructor(title, font, fontSize, fontColor)
    {
        super();
        this.title = title;
        this.font = font;
        this.fontSize = fontSize;
        this.fontColor = fontColor;
        this.position = new Vector();
    }
}
