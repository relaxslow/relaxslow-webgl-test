Init = function(param) {
    let { parent, data } = param;
    xs.addStep('load lib/get shader/webgl main', 3);
    xs.addLib({
        parent: parent,
        file: '/client/lib/webgl',
        okfun: function(libName)  {
            xs.finishStep(`load lib ${libName}`);
            webgl.getShaderSrcs({
                files: [
                    "/assets/shader/first.vert",
                    "/assets/shader/first.frag"
                ],
                fun: function(shaders){
                    xs.finishStep('get shader');
                    webglMain({ shaders: shaders });
                    xs.finishStep('webgl main');
                }
            });
        },
        failfun: function() {
            xs.finishStep('load lib');
            xs.finishStep('get shader');
            xs.finishStep('webgl main');
        }
    });

    function webglMain(param) {
        let { shaders } = param;
        let canvas = parent.getElementsByClassName('webglCanvas')[0];
        let gl = canvas.getContext("webgl2");
        if (gl == null) {
            console.log('%c webgl not support!!', 'background: #222; color: #ff0000');
            return;
        }
        console.log('%c webgl initialized!!', 'background: #222; color: #bada55');
        // console.log(shaderSrcs);
        let vertexShader = webgl.createShader(gl, gl.VERTEX_SHADER, shaders.first_vert);
        let fragmentShader = webgl.createShader(gl, gl.FRAGMENT_SHADER, shaders.first_frag);
        let program = webgl.createProgram2(gl, vertexShader, fragmentShader);

        let positionAttributeLocation = gl.getAttribLocation(program, "a_position");
        let positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);//bind Array Buffer
        // three 2d points
        let positions = [
            0, 0,
            0, 0.5,
            0.7, 0,
        ];
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

        let vao = gl.createVertexArray();//use to define how to get data from Array Buffer
        gl.bindVertexArray(vao); //bind Vertex Array
        gl.enableVertexAttribArray(positionAttributeLocation);//tell webgl we want get data out of buffer
        let size = 2;          // 2 components per iteration
        let type = gl.FLOAT;   // the data is 32bit floats
        let normalize = false; // don't normalize the data
        let stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
        let offset = 0;        // start at the beginning of the buffer
        gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);//bind current array buffer to attribute

        xs.scheduleRefreshFrame({fun:renderScene});
        function renderScene() {
            webgl.resize(canvas);
            gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
            // Clear the canvas
            gl.clearColor(0, 0, 0, 0);
            gl.clear(gl.COLOR_BUFFER_BIT);
            // Tell it to use our program (pair of shaders)
            gl.useProgram(program);
            gl.bindVertexArray(vao);
            let primitiveType = gl.TRIANGLES;
            let drawoffset = 0;
            let count = 3;
            gl.drawArrays(primitiveType, drawoffset, count);
        }

    }

};