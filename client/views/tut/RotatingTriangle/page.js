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
                    "/client/views/tut/RotatingTriangle/shader.vert",
                    "/client/views/tut/RotatingTriangle/shader.frag"
                ],
                fun: (shaders) => {
                    xs.finishStep('get shader');
                    initWebgl({ shaders: shaders });
                    xs.finishStep('main');
                }
            });
        },

    });
    function initWebgl(param) {
        let { shaders } = param;
        let canvas = parent.getElementsByClassName('webglCanvas')[0];
        var gl = cuon.getWebGLContext(canvas);
        if (gl == null) {
            xs.redAlert('webgl not support!!');
            return;
        }
        xs.successHint('webgl initialized!!');

        xs.scheduleRefreshFrame({ fun: main, data: [gl, canvas, shaders] });
    }
    function main(param) {
        let gl, canvas;
        [gl, canvas, shaders] = param;
        if (!cuon.initShaders(gl, shaders.shader_vert, shaders.shader_frag)) {
            xs.redAlert('Failed to intialize shaders.');
            return;
        }

        var n = initVertexBuffers(gl);
        if (n < 0) {
            xs.redAlert('Failed to set the positions of the vertices');
            return;
        }
        let currentAngle = 0;
        var ANGLE_STEP = 45.0;
        var modelMatrix = new cuon.Matrix4();


        var u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');

        var u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
        gl.uniform4f(u_FragColor, 1.0, 0.0, 0.0, 1.0);

        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
        gl.viewport(0, 0, canvas.clientWidth, canvas.clientHeight);

        let g_last = Date.now();
        function animate(angle) {
            // Calculate the elapsed time
            var now = Date.now();
            var elapsed = now - g_last; // milliseconds
            g_last = now;
            // Update the current rotation angle (adjusted by the elapsed time)
            var newAngle = angle + (ANGLE_STEP * elapsed) / 1000.0;
            return newAngle %= 360;
        }
        var tick = function () {
            if (parent.root.animateable == false)
                return;
            currentAngle = animate(currentAngle);  // Update the rotation angle
            draw(gl, n, currentAngle, modelMatrix, u_ModelMatrix);   // Draw the triangle
            let id=requestAnimationFrame(tick, canvas); // Request that the browser calls tick
            // console.log(id);
            
        };
        tick();


    }
    function draw(gl, n, currentAngle, modelMatrix, u_ModelMatrix) {
        // Set the rotation matrix
        modelMatrix.setRotate(currentAngle, 0, 0, 1); // Rotation angle, rotation axis (0, 0, 1)
        modelMatrix.translate(0.35, 0, 0);
        // Pass the rotation matrix to the vertex shader
        gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);

        // Clear <canvas>
        gl.clear(gl.COLOR_BUFFER_BIT);

        // Draw the rectangle
        gl.drawArrays(gl.TRIANGLES, 0, n);
    }

    function initVertexBuffers(gl) {
        var vertices = new Float32Array([
            0.0, 0.3, -0.3, -0.3, 0.3, -0.3
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