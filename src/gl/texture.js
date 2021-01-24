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
    create()
    {
        return gl.createTexture();
    },
    createFramebufferTexture(width, height)
    {
        const texture = Texture.create();
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
    get(uvId)
    {
        return uvData.get(uvId).base.texture;
    },
    getUv(uvId)
    {
        if (!uvs.has(uvId))
        {
            const { x, y, width, height, base } = uvData.get(uvId);

            const minX = x / base.width;
            const maxX = (x + width) / base.width;
            const minY = y / base.height;
            const maxY = (y + height) / base.height;

            const uv = [
                minX, maxY,
                maxX, maxY,
                minX, minY,
                minX, minY,
                maxX, maxY,
                maxX, minY,
            ];

            uvs.set(uvId, uv);
        }

        return uvs.get(uvId);
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
    const texture = textures.get(src);

    Texture.bind(texture);
    Texture.from(image);
    Texture.parami($.TEXTURE_MIN_FILTER, $.LINEAR);
    Texture.parami($.TEXTURE_WRAP_S, $.CLAMP_TO_EDGE);
    Texture.parami($.TEXTURE_WRAP_T, $.CLAMP_TO_EDGE);
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
let activeTexture;

// id/url, width, height, parami[], uvs[ id, x, y, width, height ]
const textureDef = [
    "girl.png", 356, 1170, [
        $.UV_GIRL_00, 0, 0, 356, 1170
    ],
    "braid.png", 1024, 1024, [
        $.UV_BRAID_00, 0,   10,  136, 136,
        $.UV_BRAID_02, 256, 10,  136, 136,
        $.UV_BRAID_04, 512, 10,  136, 136,
        $.UV_BRAID_06, 768, 10,  136, 136,
        $.UV_BRAID_08, 128, 158, 136, 136,
        $.UV_BRAID_10, 384, 158, 136, 136,
        $.UV_BRAID_12, 640, 158, 136, 136,
        $.UV_BRAID_14, 0,   309, 136, 136,
        $.UV_BRAID_16, 256, 309, 136, 136,
        $.UV_BRAID_18, 512, 309, 136, 136,
        $.UV_BRAID_20, 768, 309, 136, 136,
        $.UV_BRAID_22, 128, 461, 136, 136,
        $.UV_BRAID_24, 384, 461, 136, 136,
        $.UV_BRAID_26, 640, 461, 136, 136,
    ],
    "texture.png", 512, 512, [
        $.UV_GROUND, 94, 97, 256, 256
    ]
];

const textures = new SafeMap();
const uvData = new SafeMap();
const uvs = new SafeMap([
    [$.UV_SCREEN, [
        0, 0,
        1, 0,
        0, 1,
        0, 1,
        1, 0,
        1, 1,
    ]]
]);

for (let i = 0; i < textureDef.length;)
{
    const src = textureDef[i++];
    const texture = Texture.create();

    const base = {
        width: textureDef[i++],
        height: textureDef[i++],
        texture
    };

    textures.set(src, texture);
    const textureUvs = textureDef[i++];

    for (let j = 0; j < textureUvs.length;)
    {
        const uvId = textureUvs[j++];
        const x = textureUvs[j++];
        const y = textureUvs[j++];
        const width = textureUvs[j++];
        const height = textureUvs[j++];

        uvData.set(uvId, { x, y, width, height, base });
    }
}

const toFetch = [...textures.keys()];
fetchNextImage();
