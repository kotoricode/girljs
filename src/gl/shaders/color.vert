#version 300 es

uniform perScene {
	float y;
};

uniform mat4 u_viewprojection;
in vec3 a_position;

void main()
{
    gl_Position = u_viewprojection * vec4(a_position.x, y, a_position.z, 1);
}
