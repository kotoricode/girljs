#version 300 es
precision mediump float;
// https://github.com/demoscenepassivist/SocialCoding/blob/master/code_demos_jogamp/shaders/fxaa.fs

const float reduceMin = 1.0 / 128.0;
const float quarterReduceMul = 0.25 / 8.0;
const vec2 spanMax = vec2(8, 8);

const vec2 SW = vec2(-1, 1);
const vec2 SE = vec2(1, 1);

const vec3 luma = vec3(0.299, 0.587, 0.114);

uniform sampler2D u_texture;
out vec4 outColor;

void main()
{
    vec2 invSize = 1.0 / vec2(textureSize(u_texture, 0));

    vec2 frag = gl_FragCoord.xy;
    vec2 fragInvSize = frag * invSize;
    
    float lumaNW = dot(luma, texture(u_texture, (frag - SE) * invSize).xyz);
    float lumaNE = dot(luma, texture(u_texture, (frag - SW) * invSize).xyz);
    float lumaSW = dot(luma, texture(u_texture, (frag + SW) * invSize).xyz);
    float lumaSE = dot(luma, texture(u_texture, (frag + SE) * invSize).xyz);
    float lumaM = dot(luma, texture(u_texture, fragInvSize).xyz);
    
    vec2 dir = vec2(
        lumaSW + lumaSE - lumaNW - lumaNE,
        lumaNW + lumaSW - lumaNE - lumaSE
    );

    vec2 absDir = abs(dir);
    
    vec2 halfDir = 0.5 * invSize * min(
        spanMax,
        max(
            -spanMax,
            dir / (min(absDir.x, absDir.y) + max(
                (lumaNW + lumaNE + lumaSW + lumaSE) * quarterReduceMul,
                reduceMin
            ))
        )
    );

    vec2 oneSixthDir = halfDir / 3.0;

    vec3 rgbA = 0.5 * (
        texture(u_texture, fragInvSize - oneSixthDir).xyz +
        texture(u_texture, fragInvSize + oneSixthDir).xyz
    );

    vec3 rgbB = rgbA * 0.5 + 0.25 * (
        texture(u_texture, fragInvSize - halfDir).xyz +
        texture(u_texture, fragInvSize + halfDir).xyz
    );
    
    float lumaB = dot(rgbB, luma);

    outColor = vec4(
        lumaB < min(lumaM, min(min(lumaNW, lumaNE), min(lumaSW, lumaSE))) ||
        lumaB > max(lumaM, max(max(lumaNW, lumaNE), max(lumaSW, lumaSE)))
        ? rgbA : rgbB, 1
    );
}