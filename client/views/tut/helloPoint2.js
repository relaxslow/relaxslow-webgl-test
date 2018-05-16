Init = (param) => {
    let { parent, data } = param;
    xs.addStep('load lib/get shader/webgl main', 3);

    xs.addLibs({
        parent: parent,
        files: [
            '/client/lib/webgl',
            '/client/lib/guild/cuon-utils',
            '/client/lib/guild/webgl-utils',
            '/client/lib/guild/webgl-debug',
        ],
        fun: () => {
            xs.finishStep('load libs');
            webgl.getShaderSrcs({
                files: [
                    "/assets/shader/helloPoint2.vert",
                    "/assets/shader/webglGuild01.frag"
                ],
                fun: (shaders) => {
                    xs.finishStep('get shader');
                    webglMain({ shaders: shaders });
                    xs.finishStep('webgl main');
                }
            });
        },

    });
    function webglMain(param) {
        let { shaders } = param;
        let canvas = parent.getElementsByClassName('webglCanvas')[0];
        var gl = cuon.getWebGLContext(canvas);
        if (gl == null) {
            xs.redAlert('webgl not support!!');
            return;
        }
        xs.successHint('webgl initialized!!');
        if (!cuon.initShaders(gl, shaders.helloPoint2_vert, shaders.webglGuild01_frag)) {
            xs.redAlert('Failed to intialize shaders.');
            return;
        }
        var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
        var a_PointSize = gl.getAttribLocation(gl.program, 'a_PointSize');

        xs.scheduleRefreshFrame({fun:render});
        function render() {
            canvas.width = canvas.clientWidth;
            canvas.height = canvas.clientHeight;

            gl.vertexAttrib3f(a_Position, 0.0, 0.0, 0.0);
            gl.vertexAttrib1f(a_PointSize, 10.0);

            // Set clear color
            gl.clearColor(0.0, 0.0, 0.0, 1.0);
            gl.viewport(0, 0, canvas.clientWidth, canvas.clientHeight);
            // Clear <canvas>
            gl.clear(gl.COLOR_BUFFER_BIT);
            // Draw a point
            gl.drawArrays(gl.POINTS, 0, 1);
        }

    }


};