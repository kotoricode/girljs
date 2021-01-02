// https://www.w3.org/TR/css-color-4/#color-conversion-code
// http://www.brucelindbloom.com/index.html?Math.html
import { SettableArray } from "../settable-array";
import { clamp, DEG_2_RAD } from "../util";

const cbEpsilon = 6 / 29;
const iKappa = (cbEpsilon * 0.5) ** 3;
const gammaExp = 5 / 12;

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

export class Color extends SettableArray
{
    constructor(l=0, c=0, h=0)
    {
        super(l, c, h);
    }

    toRgb(lch)
    {
        const l = lch[0],
              c500 = lch[1] * 2e-3;

        const fy = (l + 16) / 116,
              hr = lch[2] * DEG_2_RAD;

        const x = invFunc(fy + Math.cos(hr)*c500) * 0.950489,
              y = (l > 8) ? fy**3 : iKappa*l,
              z = invFunc(fy - Math.sin(hr)*c500*2.5) * 1.08884;

        this.set(
            lin2rgb(3.2406255*x - 1.537208*y - 0.4986286*z),
            lin2rgb(-0.9689307*x + 1.8757561*y + 0.0415175*z),
            lin2rgb(0.0557101*x - 0.2040211*y + 1.0569959*z)
        );
    }
}
