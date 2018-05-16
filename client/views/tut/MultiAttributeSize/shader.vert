attribute vec4 a_Position;// attribute variable
attribute float a_PointSize;
uniform mat4 u_ModelMatrix;
void main() {

    gl_Position = u_ModelMatrix * a_Position;
    gl_PointSize = a_PointSize;
}