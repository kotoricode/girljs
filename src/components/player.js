import { Component } from "./component";

export class Player extends Component
{
    constructor()
    {
        super();
        this.money = 0;
        this.skin = [1, 0.871, 0.855, 1];
        this.alpha = null;
        this.beta = null;
    }
}
