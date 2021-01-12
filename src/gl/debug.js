import * as $ from "../const";
import { BufferData } from "../math/buffer-data";
import { BufferArray } from "./buffer";
import { ProgramData } from "./program-data";

export const getDebugProgram = () =>
{
    return debugProgram;
};

const bufferData = new BufferData([
    0, 0, 0,
    2, 2, 2,
    0, 0, 0,
    -2, 2, 2,
    0, 0, 0,
    2, -2, 2,
    0, 0, 0,
    -2, 2, -2
]);

BufferArray.set($.BUF_ARR_DEBUG, bufferData, $.DYNAMIC_DRAW);

const debugProgram = new ProgramData($.PROG_DEBUG);
debugProgram.setAttributes($.BUF_ARR_DEBUG, { [$.A_POSITION]: 0 });
