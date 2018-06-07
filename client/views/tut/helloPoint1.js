Init = function(param) {
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
        fun: function() {
            xs.finishStep(`load libs`);
            webgl.getShaderSrcs({
                files: [
                    "/assets/shader/webglGuild01.vert",
                    "/assets/shader/webglGuild01.frag"
                ],
                fun: function(shaders){
                    xs.finishStep('get shader');
                    webglMain({ shaders: shaders });
                    xs.finishStep('webgl main');
                }
            });
        }
    });
    function webglMain(param) {
        let { shaders } = param;
        let canvas = parent.getElementsByClassName('webglCanvas')[0];
        let gl = cuon.getWebGLContext(canvas);
        if (gl == null) {
            xs.redAlert('webgl not support!!');
            return;
        }
        xs.successHint('webgl initialized!!');
        if (!cuon.initShaders(gl, shaders.webglGuild01_vert, shaders.webglGuild01_frag)) {
            console.log('Failed to intialize shaders.');
            return;
        }
        xs.scheduleRefreshFrame({fun:render});
        function render() {
            // Set clear color
            canvas.width = canvas.clientWidth;
            canvas.height = canvas.clientHeight;
            gl.clearColor(0.0, 0.0, 0.0, 1.0);
            gl.viewport(0, 0, canvas.clientWidth, canvas.clientHeight);

            // Clear <canvas>
            gl.clear(gl.COLOR_BUFFER_BIT);
            // Draw a point
            gl.drawArrays(gl.POINTS, 0, 1);
        }

    }


};