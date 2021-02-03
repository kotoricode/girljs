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
const float reduceMul = 1.0 / 8.0;
const float reduceMin = 1.0 / 128.0;

uniform sampler2D u_texture;
in vec2 v_uv;
out vec4 outColor;

void main() 
{
    vec2 invRes = 1.0 / vec2(textureSize(u_texture, 0));

    vec3 rgbNW = textureOffset(u_texture, v_uv, -SE).rgb;
    vec3 rgbNE = textureOffset(u_texture, v_uv, NE).rgb;
    vec3 rgbSW = textureOffset(u_texture, v_uv, -NE).rgb;
    vec3 rgbSE = textureOffset(u_texture, v_uv, SE).rgb;
    vec3 rgbM = texture(u_texture, v_uv).rgb;

    float lumaNW = dot(rgbNW, luma);
    float lumaNE = dot(rgbNE, luma);
    float lumaSW = dot(rgbSW, luma);
    float lumaSE = dot(rgbSE, luma);
    float lumaM = dot(rgbM, luma);

    float lumaMin = min(lumaM, min(min(lumaNW, lumaNE), min(lumaSW, lumaSE)));
    float lumaMax = max(lumaM, max(max(lumaNW, lumaNE), max(lumaSW, lumaSE)));

    vec2 dir = vec2(
        lumaSW + lumaSE - lumaNW - lumaNE,
        lumaNW + lumaSW - lumaNE - lumaSE
    );

    float dirReduce = max(
        (lumaNW + lumaNE + lumaSW + lumaSE) * 0.25 * reduceMul,
        reduceMin
    );
    
    float dirMin = min(abs(dir.x), abs(dir.y)) + dirReduce;
    
    vec2 newDir = invRes * min(
        spanMax, 
        max(-spanMax, dir / dirMin)
    );

    vec2 halfNewDir = newDir * 0.5;
    vec2 sixthNewDir = halfNewDir / 3.0;

    vec3 rgbA = 0.5 * (
        texture(u_texture, v_uv - sixthNewDir).rgb +
        texture(u_texture, v_uv + sixthNewDir).rgb
    );
    
    vec3 rgbB = rgbA * 0.5 + 0.25 * (
        texture(u_texture, v_uv - halfNewDir).rgb +
        texture(u_texture, v_uv + halfNewDir).rgb
    );

    float lumaB = dot(rgbB, luma);

    outColor = vec4(
        lumaB < lumaMin || lumaMax < lumaB ? rgbA : rgbB, 1
    );
}