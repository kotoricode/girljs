#version 300 es
precision mediump float;

const vec3 luma = vec3(0.299, 0.587, 0.114);

uniform sampler2D u_texture;
in vec2 v_texcoord;
out vec4 outColor;

void main()
{
    outColor = vec4(
        vec3(dot(texture(u_texture, v_texcoord).rgb, luma)),
        1
    );
}
