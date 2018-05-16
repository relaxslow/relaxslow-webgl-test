attribute vec4 a_Position;// attribute variable
uniform vec4 u_Translation;
void main() {
   gl_Position = a_Position + u_Translation;
}