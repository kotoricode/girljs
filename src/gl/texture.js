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
    createFramebufferTexture()
    {
        const texture = Texture.create();
        Texture.bind(texture);

        gl.texImage2D(
            $.TEXTURE_2D,
            0,
            $.RGB,
            gl.canvas.width,
            gl.canvas.height,
            0,
            $.RGB,
            $.UNSIGNED_BYTE,
            null
        );

        Texture.setParami($.TEXTURE_MIN_FILTER, $.LINEAR);
        Texture.unbind();

        return texture;
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

/*------------------------------------------------------------------------------
    Image
------------------------------------------------------------------------------*/
const fetchNextImage = () => image.src = `${$.PATH_IMG}${toFetch[0]}`;

const image = new Image();

image.addEventListener("load", () =>
{
    const src = toFetch.shift();
    const texture = textures.get(src);
    const parami = textureParami.get(src);

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

    textures.delete(src);
    textureParami.delete(src);

    if (toFetch.length)
    {
        fetchNextImage();
    }
});

image.addEventListener("error", (e) =>
{
    throw Error(e);
});

/*------------------------------------------------------------------------------
    Textures
------------------------------------------------------------------------------*/
let oldTexture;

const paramiMinLinMaxLin = [
    $.TEXTURE_MIN_FILTER, $.LINEAR,
    $.TEXTURE_MAG_FILTER, $.LINEAR
];

// id/url, width, height, parami[], subtextures[ id, x, y, width, height ]
const textureDef = [
    $.TEX_BRAID, 1024, 1024, paramiMinLinMaxLin, [
        $.SUBTEX_BRAID_00, 0*128, 10,  136, 136,
        $.SUBTEX_BRAID_01, 1*128, 10,  136, 136,
        $.SUBTEX_BRAID_02, 2*128, 10,  136, 136,
        $.SUBTEX_BRAID_03, 3*128, 10,  136, 136,
        $.SUBTEX_BRAID_04, 4*128, 10,  136, 136,
        $.SUBTEX_BRAID_05, 5*128, 10,  136, 136,
        $.SUBTEX_BRAID_06, 6*128, 10,  136, 136,
        $.SUBTEX_BRAID_07, 0*128, 158, 136, 136,
        $.SUBTEX_BRAID_08, 1*128, 158, 136, 136,
        $.SUBTEX_BRAID_09, 2*128, 158, 136, 136,
        $.SUBTEX_BRAID_10, 3*128, 158, 136, 136,
        $.SUBTEX_BRAID_11, 4*128, 158, 136, 136,
        $.SUBTEX_BRAID_12, 5*128, 158, 136, 136,
        $.SUBTEX_BRAID_13, 6*128, 158, 136, 136,
        $.SUBTEX_BRAID_14, 0*128, 309, 136, 136,
        $.SUBTEX_BRAID_15, 1*128, 309, 136, 136,
        $.SUBTEX_BRAID_16, 2*128, 309, 136, 136,
        $.SUBTEX_BRAID_17, 3*128, 309, 136, 136,
        $.SUBTEX_BRAID_18, 4*128, 309, 136, 136,
        $.SUBTEX_BRAID_19, 5*128, 309, 136, 136,
        $.SUBTEX_BRAID_20, 6*128, 309, 136, 136,
        $.SUBTEX_BRAID_21, 0*128, 461, 136, 136,
        $.SUBTEX_BRAID_22, 1*128, 461, 136, 136,
        $.SUBTEX_BRAID_23, 2*128, 461, 136, 136,
        $.SUBTEX_BRAID_24, 3*128, 461, 136, 136,
        $.SUBTEX_BRAID_25, 4*128, 461, 136, 136,
        $.SUBTEX_BRAID_26, 5*128, 461, 136, 136,
    ],
    $.TEX_POLY, 512, 512, paramiMinLinMaxLin, [
        $.SUBTEX_BG, 94, 97, 256, 256
    ],
    $.TEX_SPRITE, 256, 256, paramiMinLinMaxLin, [
        $.SUBTEX_UKKO, 0, 0, 256, 256,
    ]
];

const textures = new Map();
const textureParami = new Map();
const subTextureData = new Map();

for (let i = 0; i < textureDef.length;)
{
    const src = textureDef[i++];
    const texture = Texture.create();

    const baseData = {
        width: textureDef[i++],
        height: textureDef[i++],
        texture
    };

    textures.set(src, texture);
    textureParami.set(src, textureDef[i++]);

    const subTextures = textureDef[i++];

    for (let j = 0; j < subTextures.length;)
    {
        subTextureData.set(subTextures[j++], {
            x: subTextures[j++],
            y: subTextures[j++],
            width: subTextures[j++],
            height: subTextures[j++],
            baseData: baseData
        });
    }
}

const toFetch = [...textures.keys()];
fetchNextImage();
