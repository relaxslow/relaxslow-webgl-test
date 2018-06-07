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
                    "/client/views/tut/coloredPoints/shader.vert",
                    "/client/views/tut/coloredPoints/shader.frag"
                ],
                fun: function(shaders) {
                    xs.finishStep('get shader');
                    init({ shaders: shaders });
                    xs.finishStep('webgl main');
                }
            });
        },

    });
    function init(param) {
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
        let a_Position = gl.getAttribLocation(gl.program, 'a_Position');
        let a_PointSize = gl.getAttribLocation(gl.program, 'a_PointSize');
        let u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');

        canvas.points = [];
        canvas.colors = [];
        canvas.addEventListener('click', function (evt) {
            render(evt, gl, canvas, a_Position, a_PointSize, u_FragColor);

        });
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);
    }
    function render(evt, gl, canvas, a_Position, a_PointSize, u_FragColor) {
        console.log("click!!");
        let mouseX = evt.clientX;
        let mouseY = evt.clientY;
        let rect = evt.currentTarget.getBoundingClientRect();

        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;

        let x = ((mouseX - rect.left) - canvas.width / 2) / (canvas.width / 2);
        let y = (canvas.height / 2 - (mouseY - rect.top)) / (canvas.height / 2);
        canvas.points.push([x, y]);

        if (x >= 0.0 && y >= 0.0) {
            canvas.colors.push([1.0, 0.0, 0.0, 1.0]);
        } else if (x < 0.0 && y < 0.0) {
            canvas.colors.push([0.0, 1.0, 0.0, 1.0]);
        } else {
            canvas.colors.push([0.0, 0.0, 1.0, 1.0]);
        }


        gl.viewport(0, 0, canvas.clientWidth, canvas.clientHeight);

        gl.clear(gl.COLOR_BUFFER_BIT);

        let len = canvas.points.length;
        for (let i = 0; i < len; i ++) {
            let point = canvas.points[i];
            gl.vertexAttrib3f(a_Position, point[0], point[1], 0.0);
            gl.vertexAttrib1f(a_PointSize, 10.0);
            let color = canvas.colors[i];
            gl.uniform4f(u_FragColor, color[0], color[1], color[2], color[3]);
            gl.drawArrays(gl.POINTS, 0, 1);
        }
    }


};