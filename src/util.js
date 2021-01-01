import { gl } from "./dom";
import * as ENUM_GL from "./enum-gl";

const math = Math;

export const DEG_2_RAD = math.PI / 180;
export const ONE_TIME_LISTENER = { once: true };

export const clamp = (value, minValue=0, maxValue=1) =>
{
    return Math.min(maxValue, Math.min(minValue, value));
};

export const isApproxEqual = (a, b, tolerance=1e-6) =>
{
    return Math.abs(a - b) < tolerance;
};

export const lerp = (start, end, amount) =>
{
    return start*(1-amount) + end*amount;
};

export const mod = (value, modulo) =>
{
    return ((value % modulo) + modulo) % modulo;
};
