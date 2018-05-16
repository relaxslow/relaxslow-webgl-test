attribute vec4 a_Position;// attribute variable
attribute float a_PointSize;
uniform mat4 u_ModelMatrix;
attribute vec4 a_Color;
varying vec4 v_Color;
void main() {

    gl_Position = u_ModelMatrix * a_Position;
    gl_PointSize = a_PointSize;
    v_Color = a_Color;
}