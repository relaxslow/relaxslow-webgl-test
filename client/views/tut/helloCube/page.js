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
                    loadLib.taskFinish();
                }
            });
        }
    });
    let initWebgl = new xs.Task({
        msg: 'init Webgl', preTasks: [loadLib], fun: function (param) {
            let canvas = parent.getElementsByClassName('webglCanvas')[0];
            let gl = cuon.getWebGLContext(canvas);
            if (gl == null) {
                xs.redAlert(`webgl not support!!`);
                return;
            }
            xs.successHint('webgl initialized!!');
            initWebgl.taskFinish({ gl: gl, canvas: canvas });
        }
    });
    let loadPrograms = new xs.Task({
        msg: 'load all shader programs',
        preTasks: [initWebgl],
        fun: function (param) {
            let { gl, canvas } = param;
            webgl.loadPrograms({
                gl: gl,
                files: [
                    `/client/views/tut/${data.folder}/indicator`,
                    `/client/views/tut/${data.folder}/treeLine`,
                    `/client/views/tut/${data.folder}/cube`,
                ],
                fun: function (programs) {
                    loadPrograms.taskFinish({ programs: programs });
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

    let scheduleStart = new xs.Task({
        msg: 'webglMain',
        preTasks: [loadImgs, loadPrograms, initWebgl],
        fun: function (param) {

            xs.scheduleRefreshFrame({ fun: main, data: param });
            scheduleStart.taskFinish();
        }
    });

    function main(param) {
        let { gl, canvas, programs, imgs } = param;

        let camera = {};
        camera.init = function () {
            this.name = 'camera';
            this.matrix = new cuon.Matrix4();
            this.pMatrix = new cuon.Matrix4();
            this.vMatrix = new cuon.Matrix4();
            this.setLookAt = function (eyeX, eyeY, eyeZ, atX, atY, atZ, upX, upY, upZ) {
                this.eyeX = eyeX;
                this.eyeY = eyeY;
                this.eyeZ = eyeZ;

                this.atX = atX;
                this.atY = atY;
                this.atZ = atZ;

                this.upX = upX;
                this.upY = upY;
                this.upZ = upZ;
                this.buildVMatrix();

            };
            this.buildVMatrix = function () {
                this.vMatrix.setLookAt(this.eyeX, this.eyeY, this.eyeZ, this.atX, this.atY, this.atZ, this.upX, this.upY, this.upZ);
                this.matrix.set(this.pMatrix).multiply(this.vMatrix);
            };

            this.setOrtho = function (left, right, bottom, top, near, far) {
                this.left = left;
                this.right = right;
                this.bottom = bottom;
                this.top = top;
                this.near = near;
                this.far = far;
                this.buildOrthoPMatrix();
            };

            this.setPerspective = function (fov, aspect, near, far) {
                this.fov = fov;
                this.aspect = aspect;
                this.near = near;
                this.far = far;
                this.buildPerspectivePMatrix();
            };

            this.buildOrthoPMatrix = function () {
                this.pMatrix.setOrtho(this.left, this.right, this.bottom, this.top, this.near, this.far);
                this.matrix.set(this.pMatrix).multiply(this.vMatrix);
            }
            this.buildPerspectivePMatrix = function () {
                this.pMatrix.setPerspective(this.fov, this.aspect, this.near, this.far);
                this.matrix.set(this.pMatrix).multiply(this.vMatrix);
            };
            // camera.setOrtho(
            //     -1, 1,
            //     -1, 1,
            //     0, 0.5
            // );

            camera.setLookAt(
                0, 0, 5,
                0, 0, 0,
                0, 1, 0
            );
            // 0, 0, 5, 0, 0, -100, 0, 1, 0);
            camera.setPerspective(30, canvas.width / canvas.height, 1, 100);
        };




        let stage = {};

        stage.init = function () {
            this.name = 'stage';
            canvas.width = canvas.clientWidth;
            canvas.height = canvas.clientHeight;
            gl.viewport(0, 0, canvas.clientWidth, canvas.clientHeight);
            gl.clearColor(0.0, 0.0, 0.0, 1.0);
            gl.enable(gl.DEPTH_TEST);
            this.clear = function () {
                gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);   // Clear <canvas>
                gl.enable(gl.POLYGON_OFFSET_FILL);
                //                 gl.enable(gl.POLYGON_OFFSET_LINE);



            };

            this.useCamera = function (camera) {
                this.camera = camera;
                this.camera.init();
            };


            this.objs = [];
            this.addChild = function (obj) {
                this.objs.push(obj);

                obj.init();
                webgl.initParts(obj.parts);

            };
            this.mvpMatrix = new cuon.Matrix4();
            this.mvpGeneralFun = function (gl, part) {
                stage.mvpMatrix.set(stage.camera.matrix).multiply(part.matrix);
                gl.uniformMatrix4fv(part.uniforms.MVP.location, false, stage.mvpMatrix.elements);
            }

            this.render = function (elapsed) {
                for (let i = 0; i < stage.objs.length; i++) {
                    const obj = stage.objs[i];
                    if (obj.ontop == true)
                        gl.clear(gl.DEPTH_BUFFER_BIT);
                    for (let j = 0; j < obj.parts.length; j++) {
                        const part = obj.parts[j];
                        gl.useProgram(part.program);
                        webgl.connectAttributes(gl, part);
                        webgl.connectIndice(gl, part);
                        if (part.update != undefined) part.update(elapsed);

                        webgl.connectUniforms(gl, part);

                        if (part.material != undefined) part.material();

                        if (part.polygonOffset != undefined) {
                            gl.polygonOffset(part.polygonOffset.factor, part.polygonOffset.unit); // Set the polygon offset
                            webgl.drawPart(gl, part);
                            gl.polygonOffset(1, 100);
                        }
                        else {

                            webgl.drawPart(gl, part);
                        }

                    }

                }
            };


        };

        let box = {};
        box.init = function () {
            this.name = 'box';
            var vertices = new Float32Array([
                // Vertex coordinates and color
                1.0, 1.0, 1.0, 1.0, 1.0, 1.0,  // v0 White
                -1.0, 1.0, 1.0, 1.0, 0.0, 1.0,  // v1 Magenta
                -1.0, -1.0, 1.0, 1.0, 0.0, 0.0,  // v2 Red
                1.0, -1.0, 1.0, 1.0, 1.0, 0.0,  // v3 Yellow
                1.0, -1.0, -1.0, 0.0, 1.0, 0.0,  // v4 Green
                1.0, 1.0, -1.0, 0.0, 1.0, 1.0,  // v5 Cyan
                -1.0, 1.0, -1.0, 0.0, 0.0, 1.0,  // v6 Blue
                -1.0, -1.0, -1.0, 0.0, 0.0, 0.0   // v7 Black
            ]);


            var indices = new Uint8Array([
                0, 1, 2, 0, 2, 3,    // front
                0, 3, 4, 0, 4, 5,    // right
                0, 5, 6, 0, 6, 1,    // up
                1, 6, 7, 1, 7, 2,    // left
                7, 4, 3, 7, 3, 2,    // down
                4, 7, 6, 4, 6, 5     // back
            ]);
            let vertexBuffer = webgl.createVertexBuf(gl, {
                name: "box vertex position|color ",
                verticeData: vertices,
                pointNum: 8,

            });
            let indiceBuffer = webgl.createIndiceBuf(gl, {
                name: 'box',
                indiceData: indices
            });

            var verticesPos = new Float32Array([   // Vertex coordinates
                0.3, 0.3, 0.3, -0.3, 0.3, 0.3, -0.3, -0.3, 0.3, 0.3, -0.3, 0.3,  // v0-v1-v2-v3 front
                0.3, 0.3, 0.3, 0.3, -0.3, 0.3, 0.3, -0.3, -0.3, 0.3, 0.3, -0.3,  // v0-v3-v4-v5 right
                0.3, 0.3, 0.3, 0.3, 0.3, -0.3, -0.3, 0.3, -0.3, -0.3, 0.3, 0.3,  // v0-v5-v6-v1 up
                -0.3, 0.3, 0.3, -0.3, 0.3, -0.3, -0.3, -0.3, -0.3, -0.3, -0.3, 0.3,  // v1-v6-v7-v2 left
                -0.3, -0.3, -0.3, 0.3, -0.3, -0.3, 0.3, -0.3, 0.3, -0.3, -0.3, 0.3,  // v7-v4-v3-v2 down
                0.3, -0.3, -0.3, -0.3, -0.3, -0.3, -0.3, 0.3, -0.3, 0.3, 0.3, -0.3   // v4-v7-v6-v5 back
            ]);
            var verticesColors = new Float32Array([     // Colors
                0.4, 0.4, 1.0, 0.4, 0.4, 1.0, 0.4, 0.4, 1.0, 0.4, 0.4, 1.0,  // v0-v1-v2-v3 front(blue)
                0.4, 1.0, 0.4, 0.4, 1.0, 0.4, 0.4, 1.0, 0.4, 0.4, 1.0, 0.4,  // v0-v3-v4-v5 right(green)
                1.0, 0.4, 0.4, 1.0, 0.4, 0.4, 1.0, 0.4, 0.4, 1.0, 0.4, 0.4,  // v0-v5-v6-v1 up(red)
                1.0, 1.0, 0.4, 1.0, 1.0, 0.4, 1.0, 1.0, 0.4, 1.0, 1.0, 0.4,  // v1-v6-v7-v2 left
                1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0,  // v7-v4-v3-v2 down
                0.4, 1.0, 1.0, 0.4, 1.0, 1.0, 0.4, 1.0, 1.0, 0.4, 1.0, 1.0   // v4-v7-v6-v5 back
            ]);
            var seperateIndices = new Uint8Array([       // Indices of the vertices
                0, 1, 2, 0, 2, 3,    // front
                4, 5, 6, 4, 6, 7,    // right
                8, 9, 10, 8, 10, 11,    // up
                12, 13, 14, 12, 14, 15,    // left
                16, 17, 18, 16, 18, 19,    // down
                20, 21, 22, 20, 22, 23     // back
            ]);




            let vertexPosBuffer = webgl.createVertexBuf(gl, {
                name: "box vertex position ",
                verticeData: verticesPos,
                pointNum: 24,

            });
            let vertexColorBuffer = webgl.createVertexBuf(gl, {
                name: "box vertex color ",
                verticeData: verticesColors,
                pointNum: 24,

            });
            let seperateIndiceBuffer = webgl.createIndiceBuf(gl, {
                name: 'box',
                indiceData: seperateIndices
            });

            this.parts = webgl.setPart(gl,
                [
                    // /client/views/tut/${data.folder}/cube
                    {
                        program: programs["client-views-tut-helloCube-cube"],
                        primitiveType: gl.TRIANGLES,
                        uniforms: {
                            MVP: {
                                name: "u_MVPMatrix",
                                fun: stage.mvpGeneralFun
                            }
                        },
                        attributes: [
                            {
                                name: "a_Position",
                                dataAmount: 3,
                                beginIndex: 0,
                                buffer: vertexPosBuffer,
                            },
                            {
                                name: "a_Color",
                                dataAmount: 3,
                                beginIndex: 0,
                                buffer: vertexColorBuffer,
                            }
                        ],
                        indice: seperateIndiceBuffer

                    }
                ]);
        };

        let rectangle = {};
        rectangle.init = function () {
            this.name = 'rectangle';
            vertices = new Float32Array([
                -0.5, 0.5, 0.0, 1.0,
                -0.5, -0.5, 0.0, 0.0,
                0.5, 0.5, 1.0, 1.0,
                0.5, -0.5, 1.0, 0.0,
            ]);

            let vertexBuffer = webgl.createVertexBuf(gl, {
                name: this.name,
                verticeData: vertices,
                pointNum: 4,

            });



            this.textures = {//init
                "sky": webgl.createTextureBuffer(gl, 0, imgs.sky_jpg, {
                    "TEXTURE_MIN_FILTER": "NEAREST",
                    "TEXTURE_WRAP_S": "CLAMP_TO_EDGE"
                }),
                "circle": webgl.createTextureBuffer(gl, 1, imgs.circle_png, {
                    "TEXTURE_MIN_FILTER": "NEAREST",
                    "TEXTURE_WRAP_S": "CLAMP_TO_EDGE"
                })
            };


            this.parts = webgl.setPart(gl, [
                {
                    program: programs.rectangle,
                    primitiveType: gl.TRIANGLE_STRIP,
                    uniforms: {
                        MVP: {
                            name: "u_MVPMatrix",
                            fun: stage.mvpGeneralFun
                        },
                    },
                    attributes: [
                        {
                            name: "a_Position",
                            dataAmount: 2,
                            beginIndex: 0,
                            buffer: vertexBuffer,
                        },

                        {
                            name: "a_TexCoord",
                            dataAmount: 2,
                            beginIndex: 2,
                            buffer: vertexBuffer,
                        }

                    ],
                    x: 0.3,
                    y: 0,
                    z: 0,
                    angle: 0,
                    rotateSpeed: 45,
                    axisX: 0,
                    axisY: 0,
                    axisZ: 1,
                    polygonOffset: { factor: 1, unit: 0.1 },
                    update: function (elapsed) {//update
                        var newAngle = this.angle + (this.rotateSpeed * elapsed) / 1000.0;
                        this.angle = newAngle %= 360;
                        this.matrix.setRotate(this.angle, this.axisX, this.axisY, this.axisZ);
                        this.matrix.translate(this.x, this.y, this.z);

                    },
                    material: function () {
                        webgl.changeChannelTexture2D(gl, 0, rectangle.textures.sky);
                        webgl.changeChannelTexture2D(gl, 1, rectangle.textures.circle);

                        webgl.connectTextureToShader2(gl, 0, this.program, 'u_Sampler0');
                        webgl.connectTextureToShader2(gl, 1, this.program, 'u_Sampler1');
                    }
                },

            ]);


        };





        let triangles = {};
        triangles.init = function () {
            this.name = 'triangles';
            vertices = new Float32Array(
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
            let vertexBuffer = webgl.createVertexBuf(gl, {
                name: this.name,
                verticeData: vertices,
                pointNum: 9,

            });
            this.parts = webgl.setPart(gl, [
                {
                    program: programs.triangles,
                    primitiveType: gl.TRIANGLES,
                    uniforms: {
                        MVP: {
                            name: "u_MVPMatrix",
                            fun: stage.mvpGeneralFun
                        },
                    },
                    attributes: [
                        {
                            name: "a_Position",
                            dataAmount: 3,
                            beginIndex: 0,
                            buffer: vertexBuffer,
                        },
                        {
                            name: "a_Color",
                            dataAmount: 3,
                            beginIndex: 3,
                            buffer: vertexBuffer,
                        },

                    ],
                    init: function () {
                        this.matrix.setRotate(10, 0, 0, 1);
                    },
                    polygonOffset: { factor: 0.5, unit: 0.1 },



                }
            ]);


        };
        let treeLines = {};
        treeLines.init = function () {
            this.name = 'treelines';
            vertices = new Float32Array(
                [
                    0, 1, 0, 0.4, 1, 0.4, 0,// The back green one
                    -0.5, -1, 0, 0.4, 1, 0.4, 1,
                    0.5, -1, 0, 1, 0.4, 0.4, 2,

                ]
            );

            let vertexBuffer = webgl.createVertexBuf(gl, {
                name: this.name,
                verticeData: vertices,
                pointNum: 3,

            });

            let infos = [
                { x: 0.75, y: 0, z: 0, r: 0.4, g: 1.0, b: 0.4 },
                { x: -0.75, y: 0, z: 0, r: 0.4, g: 1.0, b: 0.4 },

                { x: 0.75, y: 0, z: -2, r: 1.0, g: 1.0, b: 0.4 },
                { x: -0.75, y: 0, z: -2, r: 1.0, g: 1.0, b: 0.4 },

                { x: 0.75, y: 0, z: -4, r: 0.4, g: 0.4, b: 1.0 },
                { x: -0.75, y: 0, z: -4, r: 0.4, g: 0.4, b: 1.0 },

            ];

            function createOnePart(obj, info) {
                let part = webgl.createPart(gl,
                    {
                        x: info.x,
                        y: info.y,
                        z: info.z,
                        r: info.r,
                        g: info.g,
                        b: info.b,

                        program: programs["client-views-tut-helloCube-treeLine"],
                        primitiveType: gl.TRIANGLES,

                        uniforms: {
                            MVP: {
                                name: "u_MVPMatrix",
                                fun: stage.mvpGeneralFun
                            },
                            color: {
                                name: "u_Color",
                                fun: function (gl) {
                                    gl.uniform4f(this.location, part.r, part.g, part.b, 1);
                                }
                            },
                        },

                        attributes: [
                            {
                                name: "a_Position",
                                dataAmount: 3,
                                beginIndex: 0,
                                buffer: vertexBuffer,
                            },
                            {
                                name: "a_Color",
                                dataAmount: 3,
                                beginIndex: 3,
                                buffer: vertexBuffer,
                            },
                            {
                                name: "a_Index",
                                dataAmount: 1,
                                beginIndex: 6,
                                buffer: vertexBuffer,
                            }

                        ],

                    });
                part.init = function () {
                    this.matrix.setTranslate(this.x, this.y, this.z);
                };
                return part;


            }
            this.parts = [];
            for (let i = 0; i < infos.length; i++) {
                const info = infos[i];
                let part = createOnePart(this, info);
                this.parts.push(part);
            }



        };

        let originIndicator = {};
        originIndicator.init = function () {
            this.name = "originIndicator";
            vertices = new Float32Array([
                0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0,
                0.2, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0,

                0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 1.0,
                0.0, 0.2, 0.0, 0.0, 1.0, 0.0, 1.0,

                0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 1.0,
                0.0, 0.0, 0.2, 0.0, 0.0, 1.0, 1.0,

            ]);

            let vertexBuffer = webgl.createVertexBuf(gl, {
                name: this.name,
                verticeData: vertices,
                pointNum: 6,

            });
            this.parts = [];
            let part = webgl.createPart(gl,
                {
                    program: programs["client-views-tut-helloCube-indicator"],
                    primitiveType: gl.LINES,
                    uniforms: {
                        MVP: {
                            name: "u_MVPMatrix",
                            fun: stage.mvpGeneralFun
                        }
                    },
                    attributes: [
                        {
                            name: "a_Position",
                            dataAmount: 3,
                            beginIndex: 0,
                            buffer: vertexBuffer,
                        },
                        {
                            name: "a_Color",
                            dataAmount: 4,
                            beginIndex: 3,
                            buffer: vertexBuffer,
                        }
                    ],

                    // polygonOffset: { factor: 0, unit: 100 },

                });
            this.parts.push(part);
            this.ontop = true;
        };


        animation = {};
        animation.init = function () {
            this.framerate = 30;
            this.last = Date.now();


            this.loop = function () {
                if (parent.root.animateable == false)
                    return;
                let id = requestAnimationFrame(animation.loop);

                let now = Date.now();
                let elapsed = now - animation.last; // milliseconds
                if (elapsed < 1000 / this.framerate)
                    return;
                animation.last = now;

                stage.clear();
                stage.render(elapsed);
            };
        };




        stage.init();
        stage.useCamera(camera);
        stage.addChild(box);
        // stage.addChild(triangles);
        stage.addChild(treeLines);
        // stage.addChild(rectangle);
        stage.addChild(originIndicator);

        animation.init();
        animation.loop();



        xs.addWindowEventListener(parent.root, {
            event: 'keydown', fun: function (evt) {
                if (evt.keyCode == 39) { // The right arrow key was pressed
                    camera.eyeX += 1;
                    camera.buildVMatrix();
                    display();

                }
                else if (evt.keyCode == 37) { // The left arrow key was pressed
                    camera.eyeX -= 1;
                    camera.buildVMatrix();
                    display();

                }
                else if (evt.keyCode == 38) {//up
                    camera.eyeY -= 1;
                    camera.buildVMatrix();
                    display();
                }
                else if (evt.keyCode == 40) {//down
                    camera.eyeY += 1;
                    camera.buildVMatrix();
                    display();

                }
                else if (evt.keyCode == 87) {//w
                    camera.oldNear = camera.near;
                    camera.near += 1;
                    if (camera.near >= camera.far) {
                        camera.near = camera.oldNear;
                        return;
                    }
                    camera.buildPerspectivePMatrix();
                    display();
                }
                else if (evt.keyCode == 83) {//s
                    camera.oldNear = camera.near;
                    camera.near -= 1;
                    if (camera.near <= 0) {
                        camera.near = camera.oldNear;
                        return;
                    }
                    camera.buildPerspectivePMatrix();
                    display();

                }
                else if (evt.keyCode == 68) {//d
                    camera.far += 1;
                    camera.buildPerspectivePMatrix();
                    display();
                }
                else if (evt.keyCode == 65) {//a
                    camera.oldFar = camera.far;

                    camera.far -= 1;
                    if (camera.far <= camera.near) {
                        camera.far = camera.oldFar;
                        return;
                    }
                    camera.buildPerspectivePMatrix();
                    display();

                }
                else if (evt.keyCode == 81) {//q
                    camera.fov -= 1;
                    camera.buildPerspectivePMatrix();
                    display();
                }
                else if (evt.keyCode == 69) {//e
                    camera.fov += 1;
                    camera.buildPerspectivePMatrix();
                    display();

                }
                else if (evt.keyCode == 90) {//z
                    camera.aspect -= 0.01;
                    camera.buildPerspectivePMatrix();
                    display();
                }
                else if (evt.keyCode == 67) {//c
                    camera.aspect += 0.01;
                    camera.buildPerspectivePMatrix();
                    display();

                }
            }
        });
        let nearDisplay = xs.getElement(parent, 'near');
        let farDisplay = xs.getElement(parent, 'far');
        function display() {

            nearDisplay.innerHTML = camera.near;
            farDisplay.innerHTML = camera.far;
        }
    }



};
//rectangle should include shader infomation
//