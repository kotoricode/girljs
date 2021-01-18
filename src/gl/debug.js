import * as $ from "../const";
import { ProgramData } from "./program-data";

export const getDebugProgram = () =>
{
    return program;
};

const program = new ProgramData($.PROG_DEBUG);
program.setAttributes($.MODEL_DEBUG);
