#version 300 es

uniform camera
{
    mat4 u_viewProjection;
};

in vec3 a_xyz;

void main()
{
    gl_Position = u_viewProjection * vec4(a_xyz, 1);
}
