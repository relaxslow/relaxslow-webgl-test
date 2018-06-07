//texture quad
Init = function (param) {

    let { parent, data, currentfile } = param;

    let loadLib = new xs.Task({
        msg: "loadLib",
        fun: function () {
            xs.addLibs({
                parent: parent,
                files: [
                    '/client/lib/webgl',
                    '/client/lib/guild/cuon-utils',
                    '/client/lib/guild/webgl-utils',
                    '/client/lib/guild/webgl-debug',
                    '/client/lib/guild/cuon-matrix',
                ],
                fun: function () {
                    xs.TaskFinish(loadLib);
                }
            });
        }
    });
    let getShaders = new xs.Task({
        msg: "get Shader",
        preTasks: [loadLib],
        fun: function (param) {
            webgl.getShaderSrcs({
                files: [
                    `/client/views/tut/${data.folder}/shader.vert`,
                    `/client/views/tut/${data.folder}/shader.frag`
                ],
                fun: function (shaders) {
                    xs.TaskFinish(getShaders, { shaders: shaders });
                }
            });
        }
    });

    let loadImgs = new xs.Task({
        msg: 'load imgs',
        preTasks: [loadLib],
        fun: function (param) {
            webgl.loadImgs([
                '/assets/img/grass.jpg',
                '/assets/img/smile.jpg',
                '/assets/img/leaves.png',
                '/assets/img/sky.jpg',
            ], function (imgs) {
                xs.TaskFinish(loadImgs, { imgs: imgs });
            });
        }
    });
    let initWebgl = new xs.Task({
        msg: 'init Webgl', preTasks: [getShaders, loadImgs], fun: function (param) {
            let { shaders, imgs } = param;
            let canvas = parent.getElementsByClassName('webglCanvas')[0];
            let gl = cuon.getWebGLContext(canvas);
            if (gl == null) {
                xs.redAlert(`webgl not support!!`);
                return;
            }
            xs.successHint('webgl initialized!!');
            xs.scheduleRefreshFrame({ fun: main, data: [gl, canvas, shaders, imgs] });
            xs.TaskFinish(initWebgl);
        }
    });


    function main(param) {
        let [gl, canvas, shaders, imgs] = param;
        if (!cuon.initShaders(gl, shaders.shader_vert, shaders.shader_frag)) {
            xs.redAlert(`Failed to intialize shaders.`);
            return;
        }
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
        gl.viewport(0, 0, canvas.clientWidth, canvas.clientHeight);

        // Set vertex information
        let verticesTexCoords = new Float32Array([
            -0.5, 0.5, -0.3, 1.7,
            -0.5, -0.5, -0.3, -0.2,
            0.5, 0.5, 1.7, 1.7,
            0.5, -0.5, 1.7, -0.2
        ]);
        let n = 4;
        webgl.createVertexBuffer(gl, {
            buffer: verticesTexCoords,
            span: n,
            infos: [
                {
                    attribute: "a_Position",
                    dataAmount: 2,
                    beginIndex: 0,
                    dataType: gl.FLOAT,
                    normalized: false
                },
                {
                    attribute: "a_TexCoord",
                    dataAmount: 2,
                    beginIndex: 2,
                    dataType: gl.FLOAT,
                    normalized: false
                }
            ]
        });


        // Set texture
        webgl.createTexture(gl, 0, imgs.sky_jpg, {
            "TEXTURE_MIN_FILTER": "NEAREST",
            "TEXTURE_WRAP_S": "CLAMP_TO_EDGE"
        });
        webgl.connectTextureToShader(gl, 0, 'u_Sampler');
        //background color
        gl.clearColor(0.0, 0.0, 0.0, 1.0);

        //draw
        gl.clear(gl.COLOR_BUFFER_BIT);   // Clear <canvas>

        gl.drawArrays(gl.TRIANGLE_STRIP, 0, n); //POINTS//TRIANGLES//TRIANGLE_STRIP
    }


};