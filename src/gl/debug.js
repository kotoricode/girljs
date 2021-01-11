import * as $ from "../const";
import { setArrayBuffer } from "./gl-helper";
import { ProgramData } from "./program-data";

export const getDebugProgram = () =>
{
    return debugProgram;
};

const bufferData = [
    0, 0, 0,
    2, 2, 2,
    0, 0, 0,
    -2, 2, 2,
    0, 0, 0,
    2, -2, 2,
    0, 0, 0,
    -2, 2, -2
];

setArrayBuffer(
    $.BUF_ARR_DEBUG,
    new Float32Array(bufferData),
    $.DYNAMIC_DRAW
);

const debugProgram = new ProgramData($.PROG_DEBUG);
debugProgram.setAttributes($.BUF_ARR_DEBUG, { [$.A_POSITION]: 0 });
