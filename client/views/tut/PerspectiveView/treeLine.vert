uniform mat4 u_MVPMatrix;
uniform vec4 u_Color;
attribute vec4 a_Position;
attribute vec4 a_Color;
attribute float a_Index;
varying vec4 v_Color;
void main() {
    gl_Position =u_MVPMatrix* a_Position;
    if(a_Index==0.0 || a_Index==1.0)
        v_Color=u_Color;
    else
        v_Color = a_Color;
}