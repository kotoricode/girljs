import * as $ from "../const";
import { gl } from "../main";
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
        textures.clear();

        textures.set($.TEX_GIRL, createImageTexture("girl.png"));
        textures.set($.TEX_HOME, createImageTexture("home.png"));
        textures.set($.TEX_WOOD, createImageTexture("wood.jpg"));
        textures.set($.TEX_FB, createFbTexture());
        textures.set($.TEX_UI_TEXT, createTexture());
        textures.set($.TEX_UI_BUBBLE, createTexture());
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
const createTexture = () => gl.createTexture();

const createImageTexture = (src) =>
{
    const image = new Image();
    const texture = createTexture();

    image.addEventListener("load", () =>
    {
        Texture.bind(texture);
        Texture.from(image);
        Texture.parami($.TEXTURE_MIN_FILTER, $.LINEAR);
        Texture.unbind();
    }, LISTENER_ONCE);

    image.src = "./img/" + src;

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
const textures = new SafeMap();
