import * as $ from "../const";
import { gl } from "../dom";
import { Texture } from "./texture";

export const Framebuffer = {
    attachDepth(rbo)
    {
        assertIsBound();

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
        assertIsBound();

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
        assertIsBound();

        gl.bindFramebuffer($.FRAMEBUFFER, null);
        isBound = false;
    }
};

const assertIsBound = () =>
{
    if (!isBound) throw Error;
};

const fbo = gl.createFramebuffer();
let texture;
let isBound = false;
