import * as $ from "../const";
import { gl } from "../dom";
import { Texture } from "./texture";

export const Framebuffer = {
    bind()
    {
        gl.bindFramebuffer($.FRAMEBUFFER, fbo);
        gl.bindRenderbuffer($.RENDERBUFFER, rboDepth);
    },
    prepare()
    {
        Framebuffer.bind();
        texture = Texture.get($.TEX_FB);

        gl.framebufferTexture2D(
            $.FRAMEBUFFER,
            $.COLOR_ATTACHMENT0,
            $.TEXTURE_2D,
            texture,
            0
        );

        gl.renderbufferStorage(
            $.RENDERBUFFER,
            $.DEPTH_COMPONENT16,
            gl.canvas.width,
            gl.canvas.height
        );

        gl.framebufferRenderbuffer(
            $.FRAMEBUFFER,
            $.DEPTH_ATTACHMENT,
            $.RENDERBUFFER,
            rboDepth
        );

        Framebuffer.unbind();
    },
    unbind()
    {
        gl.bindRenderbuffer($.RENDERBUFFER, null);
        gl.bindFramebuffer($.FRAMEBUFFER, null);
    }
};

const fbo = gl.createFramebuffer();
const rboDepth = gl.createRenderbuffer();
let texture;
