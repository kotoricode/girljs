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

const textures = new Map([
    [
        $.TEXTURE_POLY,
        createImageTexture($.TEXTURE_POLY, filterLinearLinear)
    ],
    [
        $.TEXTURE_SPRITE,
        createImageTexture($.TEXTURE_SPRITE, filterLinearLinear)
    ]
]);

export const getTexture = (textureId) =>
{
    if (!textures.has(textureId))
    {
        throw Error;
    }

    return textures.get(textureId);
};
