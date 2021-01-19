import * as $ from "../const";
import { gl } from "../dom";

export const Renderbuffer = {
    bindDepth()
    {
        if (isBound) throw Error;

        gl.bindRenderbuffer($.RENDERBUFFER, rboDepth);
        isBound = true;
    },
    createDepth()
    {
        assertIsBound();

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
        assertIsBound();

        gl.bindRenderbuffer($.RENDERBUFFER, null);
        isBound = false;
    }
};

const assertIsBound = () =>
{
    if (!isBound) throw Error;
};

const rboDepth = gl.createRenderbuffer();
let isBound = false;
