#version 300 es

uniform mat4 u_transform;
in vec3 a_xyz;
in vec2 a_uv;
out vec2 v_uv;

void main()
{
    gl_Position = u_transform * vec4(a_xyz, 1);
    v_uv = a_uv;
}
