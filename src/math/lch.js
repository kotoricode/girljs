// https://www.w3.org/TR/css-color-4/#color-conversion-code
// http://www.brucelindbloom.com/index.html?Math.html
import { SettableArray } from "../settable-array";
import { clamp, DEG_TO_RAD } from "../util";

const cbEpsilon = 6 / 29;
const iKappa = (cbEpsilon * 0.5) ** 3;
const gammaExp = 1 / 2.4;

const lin2rgb = (value) =>
{
    const clamped = clamp(value);

    return clamped > 0.00313066844250063 ?
           1.055 * clamped**gammaExp - 0.055 :
           12.92 * clamped;
};

const invFunc = (value) =>
{
    return (value > cbEpsilon) ? value**3 : iKappa*(116*value - 16);
};

export class Lch extends SettableArray
{
    constructor(l=0, c=0, h=0)
    {
        super();
        this.l = l;
        this.c = c;
        this.h = h;
    }

    toRgb()
    {
        const fy = (this.l + 16) / 116,
              hRad = this.h * DEG_TO_RAD;

        const x = invFunc(fy + Math.cos(hRad) * this.c / 500) * 0.950489,
              y = (this.l > 8) ? fy**3 : iKappa*this.l,
              z = invFunc(fy - Math.sin(hRad) * this.c / 200) * 1.08884;

        this.set(
            lin2rgb(3.2406255*x - 1.537208*y - 0.4986286*z),
            lin2rgb(-0.9689307*x + 1.8757561*y + 0.0415175*z),
            lin2rgb(0.0557101*x - 0.2040211*y + 1.0569959*z)
        );
    }
}
