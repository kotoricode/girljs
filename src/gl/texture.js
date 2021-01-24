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
        return uvTexture.get(uvId);
    },
    getUv(uvId)
    {
        return newUv.get(uvId);
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

const imageRect = (x, y, width, height, baseWidth, baseHeight) =>
{
    const minX = x / baseWidth;
    const maxX = (x + width) / baseWidth;
    const minY = y / baseHeight;
    const maxY = (y + height) / baseHeight;

    return [
        minX, maxY,
        maxX, maxY,
        minX, minY,
        minX, minY,
        maxX, maxY,
        maxX, minY,
    ];
};

/*------------------------------------------------------------------------------
    Textures
------------------------------------------------------------------------------*/
let activeTexture;

const newUv = new SafeMap([
    [$.UV_GIRL_00, imageRect(0, 0, 356, 1170, 356, 1170)],
    [$.UV_BRAID_00, imageRect(0, 10, 136, 136, 1024, 1024)],
    [$.UV_BRAID_02, imageRect(256, 10, 136, 136, 1024, 1024)],
    [$.UV_BRAID_04, imageRect(512, 10, 136, 136, 1024, 1024)],
    [$.UV_BRAID_06, imageRect(768, 10, 136, 136, 1024, 1024)],
    [$.UV_BRAID_08, imageRect(128, 158, 136, 136, 1024, 1024)],
    [$.UV_BRAID_10, imageRect(384, 158, 136, 136, 1024, 1024)],
    [$.UV_BRAID_12, imageRect(640, 158, 136, 136, 1024, 1024)],
    [$.UV_BRAID_14, imageRect(0, 309, 136, 136, 1024, 1024)],
    [$.UV_BRAID_16, imageRect(256, 309, 136, 136, 1024, 1024)],
    [$.UV_BRAID_18, imageRect(512, 309, 136, 136, 1024, 1024)],
    [$.UV_BRAID_20, imageRect(768, 309, 136, 136, 1024, 1024)],
    [$.UV_BRAID_22, imageRect(128, 461, 136, 136, 1024, 1024)],
    [$.UV_BRAID_24, imageRect(384, 461, 136, 136, 1024, 1024)],
    [$.UV_BRAID_26, imageRect(640, 461, 136, 136, 1024, 1024)],
    [$.UV_GROUND, imageRect(94, 97, 256, 256, 512, 512)],
    [$.UV_SCREEN, [0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1,]],
    [$.UV_TEST, [0.875000, 0.500000, 0.625000, 0.750000, 0.625000, 0.500000, 0.625000, 0.750000, 0.375000, 1.000000, 0.375000, 0.750000, 0.625000, 0.000000, 0.375000, 0.250000, 0.375000, 0.000000, 0.375000, 0.500000, 0.125000, 0.750000, 0.125000, 0.500000, 0.625000, 0.500000, 0.375000, 0.750000, 0.375000, 0.500000, 0.625000, 0.250000, 0.375000, 0.500000, 0.375000, 0.250000, 0.875000, 0.500000, 0.875000, 0.750000, 0.625000, 0.750000, 0.625000, 0.750000, 0.625000, 1.000000, 0.375000, 1.000000, 0.625000, 0.000000, 0.625000, 0.250000, 0.375000, 0.250000, 0.375000, 0.500000, 0.375000, 0.750000, 0.125000, 0.750000, 0.625000, 0.500000, 0.625000, 0.750000, 0.375000, 0.750000, 0.625000, 0.250000, 0.625000, 0.500000, 0.375000, 0.500000, ]]
]);

const imageTextureDef = [
    "girl.png", [
        $.UV_GIRL_00,
    ],
    "braid.png", [
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
    "texture.png", [
        $.UV_GROUND,
        $.UV_TEST
    ]
];

const textures = new SafeMap();
const uvTexture = new SafeMap();

for (let i = 0; i < imageTextureDef.length;)
{
    const src = imageTextureDef[i++];
    const texture = Texture.create();

    textures.set(src, texture);
    const textureUvs = imageTextureDef[i++];

    for (let j = 0; j < textureUvs.length;)
    {
        const uvId = textureUvs[j++];
        uvTexture.set(uvId, texture);
    }
}

const toFetch = [...textures.keys()];
fetchNextImage();
