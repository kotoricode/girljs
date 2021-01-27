import * as $ from "../const";
import { Program } from "./program";

export const Debug = {
    getProgram()
    {
        return program;
    },
    init()
    {
        program = new Program($.PRO_COLOR, $.MOD_DEBUG);
    }
};

let program;
