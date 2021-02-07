#version 300 es
precision mediump float;
// https://catlikecoding.com/unity/tutorials/advanced-rendering/fxaa/

#define ABSOLUTE_CONTRAST_THRESHOLD 0.0312
#define RELATIVE_CONTRAST_THRESHOLD 0.125

const vec3 luma = vec3(0.299, 0.587, 0.114);
const ivec2 N = ivec2(0, 1);
const ivec2 E = ivec2(1, 0);
const ivec2 NE = N + E;
const ivec2 SE = E - N;

uniform sampler2D u_texture;
in vec2 v_texcoord;
out vec4 outColor;

void main()
{
    vec3 rgb = texture(u_texture, v_texcoord).rgb;

    /*--------------------------------------------------------------------------
        Sample luminance
    --------------------------------------------------------------------------*/
    float lumaN = dot(textureOffset(u_texture, v_texcoord, N).rgb, luma);
    float lumaS = dot(textureOffset(u_texture, v_texcoord, -N).rgb, luma);
    float lumaE = dot(textureOffset(u_texture, v_texcoord, E).rgb, luma);
    float lumaW = dot(textureOffset(u_texture, v_texcoord, -E).rgb, luma);

    float lumaNE = dot(textureOffset(u_texture, v_texcoord, NE).rgb, luma);
    float lumaNW = dot(textureOffset(u_texture, v_texcoord, -SE).rgb, luma);
    float lumaSE = dot(textureOffset(u_texture, v_texcoord, SE).rgb, luma);
    float lumaSW = dot(textureOffset(u_texture, v_texcoord, -NE).rgb, luma);

    float lumaM = dot(texture(u_texture, v_texcoord).rgb, luma);

    /*--------------------------------------------------------------------------
        Contrast
    --------------------------------------------------------------------------*/
    float lumaMax = max(max(max(max(lumaN, lumaS), lumaE), lumaW), lumaM);
    float lumaMin = min(min(min(min(lumaN, lumaS), lumaE), lumaW), lumaM);

    float contrast = lumaMax - lumaMin;

    /*--------------------------------------------------------------------------
        Blend factor
    --------------------------------------------------------------------------*/
    float blendFilter = 2.0 * (lumaN + lumaS + lumaE + lumaW);
    blendFilter += lumaNE + lumaNW + lumaSE + lumaSW;
    blendFilter *= 1.0 / 12.0;
    blendFilter = abs(blendFilter - lumaMin);
    blendFilter = clamp(blendFilter / contrast, 0.0, 1.0);

    float blendFactor = smoothstep(0.0, 1.0, blendFilter);
    blendFactor *= blendFactor;

    /*--------------------------------------------------------------------------
        Continue from 3.4
    --------------------------------------------------------------------------*/

    if (contrast < ABSOLUTE_CONTRAST_THRESHOLD ||
        contrast < RELATIVE_CONTRAST_THRESHOLD * lumaMax
    )
    {
        // SKIP
        outColor = vec4(0, 0, 0, 1);
    }
    else
    {
        outColor = vec4(blendFactor, blendFactor, blendFactor, 1);
    }
}
