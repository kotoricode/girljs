import { gl } from "./dom";

import * as ENUM_GL from "./enum-gl";
import * as CONST from "./const";

const image = new Image();
const toFetch = [];

const fetchNextImage = () =>
{
    const src = toFetch[0].src;
    image.src = `${CONST.PATH_IMG}${src}`;
};

image.onload = () =>
{
    const { texture, parami } = toFetch[0];

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

    toFetch.shift();

    if (toFetch.length)
    {
        fetchNextImage();
    }
};

image.onerror = () =>
{
    throw Error;
};

const createImageTexture = (src, parami) =>
{
    const texture = gl.createTexture();

    toFetch.push({ texture, parami, src });

    if (toFetch.length === 1)
    {
        fetchNextImage();
    }

    return texture;
};

const filterLinearLinear = [
    [ENUM_GL.TEXTURE_MAG_FILTER, ENUM_GL.LINEAR],
    [ENUM_GL.TEXTURE_MIN_FILTER, ENUM_GL.LINEAR]
];

const textures = new Map([
    [CONST.TEXTURE_POLY, createImageTexture(
        CONST.TEXTURE_POLY, filterLinearLinear
    )],
    [CONST.TEXTURE_SPRITE, createImageTexture(
        CONST.TEXTURE_SPRITE, filterLinearLinear
    )]
]);

export const getTexture = (textureId) =>
{
    if (!textures.has(textureId))
    {
        throw Error;
    }

    return textures.get(textureId);
};
