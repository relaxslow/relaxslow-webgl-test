//rotatedTriangle_matrix4
Init = (param) => {

    let { parent, data, currentfile } = param;
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
                    `/client/views/tut/${data.folder}/shader.vert`,
                    `/client/views/tut/${data.folder}/shader.frag`
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
        gl.drawArrays(gl.POINTS, 0, n);
    }
    // function checkBuffers(buffers) {
    //     for (let key in buffers) {
    //         const buffer = buffers[key];
    //         if (buffer == null) {
    //             xs.redAlert(`Failed to create the buffer object:${key}`);
    //             return -1;
    //         }
    //     }
    //     for (let i = 0; i < buffers.length; i++) {
    //         const buffer = buffers[i];

    //     }
    // }
    function connectDataAndShaderAttribute(gl,dataArr, attStr, p) {
        let buffer = gl.createBuffer();
        if (buffer == null) {
            xs.redAlert(`Failed to create the buffer object:${key}`);
            return;
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, dataArr, gl.STATIC_DRAW);

        var attribute = gl.getAttribLocation(gl.program, attStr);
        if (attribute < 0) {
            xs.redAlert(`Failed to get the storage location of ${attStr}`);
            return;
        }
        if (p == undefined) p = {};
        if (p.numPerVertex == undefined) { p.numPerVertex = 2; }
        if (p.dataType == undefined) { p.dataType = gl.FLOAT; }
        if (p.normalized == undefined) { p.normalized = false; }
        if (p.stride == undefined) { p.stride = 0; }
        if (p.offset == undefined) { p.offset = 0; }
        gl.vertexAttribPointer(attribute, p.numPerVertex, p.dataType, p.normalized, p.stride, p.offset);

        gl.enableVertexAttribArray(attribute);

    }
    function initVertexBuffers(gl) {
        var vertices = new Float32Array([
            0.0, 0.3, -0.3, -0.3, 0.3, -0.3
        ]);
        let sizes = new Float32Array([10.0, 20.0, 30.0]);
        var n = vertices.length / 2; // The number of vertices

        // Create a buffer object
        

        connectDataAndShaderAttribute(gl,vertices, 'a_Position', { numPerVertex: 2 });
        connectDataAndShaderAttribute(gl,sizes, 'a_PointSize', { numPerVertex: 1 });

        
        return n;
    }



};