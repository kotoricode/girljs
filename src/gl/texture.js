import * as $ from "../const";
import { gl } from "../dom";
import { SafeMap, LISTENER_ONCE } from "../utility";

export const Texture = {
    bind(texture)
    {
        if (texture !== activeTexture)
        {
            gl.bindTexture($.TEXTURE_2D, texture);
            activeTexture = texture;
        }
    },
    getFbTexture(width, height)
    {
        const texture = textures.get($.TEX_FRAMEBUFFER);
        Texture.bind(texture);
        gl.texStorage2D($.TEXTURE_2D, 1, $.RGB8, width, height);
        Texture.unbind();

        return texture;
    },
    flip(state)
    {
        gl.pixelStorei($.UNPACK_FLIP_Y_WEBGL, state);
    },
    from(src)
    {
        gl.texImage2D($.TEXTURE_2D, 0, $.RGBA, $.RGBA, $.UNSIGNED_BYTE, src);
    },
    getTexture(textureId)
    {
        return textures.get(textureId);
    },
    getTextureByUv(uvId)
    {
        return uvTexture.get(uvId);
    },
    parami(key, value)
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
const fetchNextImage = () => image.src = "./img/" + toFetch[0];

const image = new Image();

image.addEventListener("load", () =>
{
    const src = toFetch.shift();
    const texture = imageTextures.get(src);

    Texture.bind(texture);
    Texture.from(image);
    Texture.parami($.TEXTURE_MIN_FILTER, $.LINEAR);
    Texture.parami($.TEXTURE_WRAP_S, $.REPEAT);
    Texture.parami($.TEXTURE_WRAP_T, $.REPEAT);
    Texture.unbind();

    imageTextures.delete(src);

    if (toFetch.length)
    {
        fetchNextImage();
    }
});

image.addEventListener("error", (e) =>
{
    throw Error(e);
}, LISTENER_ONCE);

const createTexture = () => gl.createTexture();

const createImageTexture = (src) =>
{
    const texture = createTexture();
    imageTextures.set(src, texture);

    return texture;
};

/*------------------------------------------------------------------------------
    Textures
------------------------------------------------------------------------------*/
let activeTexture;
const imageTextures = new SafeMap();
const textures = new SafeMap();
const uvTexture = new SafeMap();

const textureDef = [
    $.TEX_GIRL, createImageTexture("girl.png"), [
        $.UV_GIRL_00,
    ],
    $.TEX_BRAID, createImageTexture("braid.png"), [
        $.UV_BRAID_00,
        $.UV_BRAID_02,
        $.UV_BRAID_04,
        $.UV_BRAID_06,
        $.UV_BRAID_08,
        $.UV_BRAID_10,
        $.UV_BRAID_12,
        $.UV_BRAID_14,
        $.UV_BRAID_16,
        $.UV_BRAID_18,
        $.UV_BRAID_20,
        $.UV_BRAID_22,
        $.UV_BRAID_24,
        $.UV_BRAID_26,
    ],
    $.TEX_TEXTURE, createImageTexture("texture.png"), [
        $.UV_GROUND,
        $.UV_TEST
    ],
    $.TEX_FRAMEBUFFER, createTexture(), null,
    $.TEX_UI_TEXT, createTexture(), null,
    $.TEX_UI_BUBBLE, createTexture(), null
];

for (let i = 0; i < textureDef.length;)
{
    const textureId = textureDef[i++];
    const texture = textureDef[i++];
    const textureUvs = textureDef[i++];

    textures.set(textureId, texture);

    if (textureUvs)
    {
        for (let j = 0; j < textureUvs.length;)
        {
            const uvId = textureUvs[j++];
            uvTexture.set(uvId, texture);
        }
    }
}

const toFetch = [...imageTextures.keys()];
fetchNextImage();
