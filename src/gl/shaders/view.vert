#version 300 es

in vec3 a_xyz;
in vec2 a_uv;
out vec2 v_uv;

void main()
{
    gl_Position = vec4(a_xyz, 1);
    v_uv = a_uv;
}
