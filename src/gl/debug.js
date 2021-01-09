import * as $ from "../const";
import { setBufferData } from "./buffer";
import { createProgramData } from "./program";

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

setBufferData($.BUFFER_DEBUG, bufferData, $.DYNAMIC_DRAW);

const debugProgram = createProgramData(
    $.PROGRAM_DEBUG,
    { [$.A_POSITION]: 0 },
    $.BUFFER_DEBUG
);
