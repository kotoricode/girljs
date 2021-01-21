#version 300 es

in vec2 a_xy;
in vec2 a_uv;
out vec2 v_uv;

void main()
{
    gl_Position = vec4(a_xy, 0, 1);
    v_uv = a_uv;
}
