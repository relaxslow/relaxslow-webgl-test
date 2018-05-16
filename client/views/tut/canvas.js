Init = (param) => {
    let { parent, data } = param;
    let canvas = parent.getElementsByClassName('webglCanvas')[0];
    let gl = canvas.getContext("webgl");
    if (gl == null) {
        console.log('%c webgl not support!!', 'background: #222; color: #ff0000');
        return;
    }
    console.log('%c webgl initialized!!', 'background: #222; color: #bada55');
   // Set clear color
   gl.clearColor(0.0, 0.0, 0.0, 1.0);

   // Clear <canvas>
   gl.clear(gl.COLOR_BUFFER_BIT);
};