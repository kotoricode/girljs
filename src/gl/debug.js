import * as $ from "../const";
import { ProgramData } from "./program-data";

export const Debug = {
    getProgramData()
    {
        return program;
    }
};

const program = new ProgramData($.PRO_COLOR, $.MOD_DEBUG);
