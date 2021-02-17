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
    init()
    {
        this.unbind();

        for (const texture of textures.values())
        {
            gl.deleteTexture(texture);
        }

        imagesToFetch.length = 0;
        imageTextures.clear();
        textures.clear();

        textures.set($.TEX_GIRL, createImageTexture("girl.png"));
        textures.set($.TEX_WORLD, createImageTexture("monkey.png"));
        textures.set($.TEX_HOME, createImageTexture("home.png"));
        textures.set($.TEX_WOOD, createImageTexture("wood.jpg"));
        textures.set($.TEX_FB, createFbTexture());
        textures.set($.TEX_UI_TEXT, createTexture());
        textures.set($.TEX_UI_BUBBLE, createTexture());

        fetchNextImage();
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
const fetchNextImage = () => image.src = "./img/" + imagesToFetch[0];

const image = new Image();

image.addEventListener("load", () =>
{
    const src = imagesToFetch.shift();
    const texture = imageTextures.get(src);

    Texture.bind(texture);
    Texture.from(image);
    Texture.parami($.TEXTURE_MIN_FILTER, $.LINEAR);
    Texture.parami($.TEXTURE_WRAP_S, $.CLAMP_TO_EDGE);
    Texture.parami($.TEXTURE_WRAP_T, $.CLAMP_TO_EDGE);
    Texture.unbind();

    imageTextures.delete(src);

    if (imagesToFetch.length)
    {
        fetchNextImage();
    }
});

image.addEventListener("error", (e) =>
{
    throw e;
}, LISTENER_ONCE);

const createTexture = () => gl.createTexture();

const createImageTexture = (src) =>
{
    const texture = createTexture();
    imageTextures.set(src, texture);
    imagesToFetch.push(src);

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
const textures = new SafeMap();
const imagesToFetch = [];
