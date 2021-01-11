#version 300 es

uniform camera {
	mat4 u_viewProjection;
};
in vec3 a_position;

void main()
{
    gl_Position = u_viewProjection * vec4(a_position.xyz, 1);
}
