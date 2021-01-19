import * as $ from "../const";
import { ProgramData } from "./program-data";

export const getDebugProgramData = () =>
{
    return program;
};

const program = new ProgramData($.PROG_DEBUG);
program.setAttributes($.MODEL_DEBUG);
