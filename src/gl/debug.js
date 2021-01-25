import * as $ from "../const";
import { ProgramData } from "./program-data";

export const Debug = {
    getProgramData()
    {
        return program;
    }
};

const program = new ProgramData($.PROG_COLOR);
program.setModel($.MODEL_DEBUG);
