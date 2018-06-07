//multi point
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
            xs.finishStep('load libs');
            webgl.getShaderSrcs({
                files: [
                    "/client/views/tut/multiPoint/shader.vert",
                    "/client/views/tut/multiPoint/shader.frag"
                ],
                fun: function(shaders){
                    xs.finishStep('get shader');
                    main({ shaders: shaders });
                    xs.finishStep('webgl main');
                }
            });
        },

    });
    function main(param) {
        let { shaders } = param;
        let canvas = parent.getElementsByClassName('webglCanvas')[0];
        let gl = cuon.getWebGLContext(canvas);
        if (gl == null) {
            xs.redAlert('webgl not support!!');
            return;
        }
        xs.successHint('webgl initialized!!');
        if (!cuon.initShaders(gl, shaders.shader_vert, shaders.shader_frag)) {
            xs.redAlert('Failed to intialize shaders.');
            return;
        }

        let n = initVertexBuffers(gl);
        if (n < 0) {
            console.log('Failed to set the positions of the vertices');
            return;
        }
        let a_PointSize = gl.getAttribLocation(gl.program, 'a_PointSize');
        gl.vertexAttrib1f(a_PointSize, 20.0);
        let u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
        gl.uniform4f(u_FragColor, 1.0, 0.0, 0.0, 1.0);

        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        xs.scheduleRefreshFrame({ fun: render, data: [gl, canvas, n] });
    }
    function render(param) {
        let gl,canvas,n;
        [gl,canvas,n]=param;

        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
        gl.viewport(0, 0, canvas.clientWidth, canvas.clientHeight);
        // Clear <canvas>
        gl.clear(gl.COLOR_BUFFER_BIT);

        // Draw three points
        gl.drawArrays(gl.POINTS, 1, 2);
    }
    function initVertexBuffers(gl) {
        let vertices = new Float32Array([
            0.0, 0.5, -0.5, -0.5, 0.5, -0.5
        ]);
        let n = 3; // The number of vertices

        // Create a buffer object
        let vertexBuffer = gl.createBuffer();
        if (!vertexBuffer) {
            console.log('Failed to create the buffer object');
            return -1;
        }

        // Bind the buffer object to target
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        // Write date into the buffer object
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

        let a_Position = gl.getAttribLocation(gl.program, 'a_Position');
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