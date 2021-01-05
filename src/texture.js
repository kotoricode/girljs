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
    const { texture, parami } = toFetch.shift();

    gl.bindTexture($.TEXTURE_2D, texture);

    gl.texImage2D(
        $.TEXTURE_2D,
        0,
        $.RGBA,
        $.RGBA,
        $.UNSIGNED_BYTE,
        image
    );

    let i = 0;
    while (i < parami.length)
    {
        gl.texParameteri($.TEXTURE_2D, parami[i++], parami[i++]);
    }

    const minFilter = gl.getTexParameter($.TEXTURE_2D, $.TEXTURE_MIN_FILTER);

    if (minFilter >= $.NEAREST_MIPMAP_NEAREST)
    {
        gl.generateMipmap($.TEXTURE_2D);
    }

    gl.bindTexture($.TEXTURE_2D, null);

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

const paramiMinLinMaxLin = [
    $.TEXTURE_MIN_FILTER, $.LINEAR,
    $.TEXTURE_MAG_FILTER, $.LINEAR
];

// name, 1<<width, 1<<height, parami[]
const textureDef = [
    $.TEXTURE_BRAID,  10, 10, paramiMinLinMaxLin,
    $.TEXTURE_SPRITE,  8,  8, paramiMinLinMaxLin,
    $.TEXTURE_POLY,    9,  9, paramiMinLinMaxLin
];

const textureData = new Map();

let i = 0;
while (i < textureDef.length)
{
    const key = textureDef[i++];

    textureData.set(key, {
        width: 1 << textureDef[i++],
        height: 1 << textureDef[i++],
        texture: createImageTexture(key, textureDef[i++])
    });
}

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
            x: 94,
            y: 97,
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
    if (subTextureData.has(subTextureId))
    {
        return subTextureData.get(subTextureId);
    }

    throw Error;
};

export const getTextureData = (textureId) =>
{
    if (textureData.has(textureId))
    {
        return textureData.get(textureId);
    }

    throw Error;
};
