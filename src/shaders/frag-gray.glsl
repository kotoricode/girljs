#version 300 es
precision mediump float;

uniform sampler2D u_tex;
in vec2 v_uv;
out vec4 outColor;

void main()
{
    vec4 texColor = texture(u_tex, v_uv);

    float desat = dot(
        texColor.rgb,
        vec3(0.2989, 0.5866, 0.1145)
    );

    ivec2 size = textureSize(u_tex, 0);
    float test = gl_FragCoord.x / float(size.x);

    outColor = mix(
        texColor,
        vec4(desat, desat, desat, 1.0),
        test
    );
}
