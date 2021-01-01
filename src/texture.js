import { gl } from "./dom";

import * as ENUM_GL from "./enum-gl";
import * as CONST from "./const";

const createImageTexture = (src, parami) =>
{
    const texture = gl.createTexture();
    const image = new Image();

    image.onload = () =>
    {
        gl.bindTexture(ENUM_GL.TEXTURE_2D, texture);

        gl.texImage2D(
            ENUM_GL.TEXTURE_2D,
            0,
            ENUM_GL.RGBA,
            ENUM_GL.RGBA,
            ENUM_GL.UNSIGNED_BYTE,
            image
        );

        for (const [key, value] of parami)
        {
            gl.texParameteri(ENUM_GL.TEXTURE_2D, key, value);
        }

        const minFilter = gl.getTexParameter(
            ENUM_GL.TEXTURE_2D,
            ENUM_GL.TEXTURE_MIN_FILTER
        );

        if (minFilter > ENUM_GL.LINEAR)
        {
            gl.generateMipmap(ENUM_GL.TEXTURE_2D);
        }

        gl.bindTexture(ENUM_GL.TEXTURE_2D, null);
    };

    image.onerror = () =>
    {
        throw Error;
    };

    image.src = `${CONST.PATH_IMG}${src}`;

    return texture;
};

const textures = new Map([
    [CONST.TEXTURE_POLY, createImageTexture(
        CONST.TEXTURE_POLY, [
            [ENUM_GL.TEXTURE_MAG_FILTER, ENUM_GL.LINEAR],
            [ENUM_GL.TEXTURE_MIN_FILTER, ENUM_GL.LINEAR]
        ]
    )],
    [CONST.TEXTURE_SPRITE, createImageTexture(
        CONST.TEXTURE_SPRITE, [
            [ENUM_GL.TEXTURE_MAG_FILTER, ENUM_GL.LINEAR],
            [ENUM_GL.TEXTURE_MIN_FILTER, ENUM_GL.LINEAR]
        ]
    )]
]);

export const getTexture = (textureId) =>
{
    const data = textures.get(textureId);

    if (!data)
    {
        throw Error;
    }

    return data;
};
