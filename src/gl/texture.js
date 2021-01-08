import * as $ from "../const";
import { gl } from "../dom";

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

const fetchNextImage = () =>
{
    const src = toFetch[0].src;
    image.src = `${$.PATH_IMG}${src}`;
};

export const getSubTextureData = (subTextureId) =>
{
    if (subTextureData.has(subTextureId))
    {
        return subTextureData.get(subTextureId);
    }

    throw Error;
};

/*------------------------------------------------------------------------------
    Image
------------------------------------------------------------------------------*/
const image = new Image();
const toFetch = [];

image.onload = () =>
{
    const { texture, parami } = toFetch.shift();

    gl.bindTexture($.TEXTURE_2D, texture);
    gl.texImage2D($.TEXTURE_2D, 0, $.RGBA, $.RGBA, $.UNSIGNED_BYTE, image);

    for (let i = 0; i < parami.length;)
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

/*------------------------------------------------------------------------------
    Textures
------------------------------------------------------------------------------*/
const paramiMinLinMaxLin = [
    $.TEXTURE_MIN_FILTER, $.LINEAR,
    $.TEXTURE_MAG_FILTER, $.LINEAR
];

// name/url, width, height, parami[]
const textureDef = [
    $.TEXTURE_BRAID, 1024, 1024, paramiMinLinMaxLin,
    $.TEXTURE_POLY,   512,  512, paramiMinLinMaxLin,
    $.TEXTURE_SPRITE, 256,  256, paramiMinLinMaxLin
];

const textureData = new Map();

for (let i = 0; i < textureDef.length;)
{
    const src = textureDef[i++];

    textureData.set(src, {
        width: textureDef[i++],
        height: textureDef[i++],
        texture: createImageTexture(src, textureDef[i++])
    });
}

/*------------------------------------------------------------------------------
    Subtextures
------------------------------------------------------------------------------*/
// name, x, y, width, height, textureData name/url
const subTextureDef = [
    $.SUBTEXTURE_BRAID, 8, 10, 119, 129, $.TEXTURE_BRAID,
    $.SUBTEXTURE_BG,   94, 97, 256, 256, $.TEXTURE_POLY,
    $.SUBTEXTURE_UKKO,  0,  0, 256, 256, $.TEXTURE_SPRITE
];

const subTextureData = new Map();

for (let i = 0; i < subTextureDef.length;)
{
    subTextureData.set(subTextureDef[i++], {
        x: subTextureDef[i++],
        y: subTextureDef[i++],
        width: subTextureDef[i++],
        height: subTextureDef[i++],
        baseData: textureData.get(subTextureDef[i++])
    });
}
