#version 300 es
precision mediump float;
/*
edited from
https://www.geeks3d.com/20110405/fxaa-fast-approximate-anti-aliasing-demo-glsl-opengl-test-radeon-geforce/3/
*/

const ivec2 SE = ivec2(1, 1);
const ivec2 NE = ivec2(1, -1);

const vec3 luma = vec3(0.299, 0.587, 0.114);

const vec2 spanMax = vec2(8, 8);
const float quarterReduceMul = 0.25 / 8.0;
const float reduceMin = 1.0 / 128.0;

uniform sampler2D u_texture;
in vec2 v_texcoord;
out vec4 outColor;

void main() 
{
    float lumaNW = dot(textureOffset(u_texture, v_texcoord, -SE).rgb, luma);
    float lumaNE = dot(textureOffset(u_texture, v_texcoord, NE).rgb, luma);
    float lumaSW = dot(textureOffset(u_texture, v_texcoord, -NE).rgb, luma);
    float lumaSE = dot(textureOffset(u_texture, v_texcoord, SE).rgb, luma);
    float lumaM = dot(texture(u_texture, v_texcoord).rgb, luma);

    vec2 dir = vec2(
        lumaSW + lumaSE - lumaNW - lumaNE,
        lumaNW + lumaSW - lumaNE - lumaSE
    );
    
    vec2 halfNewDir = min(
        spanMax, 
        max(
            -spanMax,
            dir / (
                min(
                    abs(dir.x),
                    abs(dir.y)
                ) + max(
                    (lumaNW + lumaNE + lumaSW + lumaSE) * quarterReduceMul,
                    reduceMin
                )
            )
        )
    ) / (2.0 * vec2(textureSize(u_texture, 0)));

    vec2 sixthNewDir = halfNewDir / 3.0;

    vec3 rgbA = 0.5 * (
        texture(u_texture, v_texcoord - sixthNewDir).rgb +
        texture(u_texture, v_texcoord + sixthNewDir).rgb
    );
    
    vec3 rgbB = rgbA * 0.5 + 0.25 * (
        texture(u_texture, v_texcoord - halfNewDir).rgb +
        texture(u_texture, v_texcoord + halfNewDir).rgb
    );

    float lumaB = dot(rgbB, luma);

    outColor = vec4(
        lumaB < min(lumaM, min(min(lumaNW, lumaNE), min(lumaSW, lumaSE))) ||
        lumaB > max(lumaM, max(max(lumaNW, lumaNE), max(lumaSW, lumaSE)))
        ? rgbA : rgbB, 1
    );
}
