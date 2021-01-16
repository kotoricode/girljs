import * as $ from "../const";
import { ProgramData } from "./program-data";

export const getDebugProgram = () =>
{
    return debugProgram;
};

const debugProgram = new ProgramData($.PROG_DEBUG);
debugProgram.setAttributes($.MODEL_DEBUG);
