#version 300 es
precision mediump float;

const vec3 luma = vec3(0.299, 0.587, 0.114);

uniform sampler2D u_texture;
in vec2 v_texcoord;
out vec4 outColor;

void main()
{
    vec4 color = texture(u_texture, v_texcoord);

    float rgbLuma = dot(color.rgb, luma);

    ivec2 size = textureSize(u_texture, 0);
    float amount = gl_FragCoord.x / float(size.x);

    outColor = vec4(
        mix(color.rgb, vec3(rgbLuma), amount),
        color.a
    );
}
