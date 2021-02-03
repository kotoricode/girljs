#version 300 es

uniform camera
{
    mat4 u_viewProjection;
};

uniform mat4 u_transform;
in vec3 a_position;
in vec2 a_texcoord;
out vec2 v_texcoord;

void main()
{
    gl_Position = u_viewProjection * u_transform * vec4(a_position, 1);
    v_texcoord = a_texcoord;
}
