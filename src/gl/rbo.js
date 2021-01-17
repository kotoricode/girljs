import * as $ from "../const";
import { gl } from "../dom";

export const Rbo = {
    bind(rbo)
    {
        gl.bindRenderbuffer($.RENDERBUFFER, rbo);
    },
    initDepth(width, height)
    {
        gl.renderbufferStorage(
            $.RENDERBUFFER,
            $.DEPTH_COMPONENT16,
            width,
            height
        );
    },
    unbind()
    {
        Rbo.bind(null);
    }
};
