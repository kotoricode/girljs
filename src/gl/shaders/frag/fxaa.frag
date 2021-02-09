#version 300 es
precision mediump float;
// https://catlikecoding.com/unity/tutorials/advanced-rendering/fxaa/

#define ABSOLUTE_CONTRAST_THRESHOLD 1.0/32.0
#define RELATIVE_CONTRAST_THRESHOLD 1.0/32.0
#define SUBPIXEL_BLENDING 1.0
#define EDGE_STEP_COUNT 8

const vec3 luma = vec3(0.299, 0.587, 0.114);
const ivec2 N = ivec2(0, 1);
const ivec2 E = ivec2(1, 0);
const ivec2 NE = N + E;
const ivec2 SE = E - N;

uniform sampler2D u_texture;
in vec2 v_texcoord;
out vec4 outColor;

void main()
{
    vec4 color = texture(u_texture, v_texcoord);

    /*--------------------------------------------------------------------------
        Sample luminance
    --------------------------------------------------------------------------*/
    float lumaN = dot(textureOffset(u_texture, v_texcoord, N).rgb, luma);
    float lumaS = dot(textureOffset(u_texture, v_texcoord, -N).rgb, luma);
    float lumaE = dot(textureOffset(u_texture, v_texcoord, E).rgb, luma);
    float lumaW = dot(textureOffset(u_texture, v_texcoord, -E).rgb, luma);

    float lumaNE = dot(textureOffset(u_texture, v_texcoord, NE).rgb, luma);
    float lumaNW = dot(textureOffset(u_texture, v_texcoord, -SE).rgb, luma);
    float lumaSE = dot(textureOffset(u_texture, v_texcoord, SE).rgb, luma);
    float lumaSW = dot(textureOffset(u_texture, v_texcoord, -NE).rgb, luma);

    float lumaM = dot(color.rgb, luma);

    /*--------------------------------------------------------------------------
        Contrast
    --------------------------------------------------------------------------*/
    float lumaMax = max(max(max(max(lumaN, lumaS), lumaE), lumaW), lumaM);
    float lumaMin = min(min(min(min(lumaN, lumaS), lumaE), lumaW), lumaM);

    float contrast = lumaMax - lumaMin;

    if (contrast < ABSOLUTE_CONTRAST_THRESHOLD ||
        contrast < RELATIVE_CONTRAST_THRESHOLD * lumaMax
    )
    {
        outColor = color;

        return;
    }
    else
    {
        /*----------------------------------------------------------------------
            Blend factor
        ----------------------------------------------------------------------*/
        float blendFilter = 2.0 * (lumaN + lumaS + lumaE + lumaW);
        blendFilter += lumaNE + lumaNW + lumaSE + lumaSW;
        blendFilter *= 1.0 / 12.0;
        blendFilter = abs(blendFilter - lumaMin);
        blendFilter = clamp(blendFilter / contrast, 0.0, 1.0);

        float pixelBlendFactor = pow(smoothstep(0.0, 1.0, blendFilter), 2.0) * SUBPIXEL_BLENDING;

        /*----------------------------------------------------------------------
            Determine edge
        ----------------------------------------------------------------------*/
        float horEdge = abs(lumaN + lumaS - 2.0 * lumaM) * 2.0 +
                        abs(lumaNE + lumaSE - 2.0 * lumaE) +
                        abs(lumaNW + lumaSW - 2.0 * lumaW);
                        
        float verEdge = abs(lumaE + lumaW - 2.0 * lumaM) * 2.0 +
                        abs(lumaNE + lumaNW - 2.0 * lumaN) +
                        abs(lumaSE + lumaSW - 2.0 * lumaS);

        bool isEdgeHorizontal = horEdge >= verEdge;

        vec2 pixelSize = 1.0 / vec2(textureSize(u_texture, 0));
        float pixelStep = isEdgeHorizontal ? pixelSize.y : pixelSize.x;

        float posLuma = isEdgeHorizontal ? lumaN : lumaE;
        float negLuma = isEdgeHorizontal ? lumaS : lumaW;
        float posGradient = abs(posLuma - lumaM);
        float negGradient = abs(negLuma - lumaM);

        float oppositeLuma;
        float gradient;

        if (posGradient < negGradient)
        {
            pixelStep = -pixelStep;
            oppositeLuma = negLuma;
            gradient = negGradient;
        }
        else
        {
            oppositeLuma = posLuma;
            gradient = posGradient;
        }

        vec2 uvEdge = v_texcoord;
        vec2 edgeStep;

        if (isEdgeHorizontal)
        {
            uvEdge.y += pixelStep * 0.5;
            edgeStep = vec2(pixelSize.x, 0);
        }
        else
        {
            uvEdge.x += pixelStep * 0.5;
            edgeStep = vec2(0, pixelSize.y);
        }

        float edgeLuma = (lumaM + oppositeLuma) * 0.5;
        float gradientThreshold = gradient * 0.25;

        // POS
        vec2 puv = uvEdge + edgeStep;
        float pDeltaLuma = dot(texture(u_texture, puv).rgb, luma);
        bool pAtEnd = abs(pDeltaLuma) >= gradientThreshold;

        for (int i = 0; i < EDGE_STEP_COUNT && !pAtEnd; i++)
        {
            puv += edgeStep;
            pDeltaLuma = dot(texture(u_texture, puv).rgb, luma) - edgeLuma;
            pAtEnd = abs(pDeltaLuma) >= gradientThreshold;
        }

        // NEG
        vec2 nuv = uvEdge - edgeStep;
        float nDeltaLuma = dot(texture(u_texture, nuv).rgb, luma);
        bool nAtEnd = abs(nDeltaLuma) >= gradientThreshold;

        for (int i = 0; i < EDGE_STEP_COUNT && !nAtEnd; i++)
        {
            nuv -= edgeStep;
            nDeltaLuma = dot(texture(u_texture, nuv).rgb, luma) - edgeLuma;
            nAtEnd = abs(nDeltaLuma) >= gradientThreshold;
        }

        // DIST
        float pDistance;
        float nDistance;
        float shortestDistance;
        bool deltaSign;

        if (isEdgeHorizontal)
        {
            pDistance = puv.x - v_texcoord.x;
            nDistance = v_texcoord.x - nuv.x;
        }
        else
        {
            pDistance = puv.y - v_texcoord.y;
            nDistance = v_texcoord.y - nuv.y;
        }

        if (pDistance <= nDistance)
        {
            shortestDistance = pDistance;
            deltaSign = pDeltaLuma >= 0.0;
        }
        else
        {
            shortestDistance = nDistance;
            deltaSign = nDeltaLuma >= 0.0;
        }

        float edgeBlendFactor = 0.0;

        if (deltaSign != (lumaM - edgeLuma >= 0.0))
        {
            edgeBlendFactor = 0.5 - shortestDistance / (pDistance + nDistance);
        }

        /*----------------------------------------------------------------------
            Blending
        ----------------------------------------------------------------------*/
        float blendFactor = max(edgeBlendFactor, pixelBlendFactor);
        float blendStrength = pixelStep * blendFactor;
        vec2 blend;

        if (isEdgeHorizontal)
        {
            blend = vec2(0, blendStrength);
        }
        else
        {
            blend = vec2(blendStrength, 0);
        }

        outColor = textureLod(u_texture, v_texcoord + blend, 0.0);
    }
}
