Init = function(param) {
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
                    //                     console.log(this);
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
                fun: function(shaders){
                    xs.TaskFinish(getShaders,{ shaders: shaders });
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
                xs.TaskFinish(loadImgs,{ imgs: imgs });
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
        let camera = {};
        camera.init = function () {
            this.matrix = new cuon.Matrix4();
            camera.setup = function (eyeX, eyeY, eyeZ, atX, atY, atZ, upX, upY, upZ) {
                this.eyeX=eyeX;
                this.eyeY=eyeY;
                this.eyeZ=eyeZ;

                this.atX=atX;
                this.atY=atY;
                this.atZ=atZ;

                this.upX=upX;
                this.upY=upY;
                this.upZ=upZ;
                

            };
            camera.setup(
                0.20, 0.25, 0.25,
                0, 0, 0,
                0, 1, 0
            );
            this.getMatrix=function(){
                this.matrix.setLookAt(this.eyeX, this.eyeY, this.eyeZ, this.atX, this.atY, this.atZ, this.upX, this.upY, this.upZ);
                return this.matrix;
            }
        };




        let stage = {};
        stage.init = function () {
            canvas.width = canvas.clientWidth;
            canvas.height = canvas.clientHeight;
            gl.viewport(0, 0, canvas.clientWidth, canvas.clientHeight);
            gl.clearColor(0.0, 0.0, 0.0, 1.0);
            this.clear = function () {
                gl.clear(gl.COLOR_BUFFER_BIT);   // Clear <canvas>
            };

            this.useCamera = function (camera) {
               this.camera=camera;
            }

        };



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
                span: 4,
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
                let newAngle = this.angle + (this.rotateSpeed * elapsed) / 1000.0;
                this.angle = newAngle %= 360;
            };
            this.render = function () {
                this.setRotate(this.angle, 0, 0, 1); // Rotation angle, rotation axis (0, 0, 1)
                this.translate(this.x, this.y, this.z);
                gl.uniformMatrix4fv(this.u_ModelMatrix, false, this.modelMatrix.elements);

                gl.drawArrays(gl.TRIANGLE_STRIP, 0, this.pointNum); //POINTS//TRIANGLES//TRIANGLE_STRIP
            };

        };




        let triangles = {};
        triangles.init = function () {
            this.matrix = new cuon.Matrix4();
            this.matrix.setRotate(-10, 0, 0, 1);
            this.u_modelViewMatrix = gl.getUniformLocation(gl.program, 'u_ModelViewMatrix');


            this.vertices = new Float32Array(
                [
                    0.0, 0.5, -0.4, 0.4, 1.0, 0.4,
                    -0.5, -0.5, -0.4, 0.4, 1.0, 0.4,
                    0.5, -0.5, -0.4, 1.0, 0.4, 0.4,

                    0.5, 0.4, -0.2, 1.0, 0.4, 0.4,
                    -0.5, 0.4, -0.2, 1.0, 1.0, 0.4,
                    0.0, -0.6, -0.2, 1.0, 1.0, 0.4,

                    0.0, 0.5, 0.0, 0.4, 0.4, 1.0,
                    -0.5, -0.5, 0.0, 0.4, 0.4, 1.0,
                    0.5, -0.5, 0.0, 1.0, 0.4, 0.4,
                ]
            );
            this.pointNum = 9;
            this.span = this.vertices.length / this.pointNum;
            webgl.createVertexBuffer(gl, {
                buffer: this.vertices,
                span: this.span,
                infos: [
                    {
                        attribute: "a_Position",
                        dataAmount: 3,
                        beginIndex: 0,
                        dataType: gl.FLOAT,
                        normalized: false
                    },
                    {
                        attribute: "a_Color",
                        dataAmount: 3,
                        beginIndex: 3,
                        dataType: gl.FLOAT,
                        normalized: false
                    }
                ]
            });
            this.render = function () {
                let modelViewMatrix = camera.getMatrix().multiply(this.matrix);
                gl.uniformMatrix4fv(this.u_modelViewMatrix, false, modelViewMatrix.elements);
                gl.drawArrays(gl.TRIANGLES, 0, this.pointNum); //POINTS//TRIANGLES//TRIANGLE_STRIP
            };

        };



        animation = {};
        animation.init = function () {

            this.last = Date.now();
            this.update = function (elapsed) {
                //                 rectangle.update(elapsed);
            };
            this.render = function () {
                triangles.render();
                //                 rectangle.render();
            };
            this.loop = function () {
                if (parent.root.animateable == false)
                    return;
                let now = Date.now();
                let elapsed = now - animation.last; // milliseconds
                animation.last = now;

                animation.update(elapsed);

                stage.clear();
                animation.render();
                let id = requestAnimationFrame(animation.loop);
            };
        };





        camera.init();
        triangles.init();
        stage.init();
        stage.useCamera(camera);

        animation.init();
        animation.loop();
    }



};
//rectangle should include shader infomation
//