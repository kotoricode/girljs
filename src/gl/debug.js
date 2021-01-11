import * as $ from "../const";
import { setArrayBufferData } from "./gl-helper";
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

setArrayBufferData($.BUFFER_ARRAY_DEBUG, bufferData);

const debugProgram = new ProgramData($.PROGRAM_DEBUG);
debugProgram.setAttributes($.BUFFER_ARRAY_DEBUG, { [$.A_POSITION]: 0 });
