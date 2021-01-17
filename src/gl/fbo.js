import * as $ from "../const";
import { gl } from "../dom";
import { Texture } from "./texture";

export const Fbo = {
    attachDepth(rbo)
    {
        if (!isBound) throw Error;

        gl.framebufferRenderbuffer(
            $.FRAMEBUFFER,
            $.DEPTH_ATTACHMENT,
            $.RENDERBUFFER,
            rbo
        );
    },
    bind()
    {
        if (isBound) throw Error;

        gl.bindFramebuffer($.FRAMEBUFFER, fbo);
        isBound = true;
    },
    createTexture()
    {
        if (!isBound) throw Error;

        if (texture)
        {
            gl.deleteTexture(texture);
        }

        texture = Texture.createFramebufferTexture(
            gl.canvas.width,
            gl.canvas.height
        );

        gl.framebufferTexture2D(
            $.FRAMEBUFFER,
            $.COLOR_ATTACHMENT0,
            $.TEXTURE_2D,
            texture,
            0
        );

        return texture;
    },
    getTexture()
    {
        return texture;
    },
    unbind()
    {
        if (!isBound) throw Error;

        gl.bindFramebuffer($.FRAMEBUFFER, null);
        isBound = false;
    }
};

const fbo = gl.createFramebuffer();
let texture;
let isBound = false;
