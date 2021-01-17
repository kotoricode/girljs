import * as $ from "../const";
import { gl } from "../dom";
import { Texture } from "./texture";

export const Fbo = {
    bind(fbo)
    {
        gl.bindFramebuffer($.FRAMEBUFFER, fbo);
    },
    createTexture()
    {
        if (texture)
        {
            gl.deleteTexture(texture);
        }

        const { width, height } = gl.canvas;

        texture = Texture.createFramebufferTexture(width, height);

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
        Fbo.bind(null);
    }
};

const createTexture = (width, height) =>
{

};

let texture;
