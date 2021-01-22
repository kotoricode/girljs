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
    getUvData(uvId)
    {
        return uvData.get(uvId);
    },
    getUv(uvId)
    {
        if (uvs.has(uvId))
        {
            return uvs.get(uvId);
        }

        const { x, y, width, height, base } = Texture.getUvData(uvId);

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

        return uv;
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
const fetchNextImage = () => image.src = `${$.PATH_IMG}${toFetch[0]}`;

const image = new Image();

image.addEventListener("load", () =>
{
    const src = toFetch.shift();
    const texture = textures.get(src);

    Texture.bind(texture);
    Texture.from(image);
    Texture.parami($.TEXTURE_MIN_FILTER, $.LINEAR);
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
    $.URL_TEX_GIRL, 186, 600, [
        $.UV_GIRL_00, 0, 0, 186, 600
    ],
    $.URL_TEX_BRAID, 1024, 1024, [
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
    $.URL_TEX_POLY, 512, 512, [
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
