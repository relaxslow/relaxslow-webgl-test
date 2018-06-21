//base shader 
//accept 3 lights : ambient,direct,point
//accept 1 texture
uniform mat4 u_MVPMatrix;

uniform mat4 u_ModelMatrix;
uniform mat4 u_NormalMatrix;


uniform vec3 u_DirectLightColor;
uniform vec3 u_DirectLightDirection;
uniform vec3 u_AmbientLightColor;

attribute vec4 a_Position;
attribute vec4 a_Normal;
attribute vec4 a_Color;
attribute vec2 a_TexCoord;

varying vec3 v_Position;
varying vec3 v_Normal;
varying vec4 v_Color;
varying vec2 v_TexCoord;
varying vec3 v_DirectAmbient;
void main() {
    gl_Position = u_MVPMatrix * a_Position;
    vec3 normal = normalize(vec3(u_NormalMatrix * a_Normal));
    float nDotL = max(dot(u_DirectLightDirection, normal), 0.0);
    vec3 directDiffuse = u_DirectLightColor * vec3(a_Color) * nDotL;
    vec3 ambient = u_AmbientLightColor * a_Color.rgb;

    v_Position = vec3(u_ModelMatrix * a_Position);
    v_Normal = normal;
    v_DirectAmbient = directDiffuse + ambient;
    v_TexCoord = a_TexCoord;
    v_Color=a_Color;
    
}