Init = (param) => {
    //multiTexture
    let { parent, data, currentfile } = param;

    let loadLib = new xs.Task({
        msg: "loadLib",
        fun: function (param) {
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
                    console.log(this);
                    loadLib.taskFinish();
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
                fun: (shaders) => {
                    getShaders.taskFinish({ shaders: shaders });
                }
            });
        }
    });

    let loadImgs = new xs.Task({
        msg: 'load imgs',
        preTasks: [loadLib],
        fun: function (param) {
            webgl.loadImgs([
                '/assets/img/circle.png',
                '/assets/img/sky.jpg',
            ], function (imgs) {
                loadImgs.taskFinish({ imgs: imgs });
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
            initWebgl.taskFinish();
        }
    });


    function main(param) {
        let [gl, canvas, shaders, imgs] = param;
        if (!cuon.initShaders(gl, shaders.shader_vert, shaders.shader_frag)) {
            xs.redAlert(`Failed to intialize shaders.`);
            return;
        }
        let stage = {};
        stage.init = function () {
            canvas.width = canvas.clientWidth;
            canvas.height = canvas.clientHeight;
            gl.viewport(0, 0, canvas.clientWidth, canvas.clientHeight);
            gl.clearColor(0.0, 0.0, 0.0, 1.0);
            this.clear = function () {
                gl.clear(gl.COLOR_BUFFER_BIT);   // Clear <canvas>
            };
        };
        stage.init();


        let rectangle = {};


        rectangle.init = function () {
            this.verticesTexCoords = new Float32Array([
                -0.5, 0.5, 0.0, 1.0,
                -0.5, -0.5, 0.0, 0.0,
                0.5, 0.5, 1.0, 1.0,
                0.5, -0.5, 1.0, 0.0,
            ]);
            this.pointNum = 4;
            webgl.createVertexBuffer(gl, {
                buffer: this.verticesTexCoords,
                span: this.pointNum,
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
            webgl.createTexture(gl, 0, imgs.sky_jpg, {
                "TEXTURE_MIN_FILTER": "NEAREST",
                "TEXTURE_WRAP_S": "CLAMP_TO_EDGE"
            });
            webgl.createTexture(gl, 1, imgs.circle_png, {
                "TEXTURE_MIN_FILTER": "NEAREST",
                "TEXTURE_WRAP_S": "CLAMP_TO_EDGE"
            });
            webgl.connectTextureToShader(gl, 0, 'u_Sampler0');
            webgl.connectTextureToShader(gl, 1, 'u_Sampler1');
            this.u_ModelMatrix = webgl.getModelMatrixInShader(gl);

            this.angle = 0;
            this.rotateSpeed = 45; // per second
            this.modelMatrix = new cuon.Matrix4();
            this.x = 0.3;
            this.y = 0.0;
            this.z = 0;

            this.rotate = function (angle, axisX, axisY, axisZ) {
                this.modelMatrix.rotate(angle, axisX, axisY, axisZ);
            };
            this.setRotate = function (angle, axisX, axisY, axisZ) {
                this.modelMatrix.setRotate(angle, axisX, axisY, axisZ);
            };
            this.translate = function (X, Y, Z) {
                this.modelMatrix.translate(X, Y, Z);
            };



            this.update = function (elapsed) {
                var newAngle = this.angle + (this.rotateSpeed * elapsed) / 1000.0;
                this.angle = newAngle %= 360;
            };
            this.render = function () {
                this.setRotate(this.angle, 0, 0, 1); // Rotation angle, rotation axis (0, 0, 1)
                this.translate(this.x, this.y, this.z);
                gl.uniformMatrix4fv(this.u_ModelMatrix, false, this.modelMatrix.elements);

                gl.drawArrays(gl.TRIANGLE_STRIP, 0, this.pointNum); //POINTS//TRIANGLES//TRIANGLE_STRIP
            };

        };


        rectangle.init();


        let animationLoop = function () {
            if (parent.root.animateable == false)
                return;
            let now = Date.now();
            let elapsed = now - last; // milliseconds
            last = now;
            rectangle.update(elapsed);


            stage.clear();
            rectangle.render();
            let id = requestAnimationFrame(animationLoop);
            return;
        };

        let last = Date.now();
        animationLoop();

    }



};
//rectangle should include shader infomation