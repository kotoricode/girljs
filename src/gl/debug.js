import * as $ from "../const";
import { setBufferData } from "./buffer";
import { createProgramData } from "./program";

export const getDebugProgram = () =>
{
    return debugProgram;
};

const bufferData = [
    0, 0, 0,
    300, 300, 50
];

setBufferData($.BUFFER_DEBUG, bufferData);

const debugProgram = createProgramData(
    $.PROGRAM_DEBUG,
    { [$.A_POSITION]: 0 },
    $.BUFFER_DEBUG
);
