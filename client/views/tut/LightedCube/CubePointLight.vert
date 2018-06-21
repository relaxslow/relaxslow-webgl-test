//cube
uniform mat4 u_MVPMatrix;

uniform mat4 u_ModelMatrix;
uniform mat4 u_NormalMatrix;

uniform vec3 u_LightColor;
uniform vec3 u_LightDirection;
uniform vec3 u_LightPosition;
uniform vec3 u_AmbientLight;

attribute vec4 a_Position;
attribute vec4 a_Color;
attribute vec4 a_Normal;

varying vec4 v_Color;
void main() {
    gl_Position = u_MVPMatrix* a_Position;
    //normal
    vec3 normal = normalize(vec3(u_NormalMatrix * a_Normal));

    //lightDirection
    vec4 vertexPosition = u_ModelMatrix * a_Position;
    vec3 lightDirection = normalize( u_LightPosition - vec3(vertexPosition) );

    //cos(a)
    float nDotL = max(dot(lightDirection, normal), 0.0);
    vec3 diffuse = u_LightColor * a_Color.rgb * nDotL;
    vec3 ambient = u_AmbientLight * a_Color.rgb;
    v_Color = vec4( diffuse+ambient , a_Color.a );
}