xs.init = function (param) {
    //multiTexture
    let { parent, currentfile, data } = param;
    new xs.Task({
        msg: `loadLib`,
        data: {
            div: parent,
            files: [
                '/client/lib/guild/cuon-utils',
                '/client/lib/guild/webgl-utils',
                '/client/lib/guild/webgl-debug',
                '/client/lib/guild/cuon-matrix',
            ]
        },
        fun: xs.addLibs
    });

    new xs.Task({
        msg: 'init Webgl',
        preTasks: ['loadLib'],
        fun: function (param) {
            let canvas = parent.getElementsByClassName('webglCanvas')[0];
            let gl = cuon.getWebGLContext(canvas);
            if (gl == null) {
                xs.redAlert(`webgl not support!!`);
                return;
            }
            xs.successHint('webgl initialized!!');
            canvas.width = canvas.clientWidth;
            canvas.height = canvas.clientHeight;
            gl.viewport(0, 0, canvas.clientWidth, canvas.clientHeight);
            gl.clearColor(0.0, 0.0, 0.0, 1.0);
            gl.enable(gl.DEPTH_TEST);
            webgl.gl = gl;
            param.task.finish({ gl: gl, canvas: canvas });
        }
    });
    new xs.Task({
        msg: `loadPrograms`,
        preTasks: ['init Webgl'],
        data: {
            files: [
                `/client/views/tut/${data.folder}/indicator`,
                `/client/views/tut/${data.folder}/treeLine`,
                `/client/views/tut/${data.folder}/cube`,
                `/client/views/tut/${data.folder}/triangles`,
                `/client/views/tut/${data.folder}/rectangle`,

            ],

        },
        fun: webgl.loadPrograms

    });

    new xs.Task({
        msg: `loadImgs`,
        preTasks: [`loadPrograms`],
        data: {
            imgs: [
                '/assets/img/circle.png',
                '/assets/img/sky.jpg',
            ]
        },
        fun: webgl.loadImgs
    });


    new xs.Task({
        msg: 'webglMain',
        preTasks: ["loadImgs", "loadPrograms", "init Webgl"],
        fun: main
    });

    function main(param) {
        let { canvas } = param;


        let animation = new webgl.Animation({ frameRate: 30 });
        // let stageManager = new webgl.StageManager();
        let stage = new webgl.Stage();



        let camera = new webgl.Camera();
        camera.init = function () {
            this.setName('camera');
            this.setLookAt(
                0, 0, 5,
                0, 0, 0,
                0, 1, 0
            );
            this.setPerspective(30, canvas.width / canvas.height, 1, 100);
        };

        stage.useCamera(camera);



        let rectangle = new webgl.Obj();
        rectangle.init = function () {
            this.setName('rectangle');
            this.addBuffer({
                name: "vertexBuffer",
                verticeData: new Float32Array(
                    [
                        -0.5, 0.5, 0.0, 1.0,
                        -0.5, -0.5, 0.0, 0.0,
                        0.5, 0.5, 1.0, 1.0,
                        0.5, -0.5, 1.0, 0.0,
                    ]
                ),
                pointNum: 4
            });
            this.addTexBuffer({
                name: "sky",
                img: webgl.imgs.sky_jpg,
                texParam: {
                    "TEXTURE_MIN_FILTER": "NEAREST",
                    "TEXTURE_WRAP_S": "CLAMP_TO_EDGE"
                }
            });
            this.addTexBuffer({
                name: "circle",
                img: webgl.imgs.circle_png,
                texParam: {
                    "TEXTURE_MIN_FILTER": "NEAREST",
                    "TEXTURE_WRAP_S": "CLAMP_TO_EDGE"
                }
            });


            this.addPart({
                program: webgl.programs["helloCube-rectangle"],
                primitiveType: webgl.gl.TRIANGLE_STRIP,
                uniforms: {
                    MVP: {
                        name: "u_MVPMatrix",
                        fun: webgl.mvpGeneralFun
                    },

                },
                attributes: [
                    {
                        name: "a_Position",
                        dataAmount: 2,
                        beginIndex: 0,
                        buffer: this.buffers.vertexBuffer,
                    },

                    {
                        name: "a_TexCoord",
                        dataAmount: 2,
                        beginIndex: 2,
                        buffer: this.buffers.vertexBuffer,
                    }
                ],
                useTextures: [
                    {
                        name: "u_Sampler0",
                        channel: 0,
                        texture: this.textures.sky,
                    },
                    {
                        name: "u_Sampler1",
                        channel: 1,
                        texture: this.textures.circle
                    }
                ],
                init: function () {
                    this.x = 0.3;
                    this.y = 0;
                    this.z = 0;
                    this.angle = 0;
                    this.rotateSpeed = 45;
                    this.axisX = 0;
                    this.axisY = 0;
                    this.axisZ = 1;
                },
                update: function (elapsed) {//update
                    let newAngle = this.angle + (this.rotateSpeed * elapsed) / 1000.0;
                    this.angle = newAngle %= 360;
                    this.matrix.setRotate(this.angle, this.axisX, this.axisY, this.axisZ);
                    this.matrix.translate(this.x, this.y, this.z);

                },

            });
            this.ontop = 1;

        };

        let treeLines = new webgl.Obj();
        treeLines.init = function () {
            this.name = 'treelines';
            this.addBuffer({
                name: 'vertexBuffer',
                verticeData: new Float32Array([
                    0, 1, 0, 0.4, 1, 0.4, 0,// The back green one
                    -0.5, -1, 0, 0.4, 1, 0.4, 1,
                    0.5, -1, 0, 1, 0.4, 0.4, 2,

                ]),
                pointNum: 3

            });


            let infos = [
                { x: 0.75, y: 0, z: 0, r: 0.4, g: 1.0, b: 0.4 },
                { x: -0.75, y: 0, z: 0, r: 0.4, g: 1.0, b: 0.4 },

                { x: 0.75, y: 0, z: -2, r: 1.0, g: 1.0, b: 0.4 },
                { x: -0.75, y: 0, z: -2, r: 1.0, g: 1.0, b: 0.4 },

                { x: 0.75, y: 0, z: -4, r: 0.4, g: 0.4, b: 1.0 },
                { x: -0.75, y: 0, z: -4, r: 0.4, g: 0.4, b: 1.0 },

            ];


            for (let i = 0; i < infos.length; i++) {
                const info = infos[i];
                this.addPart({
                    program: webgl.programs["helloCube-treeLine"],
                    primitiveType: webgl.gl.TRIANGLES,

                    uniforms: {
                        MVP: {
                            name: "u_MVPMatrix",
                            fun: webgl.mvpGeneralFun
                        },
                        color: {
                            name: "u_Color",
                            fun: colorFun
                        },
                    },

                    attributes: [
                        {
                            name: "a_Position",
                            dataAmount: 3,
                            beginIndex: 0,
                            buffer: this.buffers.vertexBuffer,
                        },
                        {
                            name: "a_Color",
                            dataAmount: 3,
                            beginIndex: 3,
                            buffer: this.buffers.vertexBuffer,
                        },
                        {
                            name: "a_Index",
                            dataAmount: 1,
                            beginIndex: 6,
                            buffer: this.buffers.vertexBuffer,
                        }

                    ],
                    data: { info: info },
                    init: partInit
                });


            }
            function partInit(param) {
                let { info } = param;
                this.x = info.x;
                this.y = info.y;
                this.z = info.z;
                this.r = info.r;
                this.g = info.g;
                this.b = info.b;
                this.matrix.setTranslate(this.x, this.y, this.z);

            }
            function colorFun(gl, part) {
                gl.uniform4f(this.location, part.r, part.g, part.b, 1);

            }

            // this.ontop = true;


        };

        let originIndicator = new webgl.Obj();
        originIndicator.init = function () {
            this.name = "originIndicator";
            this.addBuffer({
                name: 'vertexBuffer',
                verticeData: new Float32Array([
                    0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0,
                    0.2, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0,

                    0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 1.0,
                    0.0, 0.2, 0.0, 0.0, 1.0, 0.0, 1.0,

                    0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 1.0,
                    0.0, 0.0, 0.2, 0.0, 0.0, 1.0, 1.0,

                ]),
                pointNum: 6
            });

            this.addPart({
                program: webgl.programs["helloCube-indicator"],
                primitiveType: webgl.gl.LINES,
                uniforms: {
                    MVP: {
                        name: "u_MVPMatrix",
                        fun: webgl.mvpGeneralFun
                    }
                },
                attributes: [
                    {
                        name: "a_Position",
                        dataAmount: 3,
                        beginIndex: 0,
                        buffer: this.buffers.vertexBuffer,
                    },
                    {
                        name: "a_Color",
                        dataAmount: 4,
                        beginIndex: 3,
                        buffer: this.buffers.vertexBuffer,
                    }
                ],
            });

            this.ontop = 2;
        };

        let box = new webgl.Obj();

        box.init = function (param) {
            this.name = 'box';
            // let vertices = new Float32Array([
            //     // Vertex coordinates and color
            //     1.0, 1.0, 1.0, 1.0, 1.0, 1.0,  // v0 White
            //     -1.0, 1.0, 1.0, 1.0, 0.0, 1.0,  // v1 Magenta
            //     -1.0, -1.0, 1.0, 1.0, 0.0, 0.0,  // v2 Red
            //     1.0, -1.0, 1.0, 1.0, 1.0, 0.0,  // v3 Yellow
            //     1.0, -1.0, -1.0, 0.0, 1.0, 0.0,  // v4 Green
            //     1.0, 1.0, -1.0, 0.0, 1.0, 1.0,  // v5 Cyan
            //     -1.0, 1.0, -1.0, 0.0, 0.0, 1.0,  // v6 Blue
            //     -1.0, -1.0, -1.0, 0.0, 0.0, 0.0   // v7 Black
            // ]);


            // let indices = new Uint8Array([
            //     0, 1, 2, 0, 2, 3,    // front
            //     0, 3, 4, 0, 4, 5,    // right
            //     0, 5, 6, 0, 6, 1,    // up
            //     1, 6, 7, 1, 7, 2,    // left
            //     7, 4, 3, 7, 3, 2,    // down
            //     4, 7, 6, 4, 6, 5     // back
            // ]);
            // let vertexBuffer = webgl.createVertexBuf(gl, {
            //     name: "box vertex position|color ",
            //     verticeData: vertices,
            //     pointNum: 8,

            // });
            // let indiceBuffer = webgl.createIndiceBuf(gl, {
            //     name: 'box',
            //     indiceData: indices
            // });
            this.addBuffer({
                name: 'vertexPosBuffer',
                verticeData: new Float32Array([   // Vertex coordinates
                    0.3, 0.3, 0.3, -0.3, 0.3, 0.3, -0.3, -0.3, 0.3, 0.3, -0.3, 0.3,  // v0-v1-v2-v3 front
                    0.3, 0.3, 0.3, 0.3, -0.3, 0.3, 0.3, -0.3, -0.3, 0.3, 0.3, -0.3,  // v0-v3-v4-v5 right
                    0.3, 0.3, 0.3, 0.3, 0.3, -0.3, -0.3, 0.3, -0.3, -0.3, 0.3, 0.3,  // v0-v5-v6-v1 up
                    -0.3, 0.3, 0.3, -0.3, 0.3, -0.3, -0.3, -0.3, -0.3, -0.3, -0.3, 0.3,  // v1-v6-v7-v2 left
                    -0.3, -0.3, -0.3, 0.3, -0.3, -0.3, 0.3, -0.3, 0.3, -0.3, -0.3, 0.3,  // v7-v4-v3-v2 down
                    0.3, -0.3, -0.3, -0.3, -0.3, -0.3, -0.3, 0.3, -0.3, 0.3, 0.3, -0.3   // v4-v7-v6-v5 back
                ]),
                pointNum: 24,
            });
            this.addBuffer({
                name: 'vertexColorBuffer',
                verticeData: new Float32Array([     // Colors
                    0.4, 0.4, 1.0, 0.4, 0.4, 1.0, 0.4, 0.4, 1.0, 0.4, 0.4, 1.0,  // v0-v1-v2-v3 front(blue)
                    0.4, 1.0, 0.4, 0.4, 1.0, 0.4, 0.4, 1.0, 0.4, 0.4, 1.0, 0.4,  // v0-v3-v4-v5 right(green)
                    1.0, 0.4, 0.4, 1.0, 0.4, 0.4, 1.0, 0.4, 0.4, 1.0, 0.4, 0.4,  // v0-v5-v6-v1 up(red)
                    1.0, 1.0, 0.4, 1.0, 1.0, 0.4, 1.0, 1.0, 0.4, 1.0, 1.0, 0.4,  // v1-v6-v7-v2 left
                    1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0,  // v7-v4-v3-v2 down
                    0.4, 1.0, 1.0, 0.4, 1.0, 1.0, 0.4, 1.0, 1.0, 0.4, 1.0, 1.0   // v4-v7-v6-v5 back
                ]),
                pointNum: 24
            });
            this.addIndice({
                name: 'indiceBuffer',
                indiceData: new Uint8Array([       // Indices of the vertices
                    0, 1, 2, 0, 2, 3,    // front
                    4, 5, 6, 4, 6, 7,    // right
                    8, 9, 10, 8, 10, 11,    // up
                    12, 13, 14, 12, 14, 15,    // left
                    16, 17, 18, 16, 18, 19,    // down
                    20, 21, 22, 20, 22, 23     // back
                ])

            });

            this.addPart(
                {
                    program: webgl.programs["helloCube-cube"],
                    primitiveType: webgl.gl.TRIANGLES,
                    uniforms: {
                        MVP: {
                            name: "u_MVPMatrix",
                            fun: webgl.mvpGeneralFun
                        }
                    },
                    attributes: [
                        {
                            name: "a_Position",
                            dataAmount: 3,
                            beginIndex: 0,
                            buffer: this.buffers.vertexPosBuffer,
                        },
                        {
                            name: "a_Color",
                            dataAmount: 3,
                            beginIndex: 0,
                            buffer: this.buffers.vertexColorBuffer,
                        }
                    ],
                    indice: this.buffers.indiceBuffer

                }
            );
        };

        let triangles = new webgl.Obj();
        triangles.init = function () {
            this.name = 'triangles';
            this.addBuffer({
                name: 'vertexBuffer',
                verticeData: new Float32Array([
                    0.0, 0.5, -0.4, 0.4, 1.0, 0.4,
                    -0.5, -0.5, -0.4, 0.4, 1.0, 0.4,
                    0.5, -0.5, -0.4, 1.0, 0.4, 0.4,

                    0.5, 0.4, -0.2, 1.0, 0.4, 0.4,
                    -0.5, 0.4, -0.2, 1.0, 1.0, 0.4,
                    0.0, -0.6, -0.2, 1.0, 1.0, 0.4,

                    0.0, 0.5, 0.0, 0.4, 0.4, 1.0,
                    -0.5, -0.5, 0.0, 0.4, 0.4, 1.0,
                    0.5, -0.5, 0.0, 1.0, 0.4, 0.4,
                ]),
                pointNum: 9
            });

            this.addPart({
                program: webgl.programs["helloCube-triangles"],
                primitiveType: webgl.gl.TRIANGLES,
                uniforms: {
                    MVP: {
                        name: "u_MVPMatrix",
                        fun: webgl.mvpGeneralFun
                    },
                },
                attributes: [
                    {
                        name: "a_Position",
                        dataAmount: 3,
                        beginIndex: 0,
                        buffer: this.buffers.vertexBuffer,
                    },
                    {
                        name: "a_Color",
                        dataAmount: 3,
                        beginIndex: 3,
                        buffer: this.buffers.vertexBuffer,
                    },

                ],
                init: function () {
                    this.matrix.setRotate(10, 0, 0, 1);
                },
                // polygonOffset: { factor: 0.5, unit: 0.1 },



            });
            this.ontop = undefined;

        };

        stage.addChild(treeLines);
        stage.addChild(box);
        stage.addChild(triangles);
        stage.addChild(rectangle);
        stage.addChild(originIndicator);


        animation.begin(parent, stage);








        xs.addListenerToElement(parent, {
            element: window,
            event: 'keydown',
            fun: function (evt) {
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

        function display() {
            let nearDisplay = xs.getElement(parent, 'near');
            let farDisplay = xs.getElement(parent, 'far');
            nearDisplay.innerHTML = camera.near;
            farDisplay.innerHTML = camera.far;
        }
        param.task.finish();
    }


};
