import * as $ from "../const";
import { Model } from "./model";
import { ProgramData } from "./program-data";

export const getDebugProgram = () =>
{
    return debugProgram;
};

const debugProgram = new ProgramData($.PROG_DEBUG);
const model = Model.get($.MODEL_DEBUG);
debugProgram.setAttributes($.BUF_ARR_DEBUG, model);
