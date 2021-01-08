#version 300 es
precision mediump float;

uniform sampler2D u_texture;
uniform vec4 u_color;
uniform vec2 u_uvOffset;
uniform vec2 u_uvSize;

in vec2 v_uv;
in vec2 v_uvRepeat;
out vec4 outColor;

void main()
{
    outColor = texture(
        u_texture,
        mod((v_uv - u_uvOffset) * v_uvRepeat, u_uvSize) + u_uvOffset
    ) * u_color;
}
