import { SettableArray } from "./settable-array";
import { clamp, DEG_TO_RAD } from "./math-helper";

export class Lch
{
    constructor(l=0, c=0, h=0)
    {
        this.lch = [l, c, h];
        this.rgb = new SettableArray(3);

        this.generateRgb();
    }

    // http://www.brucelindbloom.com/index.html?Math.html
    // https://en.wikipedia.org/wiki/CIELAB_color_space#From_CIELAB_to_CIEXYZ
    // http://www.color.org/srgb.pdf
    // LCH -> Lab -> XYZ -> Linear RGB -> sRGB
    generateRgb()
    {
        const fy = (this.lch[0] + 16) / 116,
              c = this.lch[1],
              hRad = this.lch[2] * DEG_TO_RAD;

        const x = invFunc(fy + Math.cos(hRad) * c / 500) * d65xNorm,
              y = (this.l > 8) ? fy**3 : invKappa*this.l,
              z = invFunc(fy - Math.sin(hRad) * c / 200) * d65zNorm;

        this.rgb.setValues(
            lin2rgb(3.2406255*x - 1.537208*y - 0.4986286*z),
            lin2rgb(-0.9689307*x + 1.8757561*y + 0.0415175*z),
            lin2rgb(0.0557101*x - 0.2040211*y + 1.0569959*z)
        );
    }
}

// https://entropymine.com/imageworsener/srgbformula/
const lin2rgb = (value) =>
{
    const clamped = clamp(value);

    return clamped > 0.0031308
           ? 1.055 * clamped**gammaExp - 0.055
           : 12.92 * clamped;
};

const invFunc = (value) =>
{
    return (value > cbEpsilon) ? value**3 : invKappa*(116*value - 16);
};

const cbEpsilon = 6 / 29;
const invKappa = (cbEpsilon * 0.5) ** 3;
const gammaExp = 1 / 2.4;

const d65y = 0.329;
const d65xNorm = 0.3127 / d65y;
const d65zNorm = 0.3583 / d65y;
