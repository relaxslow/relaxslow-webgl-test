//helloTriangle
Init = (param) => {
    let { parent, data } = param;
    xs.addStep('load lib|get shader|webgl main', 3);

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
                    "/client/views/tut/helloTriangle/shader.vert",
                    "/client/views/tut/helloTriangle/shader.frag"
                ],
                fun: (shaders) => {
                    xs.finishStep('get shader');
                    main({ shaders: shaders });
                    xs.finishStep('main');
                }
            });
        },

    });
    function main(param) {
        let { shaders } = param;
        let canvas = parent.getElementsByClassName('webglCanvas')[0];
        var gl = cuon.getWebGLContext(canvas);
        if (gl == null) {
            xs.redAlert('webgl not support!!');
            return;
        }
        xs.successHint('webgl initialized!!');
        if (!cuon.initShaders(gl, shaders.shader_vert, shaders.shader_frag)) {
            xs.redAlert('Failed to intialize shaders.');
            return;
        }

        var n = initVertexBuffers(gl);
        if (n < 0) {
            console.log('Failed to set the positions of the vertices');
            return;
        }

        var u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
        gl.uniform4f(u_FragColor, 1.0, 0.0, 0.0, 1.0);

        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        xs.scheduleRefreshFrame({ fun: render, data: [gl, canvas, n] });
    }
    function render(param) {
        let gl, canvas, n;
        [gl, canvas, n] = param;

        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
        gl.viewport(0, 0, canvas.clientWidth, canvas.clientHeight);
        // Clear <canvas>
        gl.clear(gl.COLOR_BUFFER_BIT);

        // Draw three points
        gl.drawArrays(gl.TRIANGLE_FAN, 0, n);
    }
    function initVertexBuffers(gl) {
        var vertices = new Float32Array([
            0.0, 0.5, -0.5, -0.5, 0.5, -0.5
        ]);
        let quadVertices = new Float32Array([
            -0.5, 0.5,
            -0.5, -0.5,
            0.5, 0.5,
            0.5, -0.5,
        ]);
        var n = quadVertices.length/2; // The number of vertices

        // Create a buffer object
        var vertexBuffer = gl.createBuffer();
        if (!vertexBuffer) {
            console.log('Failed to create the buffer object');
            return -1;
        }

        // Bind the buffer object to target
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        // Write date into the buffer object
        gl.bufferData(gl.ARRAY_BUFFER, quadVertices, gl.STATIC_DRAW);

        var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
        if (a_Position < 0) {
            console.log('Failed to get the storage location of a_Position');
            return -1;
        }
        // Assign the buffer object to a_Position variable
        gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);

        // Enable the assignment to a_Position variable
        gl.enableVertexAttribArray(a_Position);

        return n;
    }



};