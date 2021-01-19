import * as $ from "../const";
import { gl } from "../dom";
import { SafeMap } from "../utils/better-builtins";
import { LISTENER_ONCE } from "../utils/helper";

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
    createFramebufferTexture(width, height)
    {
        const texture = Texture.create();
        Texture.bind(texture);

        gl.texStorage2D(
            $.TEXTURE_2D,
            1,
            $.RGB8,
            width,
            height
        );

        Texture.unbind();

        return texture;
    },
    getSubTextureData(modelId)
    {
        return subTextureData.get(modelId);
    },
    getUvFromSubTexture(subTexId)
    {
        const {
            x, y, width, height, baseData
        } = Texture.getSubTextureData(subTexId);

        const minX = x / baseData.width;
        const maxX = (x + width) / baseData.width;
        const minY = y / baseData.height;
        const maxY = (y + height) / baseData.height;

        return [
            minX, maxY,
            maxX, maxY,
            minX, minY,
            maxX, minY,
        ];
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

    Texture.bind(texture);
    gl.texImage2D($.TEXTURE_2D, 0, $.RGBA, $.RGBA, $.UNSIGNED_BYTE, image);

    Texture.setParami($.TEXTURE_MIN_FILTER, $.LINEAR);

    Texture.unbind();
    textures.delete(src);

    if (toFetch.length)
    {
        fetchNextImage();
    }
});

image.addEventListener("error", (e) =>
{
    throw Error(e);
}, LISTENER_ONCE);

/*------------------------------------------------------------------------------
    Textures
------------------------------------------------------------------------------*/
let oldTexture;

// id/url, width, height, parami[], subtextures[ id, x, y, width, height ]
const textureData = [
    $.FILE_BRAID, 1024, 1024, [
        $.SUBTEX_BRAID_00, 0,   10,  136, 136,
        $.SUBTEX_BRAID_01, 128, 10,  136, 136,
        $.SUBTEX_BRAID_02, 256, 10,  136, 136,
        $.SUBTEX_BRAID_03, 384, 10,  136, 136,
        $.SUBTEX_BRAID_04, 512, 10,  136, 136,
        $.SUBTEX_BRAID_05, 640, 10,  136, 136,
        $.SUBTEX_BRAID_06, 768, 10,  136, 136,
        $.SUBTEX_BRAID_07, 0,   158, 136, 136,
        $.SUBTEX_BRAID_08, 128, 158, 136, 136,
        $.SUBTEX_BRAID_09, 256, 158, 136, 136,
        $.SUBTEX_BRAID_10, 384, 158, 136, 136,
        $.SUBTEX_BRAID_11, 512, 158, 136, 136,
        $.SUBTEX_BRAID_12, 640, 158, 136, 136,
        $.SUBTEX_BRAID_13, 768, 158, 136, 136,
        $.SUBTEX_BRAID_14, 0,   309, 136, 136,
        $.SUBTEX_BRAID_15, 128, 309, 136, 136,
        $.SUBTEX_BRAID_16, 256, 309, 136, 136,
        $.SUBTEX_BRAID_17, 384, 309, 136, 136,
        $.SUBTEX_BRAID_18, 512, 309, 136, 136,
        $.SUBTEX_BRAID_19, 640, 309, 136, 136,
        $.SUBTEX_BRAID_20, 768, 309, 136, 136,
        $.SUBTEX_BRAID_21, 0,   461, 136, 136,
        $.SUBTEX_BRAID_22, 128, 461, 136, 136,
        $.SUBTEX_BRAID_23, 256, 461, 136, 136,
        $.SUBTEX_BRAID_24, 384, 461, 136, 136,
        $.SUBTEX_BRAID_25, 512, 461, 136, 136,
        $.SUBTEX_BRAID_26, 640, 461, 136, 136,
    ],
    $.FILE_POLY, 512, 512, [
        $.SUBTEX_GROUND, 94, 97, 256, 256
    ]
];

const textures = new SafeMap();
const subTextureData = new SafeMap();

for (let i = 0; i < textureData.length;)
{
    const src = textureData[i++];
    const texture = Texture.create();

    const baseData = {
        width: textureData[i++],
        height: textureData[i++],
        texture
    };

    textures.set(src, texture);

    const subTextures = textureData[i++];

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
