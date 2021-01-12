#version 300 es
precision mediump float;

uniform sampler2D u_texture;
uniform vec4 u_color;
uniform vec2 u_uvOffset;
uniform vec2 u_uvSize;
uniform vec2 u_uvRepeat;
in vec2 v_uv;
out vec4 outColor;

void main()
{
    outColor = texture(
        u_texture,
        mod((v_uv - u_uvOffset) * u_uvRepeat, u_uvSize) + u_uvOffset
    ) * u_color;
}
