#version 300 es

uniform mat4 u_transform;
uniform mat4 u_viewprojection;
uniform vec2 u_uvRepeat;

in vec2 a_position;
in vec2 a_uv;
out vec2 v_uv;

void main()
{
    gl_Position = u_viewprojection * u_transform * vec4(a_position, 0, 1);
    v_uv = a_uv * u_uvRepeat;
}
