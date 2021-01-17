import * as $ from "../const";
import { gl } from "../dom";

export const Fbo = {
    bind(fbo)
    {
        gl.bindFramebuffer($.FRAMEBUFFER, fbo);
    },
    unbind()
    {
        Fbo.bind(null);
    }
};
