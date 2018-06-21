precision mediump float;
uniform vec4 u_SelectedColor;
void main() {
    gl_FragColor = u_SelectedColor;
   

    // gl_FragColor=vec4(1,0,0,1);
    // gl_FragColor = vec4(v_Normal, 1);
    // gl_FragColor = vec4(v_TexCoord, 0, 1);
}