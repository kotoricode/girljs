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
    flip(state)
    {
        gl.pixelStorei($.UNPACK_FLIP_Y_WEBGL, state);
    },
    from(src)
    {
        gl.texImage2D($.TEXTURE_2D, 0, $.RGBA, $.RGBA, $.UNSIGNED_BYTE, src);
    },
    get(textureId)
    {
        return textures.get(textureId);
    },
    parami(key, value)
    {
        gl.texParameteri($.TEXTURE_2D, key, value);
    },
    unbind()
    {
        this.bind(null);
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
    Texture.parami($.TEXTURE_WRAP_S, $.CLAMP_TO_EDGE);
    Texture.parami($.TEXTURE_WRAP_T, $.CLAMP_TO_EDGE);
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

const createFbTexture = () =>
{
    const texture = createTexture();
    Texture.bind(texture);
    gl.texStorage2D($.TEXTURE_2D, 1, $.RGB8, $.RES_WIDTH, $.RES_HEIGHT);
    Texture.unbind();

    return texture;
};

/*------------------------------------------------------------------------------
    Textures
------------------------------------------------------------------------------*/
let activeTexture;
const imageTextures = new SafeMap();

const textures = new SafeMap([
    [$.TEX_BRAID, createImageTexture("braid.png")],
    [$.TEX_WORLD, createImageTexture("monkey.png")],
    [$.TEX_GROUND, createImageTexture("ground.png")],
    [$.TEX_HOME, createImageTexture("home.png")],
    [$.TEX_WOOD, createImageTexture("wood.jpg")],
    [$.TEX_FB, createFbTexture()],
    [$.TEX_UI_TEXT, createTexture()],
    [$.TEX_UI_BUBBLE, createTexture()]
]);

const toFetch = [...imageTextures.keys()];
fetchNextImage();
