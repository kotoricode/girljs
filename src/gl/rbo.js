import * as $ from "../const";
import { gl } from "../dom";

export const Rbo = {
    bindDepth()
    {
        if (isBound) throw Error;

        gl.bindRenderbuffer($.RENDERBUFFER, rboDepth);
        isBound = true;
    },
    createDepth()
    {
        if (!isBound) throw Error;

        gl.renderbufferStorage(
            $.RENDERBUFFER,
            $.DEPTH_COMPONENT16,
            gl.canvas.width,
            gl.canvas.height
        );

        return rboDepth;
    },
    unbind()
    {
        if (!isBound) throw Error;

        gl.bindRenderbuffer($.RENDERBUFFER, null);
        isBound = false;
    }
};

const rboDepth = gl.createRenderbuffer();
let isBound = false;
