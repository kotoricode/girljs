import * as $ from "../const";
import { Program } from "./program";

export const Debug = {
    getProgram()
    {
        return program;
    }
};

const program = new Program($.PRO_COLOR, $.MDL_DEBUG);
