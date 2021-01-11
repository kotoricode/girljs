import * as $ from "../const";
import { gl } from "../dom";

export const Texture = {
    bind(texture)
    {
        if (texture !== oldTexture)
        {
            gl.bindTexture($.TEXTURE_2D, texture);
            oldTexture = texture;
        }
    },
    create()
    {
        return gl.createTexture();
    },
    getSubTextureData(subTextureId)
    {
        if (subTextureData.has(subTextureId))
        {
            return subTextureData.get(subTextureId);
        }

        throw Error;
    },
    setParami(key, value)
    {
        gl.texParameteri($.TEXTURE_2D, key, value);
    },
    unbind()
    {
        Texture.bind(null);
    }
};

const createImageTexture = (src, parami) =>
{
    const texture = Texture.create();
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

/*------------------------------------------------------------------------------
    Image
------------------------------------------------------------------------------*/
const image = new Image();
const toFetch = [];

image.onload = () =>
{
    const { texture, parami } = toFetch.shift();

    Texture.bind(texture);
    gl.texImage2D($.TEXTURE_2D, 0, $.RGBA, $.RGBA, $.UNSIGNED_BYTE, image);

    for (let i = 0; i < parami.length;)
    {
        Texture.setParami(parami[i++], parami[i++]);
    }

    const minFilter = gl.getTexParameter($.TEXTURE_2D, $.TEXTURE_MIN_FILTER);

    // TODO: do we ever even use mipmaps?
    if (minFilter >= $.NEAREST_MIPMAP_NEAREST)
    {
        gl.generateMipmap($.TEXTURE_2D);
    }

    Texture.unbind();

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
let oldTexture;

const paramiMinLinMaxLin = [
    $.TEXTURE_MIN_FILTER, $.LINEAR,
    $.TEXTURE_MAG_FILTER, $.LINEAR
];

// name/url, width, height, parami[]
const textureDef = [
    $.TEX_BRAID, 1024, 1024, paramiMinLinMaxLin,
    $.TEX_POLY,   512,  512, paramiMinLinMaxLin,
    $.TEX_SPRITE, 256,  256, paramiMinLinMaxLin
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
    $.SUBTEX_BRAID, 8, 10, 119, 129, $.TEX_BRAID,
    $.SUBTEX_BG,   94, 97, 256, 256, $.TEX_POLY,
    $.SUBTEX_UKKO,  0,  0, 256, 256, $.TEX_SPRITE
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
