//indicator
precision mediump float;
uniform vec3 u_PointLightColor;
uniform vec3 u_PointLightPosition;
uniform sampler2D u_Sampler0;

varying vec3 v_DirectAmbient;
varying vec3 v_Normal;
varying vec3 v_Position;
varying vec4 v_Color;
varying vec2 v_TexCoord;
void main() {
    vec3 normal = normalize(v_Normal);
    vec3 lightDirection = normalize(u_PointLightPosition - v_Position);
    float nDotL = max(dot( lightDirection, normal), 0.0);
    vec3 pointdiffuse = u_PointLightColor * v_Color.rgb * nDotL;
    vec4 textureColor = texture2D(u_Sampler0, v_TexCoord);
    gl_FragColor = vec4(textureColor.rgb * (pointdiffuse + v_DirectAmbient)  , v_Color.a);
}

