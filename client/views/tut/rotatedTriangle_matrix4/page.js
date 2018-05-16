//rotatedTriangle_matrix4
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
            '/client/lib/guild/cuon-matrix',

        ],
        fun: () => {
            xs.finishStep('load libs');
            webgl.getShaderSrcs({
                files: [
                    "/client/views/tut/rotatedTriangle_matrix4/shader.vert",
                    "/client/views/tut/rotatedTriangle_matrix4/shader.frag"
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
        let angle = 90;
        let radian = Math.PI * angle / 180;
        let cosB = Math.cos(radian),
            sinB = Math.sin(radian);
        let Tx = 0.5, Ty = 0.5, Tz = 0;
        let Sx = 1.0, Sy = 1.5, Sz = 1.0;
        //----------------------------------------------------------------
        var xformMatrix = new cuon.Matrix4();
        xformMatrix.setScale(1, 1.5, 1);
        xformMatrix.rotate(90, 0, 0, 1);
        // xformMatrix.translate(0.5, 0.5, 0.0);

        //----------------------------------------------------------------
        var u_xformMatrix = gl.getUniformLocation(gl.program, 'u_xformMatrix');
        gl.uniformMatrix4fv(u_xformMatrix, false, xformMatrix.elements);

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

        var n = vertices.length / 2; // The number of vertices

        // Create a buffer object
        var vertexBuffer = gl.createBuffer();
        if (!vertexBuffer) {
            console.log('Failed to create the buffer object');
            return -1;
        }

        // Bind the buffer object to target
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        // Write date into the buffer object
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

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