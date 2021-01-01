#version 300 es

in vec3 a_pos;
in vec2 a_uv;
out vec2 v_uv;

void main()
{
    gl_Position = vec4(a_pos, 1.0);
    v_uv = a_uv * vec2(1.0, 1.0);
}
