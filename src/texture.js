import { gl } from "./dom";

import * as $ from "./const";

const image = new Image();
const toFetch = [];

const fetchNextImage = () =>
{
    const src = toFetch[0].src;
    image.src = `${$.PATH_IMG}${src}`;
};

image.onload = () =>
{
    const { texture, parami } = toFetch[0];

    gl.bindTexture($.TEXTURE_2D, texture);

    gl.texImage2D(
        $.TEXTURE_2D,
        0,
        $.RGBA,
        $.RGBA,
        $.UNSIGNED_BYTE,
        image
    );

    for (const [key, value] of parami)
    {
        gl.texParameteri($.TEXTURE_2D, key, value);
    }

    const minFilter = gl.getTexParameter($.TEXTURE_2D, $.TEXTURE_MIN_FILTER);

    if (minFilter >= $.NEAREST_MIPMAP_NEAREST)
    {
        gl.generateMipmap($.TEXTURE_2D);
    }

    gl.bindTexture($.TEXTURE_2D, null);

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
    [$.TEXTURE_MAG_FILTER, $.LINEAR],
    [$.TEXTURE_MIN_FILTER, $.LINEAR]
];

const textureData = new Map([
    [
        $.TEXTURE_BRAID,
        {
            texture: createImageTexture($.TEXTURE_BRAID, filterLinearLinear),
            width: 1024,
            height: 1024
        }
    ],
    [
        $.TEXTURE_SPRITE,
        {
            texture: createImageTexture($.TEXTURE_SPRITE, filterLinearLinear),
            width: 256,
            height: 256
        }
    ],
    [
        $.TEXTURE_POLY,
        {
            texture: createImageTexture($.TEXTURE_POLY, filterLinearLinear),
            width: 256,
            height: 256
        }
    ]
]);

export const subTextureData = new Map([
    [
        $.SUBTEXTURE_BRAID,
        {
            baseTextureId: $.TEXTURE_BRAID,
            x: 8,
            y: 10,
            width: 119,
            height: 129
        }
    ],
    [
        $.SUBTEXTURE_BG,
        {
            baseTextureId: $.TEXTURE_POLY,
            x: 0,
            y: 0,
            width: 256,
            height: 256
        }
    ],
    [
        $.SUBTEXTURE_UKKO,
        {
            baseTextureId: $.TEXTURE_SPRITE,
            x: 0,
            y: 0,
            width: 256,
            height: 256
        }
    ]
]);

export const getSubTextureData = (subTextureId) =>
{
    if (!subTextureData.has(subTextureId))
    {
        throw Error;
    }

    return subTextureData.get(subTextureId);
};

export const getTextureData = (textureId) =>
{
    if (!textureData.has(textureId))
    {
        throw Error;
    }

    return textureData.get(textureId);
};
