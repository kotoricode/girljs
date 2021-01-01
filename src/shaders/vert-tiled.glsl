#version 300 es

uniform mat4 u_model;
uniform mat4 u_vp;
uniform vec2 u_uvRepeat;

in vec3 a_pos;
in vec2 a_uv;
out vec2 v_uv;

void main()
{
    gl_Position = u_vp * u_model * vec4(a_pos, 1.0);
    v_uv = a_uv * u_uvRepeat;
}
