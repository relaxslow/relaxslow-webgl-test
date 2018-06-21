xs.init = function (param) {
    //multiTexture
    let { parent, currentfile, data } = param;
    new xs.Task({
        msg: `loadLib`,
        data: {
            div: parent,
            files: [
                '/client/lib/guild/cuon-utils',
                // '/client/lib/guild/webgl-utils',
                // '/client/lib/guild/webgl-debug',
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
            // let gl = cuon.getWebGLContext(canvas);
            var gl = canvas.getContext("webgl");
            if (gl == null) {
                xs.redAlert(`webgl not support!!`);
                return;
            }
            xs.successHint('webgl initialized!!');
            canvas.width = canvas.clientWidth;
            canvas.height = canvas.clientHeight;
            gl.viewport(0, 0, canvas.clientWidth, canvas.clientHeight);
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
                {
                    vert: `/client/views/tut/${data.folder}/baseShaderPick`,
                    frag: `/client/views/tut/${data.folder}/baseShaderPick`
                },
                {
                    vert: `/client/views/tut/${data.folder}/indicator`,
                    frag: `/client/views/tut/${data.folder}/simple`
                },
                {
                    vert: `/client/views/tut/pickObj/pick`,
                    frag: `/client/views/tut/pickObj/pick`
                },
                {
                    vert: `/client/views/tut/pickObj/selected`,
                    frag: `/client/views/tut/pickObj/selected`
                },

            ],

        },
        fun: webgl.loadPrograms

    });

    new xs.Task({
        msg: `loadImgs`,
        preTasks: ['init Webgl'],
        data: {
            imgPaths: [
                '/assets/img/circle.png',
                '/assets/img/sky.jpg',
                '/assets/img/smile.jpg',
                '/assets/img/default.jpg',
            ]
        },
        fun: webgl.loadImgs
    });


    new xs.Task({
        msg: 'webglMain',
        preTasks: ["loadImgs", "loadPrograms", "init Webgl"],
        data: { parent: parent, folder: data.folder },
        fun: main
    });

    function main(param) {
        let { gl, canvas, imgs, programs, folder } = param;
        let stage = new webgl.Stage({
            context: param,
            frameRate: 30,

        });
        // stage.imgs = imgs;
        // stage.programs = programs;
        stage.addBuffers([
            {
                name: 'boxVertexPos',
                verticeData: new Float32Array([   // Vertex coordinates, 1 unit box
                    0.5, 0.5, 0.5, -0.5, 0.5, 0.5, -0.5, -0.5, 0.5, 0.5, -0.5, 0.5,  // v0-v1-v2-v3 front
                    0.5, 0.5, 0.5, 0.5, -0.5, 0.5, 0.5, -0.5, -0.5, 0.5, 0.5, -0.5,  // v0-v3-v4-v5 right
                    0.5, 0.5, 0.5, 0.5, 0.5, -0.5, -0.5, 0.5, -0.5, -0.5, 0.5, 0.5,  // v0-v5-v6-v1 up
                    -0.5, 0.5, 0.5, -0.5, 0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, 0.5,  // v1-v6-v7-v2 left
                    -0.5, -0.5, -0.5, 0.5, -0.5, -0.5, 0.5, -0.5, 0.5, -0.5, -0.5, 0.5,  // v7-v4-v3-v2 down
                    0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, 0.5, -0.5, 0.5, 0.5, -0.5   // v4-v7-v6-v5 back
                ]),
                pointNum: 24,
            },
            {
                name: 'boxVertexColor',
                verticeData: new Float32Array([     // Colors
                    0.4, 0.4, 1.0, 0.4, 0.4, 1.0, 0.4, 0.4, 1.0, 0.4, 0.4, 1.0,  // v0-v1-v2-v3 front(blue)
                    0.4, 1.0, 0.4, 0.4, 1.0, 0.4, 0.4, 1.0, 0.4, 0.4, 1.0, 0.4,  // v0-v3-v4-v5 right(green)
                    1.0, 0.4, 0.4, 1.0, 0.4, 0.4, 1.0, 0.4, 0.4, 1.0, 0.4, 0.4,  // v0-v5-v6-v1 up(red)
                    1.0, 1.0, 0.4, 1.0, 1.0, 0.4, 1.0, 1.0, 0.4, 1.0, 1.0, 0.4,  // v1-v6-v7-v2 left
                    1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0,  // v7-v4-v3-v2 down
                    0.4, 1.0, 1.0, 0.4, 1.0, 1.0, 0.4, 1.0, 1.0, 0.4, 1.0, 1.0   // v4-v7-v6-v5 back
                ]),
                pointNum: 24
            },
            {
                name: 'boxVertexColorWhite',
                verticeData: new Float32Array([     // Colors
                    1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0,  // v0-v1-v2-v3 front(blue)
                    1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0,  // v0-v3-v4-v5 right(green)
                    1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0,  // v0-v5-v6-v1 up(red)
                    1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0,  // v1-v6-v7-v2 left
                    1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0,  // v7-v4-v3-v2 down
                    1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0   // v4-v7-v6-v5 back
                ]),
                pointNum: 24
            },
            {
                name: 'boxNormal',
                verticeData: new Float32Array([    // Normal
                    0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0,  // v0-v1-v2-v3 front
                    1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0,  // v0-v3-v4-v5 right
                    0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0,  // v0-v5-v6-v1 up
                    -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0,  // v1-v6-v7-v2 left
                    0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0,  // v7-v4-v3-v2 down
                    0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0   // v4-v7-v6-v5 back
                ]),
                pointNum: 24
            },
            {
                name: 'boxTextureCord',
                verticeData: new Float32Array([    // Normal
                    0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0,  // v0-v1-v2-v3 front
                    0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0,  // v0-v3-v4-v5 right
                    0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, // v0-v5-v6-v1 up
                    0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0,   // v1-v6-v7-v2 left
                    0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0,   // v7-v4-v3-v2 down
                    0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0,  // v4-v7-v6-v5 back
                ]),
                pointNum: 24
            },
            {
                name: 'boxIndice',
                indiceData: new Uint8Array([       // Indices of the vertices
                    0, 1, 2, 0, 2, 3,    // front
                    4, 5, 6, 4, 6, 7,    // right
                    8, 9, 10, 8, 10, 11,    // up
                    12, 13, 14, 12, 14, 15,    // left
                    16, 17, 18, 16, 18, 19,    // down
                    20, 21, 22, 20, 22, 23     // back
                ])

            },
            {
                name: 'indicatorVertexPos3Color4',
                verticeData: new Float32Array([
                    0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0,
                    0.2, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0,

                    0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 1.0,
                    0.0, 0.2, 0.0, 0.0, 1.0, 0.0, 1.0,

                    0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 1.0,
                    0.0, 0.0, 0.2, 0.0, 0.0, 1.0, 1.0,

                ]),
                pointNum: 6
            },

            {
                name: "sky",
                img: imgs.sky_jpg,
                texParam: {
                    "TEXTURE_MIN_FILTER": "NEAREST",
                    "TEXTURE_WRAP_S": "CLAMP_TO_EDGE"
                }
            },
            {
                name: "circle",
                img: imgs.circle_png,
                texParam: {
                    "TEXTURE_MIN_FILTER": "NEAREST",
                    "TEXTURE_WRAP_S": "CLAMP_TO_EDGE"
                }
            },
            {
                name: "smile",
                img: imgs.smile_jpg,
                texParam: {
                    "TEXTURE_MIN_FILTER": "NEAREST",
                    "TEXTURE_WRAP_S": "CLAMP_TO_EDGE"
                }
            },
            {
                name: "default",
                img: imgs.default_jpg,
                texParam: {
                    "TEXTURE_MIN_FILTER": "NEAREST",
                    "TEXTURE_WRAP_S": "CLAMP_TO_EDGE"
                }
            }

        ]);
        //defineCamera
        stage.addCamera({
            name: 'camera',
            type: "perspective",
            position: [3, 4, 7],
            lookAt: [0, 1.5, 0],
            up: [0, 1, 0],
            fov: 30,
            aspect: canvas.width / canvas.height,
            near: 1,
            far: 100
        });
        stage.useCamera("camera");

        stage.addLight({
            name: "direct",
            type: "directLight",
            color: [1, 1, 1],
            direct: [0.5, 3.0, 4.0],

        });
        stage.addLight({
            name: "ambient",
            type: "ambientLight",
            color: [0.2, 0.2, 0.2],

        });
        stage.addLight({
            name: "point",
            type: "pointLight",
            color: [1, 1, 1],
            position: [0.0, 3.0, 4.0],
        });




        let arm1 = stage.createObj(
            {
                name: "arm1",
                program: programs[`${folder}-baseShaderPick`],
                primitiveType: gl.TRIANGLES,
                attributes: [
                    {
                        name: "a_Position",
                        dataAmount: 3,
                        beginIndex: 0,
                        bufferName: "boxVertexPos",
                    },
                    {
                        name: "a_Color",
                        dataAmount: 3,
                        beginIndex: 0,
                        bufferName: 'boxVertexColorWhite',
                    },
                    {
                        name: "a_Normal",
                        dataAmount: 3,
                        beginIndex: 0,
                        bufferName: 'boxNormal'
                    },
                    {
                        name: "a_TexCoord",
                        dataAmount: 2,
                        beginIndex: 0,
                        bufferName: 'boxTextureCord',
                    }
                ],

                indice: { bufferName: 'boxIndice' },
                uniforms: [
                    {
                        name: "u_MVPMatrix",
                        fun: webgl.mvpGeneralFun
                    },
                    {
                        name: "u_ModelMatrix",
                        fun: webgl.modelGeneralFun
                    },
                    {
                        name: "u_NormalMatrix",//normal must after 
                        fun: webgl.normalGeneralFun
                    },

                ],
                useLights: [
                    {
                        lightName: 'direct',
                        name: "u_DirectLightColor",
                        fun: function (gl, light) {
                            gl.uniform3fv(this.location, light.color.elements);
                        }
                    },
                    {
                        lightName: 'direct',
                        name: "u_DirectLightDirection",
                        fun: function (gl, light) {
                            gl.uniform3fv(this.location, light.direct.elements);
                        }
                    },
                    {
                        lightName: 'ambient',
                        name: "u_AmbientLightColor",
                        fun: function (gl, light) {
                            gl.uniform3fv(this.location, light.color.elements);
                        }
                    },
                ],
                useTextures: [
                    {
                        name: "u_Sampler0",
                        channel: 1,
                        textureName: "sky",
                    },
                ],

                init: function (obj) {
                    this.dragAngle = [0, 0];
                    this.matrix.translate(0, 0.15, 0);
                    this.matrix.scale(1, 0.3, 1);
                },
                update: function (elapsed) {
                    this.transformMatrix.rotate(this.dragAngle[0], 1, 0, 0);
                    this.transformMatrix.rotate(this.dragAngle[1], 0, 1, 0);

                },
                selected: {
                    program: programs["pickObj-selected"],
                    attributes: [
                        {
                            name: "a_Position",
                            dataAmount: 3,
                            beginIndex: 0,
                            bufferName: "boxVertexPos",
                        },
                    ],
                    uniforms: [
                        {
                            name: "u_MVPMatrix",
                            fun: webgl.mvpGeneralFun
                        },

                        {
                            name: "u_SelectedColor",
                            fun: webgl.selectedGeneralFun

                        }
                    ],
                }
            }
        );

        let arm2 = stage.createObj(
            {
                name: "arm2",
                program: programs[`${folder}-baseShaderPick`],
                primitiveType: gl.TRIANGLES,
                attributes: [
                    {
                        name: "a_Position",
                        dataAmount: 3,
                        beginIndex: 0,
                        bufferName: "boxVertexPos",
                    },
                    {
                        name: "a_Color",
                        dataAmount: 3,
                        beginIndex: 0,
                        bufferName: 'boxVertexColorWhite',
                    },
                    {
                        name: "a_Normal",
                        dataAmount: 3,
                        beginIndex: 0,
                        bufferName: 'boxNormal'
                    },
                    {
                        name: "a_TexCoord",
                        dataAmount: 2,
                        beginIndex: 0,
                        bufferName: 'boxTextureCord',
                    }
                ],

                indice: { bufferName: 'boxIndice' },
                uniforms: [
                    {
                        name: "u_MVPMatrix",
                        fun: webgl.mvpGeneralFun
                    },
                    {
                        name: "u_ModelMatrix",
                        fun: webgl.modelGeneralFun
                    },
                    {
                        name: "u_NormalMatrix",//normal must after 
                        fun: webgl.normalGeneralFun
                    },

                ],
                useLights: [
                    {
                        lightName: 'direct',
                        name: "u_DirectLightColor",
                        fun: function (gl, light) {
                            gl.uniform3fv(this.location, light.color.elements);
                        }
                    },
                    {
                        lightName: 'direct',
                        name: "u_DirectLightDirection",
                        fun: function (gl, light) {
                            gl.uniform3fv(this.location, light.direct.elements);
                        }
                    },
                    {
                        lightName: 'ambient',
                        name: "u_AmbientLightColor",
                        fun: function (gl, light) {
                            gl.uniform3fv(this.location, light.color.elements);
                        }
                    },
                ],
                useTextures: [
                    {
                        name: "u_Sampler0",
                        channel: 0,
                        textureName: "default",
                    },
                ],
                init: function (obj) {
                    this.matrix.translate(0, 0.5, 0);
                    this.matrix.scale(0.5, 1, 0.5);
                    this.operateMatrix.translate(0, 0.3, 0);


                },

                selected: {
                    program: programs["pickObj-selected"],
                    attributes: [
                        {
                            name: "a_Position",
                            dataAmount: 3,
                            beginIndex: 0,
                            bufferName: "boxVertexPos",
                        },
                    ],
                    uniforms: [
                        {
                            name: "u_MVPMatrix",
                            fun: webgl.mvpGeneralFun
                        },

                        {
                            name: "u_SelectedColor",
                            fun: webgl.selectedGeneralFun

                        }
                    ],
                }

            }
        );

        let arm3 = stage.createObj(
            {
                name: "arm3",
                program: programs[`${folder}-baseShaderPick`],
                primitiveType: gl.TRIANGLES,
                attributes: [
                    {
                        name: "a_Position",
                        dataAmount: 3,
                        beginIndex: 0,
                        bufferName: "boxVertexPos",
                    },
                    {
                        name: "a_Color",
                        dataAmount: 3,
                        beginIndex: 0,
                        bufferName: 'boxVertexColorWhite',
                    },
                    {
                        name: "a_Normal",
                        dataAmount: 3,
                        beginIndex: 0,
                        bufferName: 'boxNormal'
                    },
                    {
                        name: "a_TexCoord",
                        dataAmount: 2,
                        beginIndex: 0,
                        bufferName: 'boxTextureCord',
                    }
                ],

                indice: { bufferName: 'boxIndice' },
                uniforms: [
                    {
                        name: "u_MVPMatrix",
                        fun: webgl.mvpGeneralFun
                    },
                    {
                        name: "u_ModelMatrix",
                        fun: webgl.modelGeneralFun
                    },
                    {
                        name: "u_NormalMatrix",//normal must after 
                        fun: webgl.normalGeneralFun
                    },

                ],
                useLights: [
                    {
                        lightName: 'direct',
                        name: "u_DirectLightColor",
                        fun: function (gl, light) {
                            gl.uniform3fv(this.location, light.color.elements);
                        }
                    },
                    {
                        lightName: 'direct',
                        name: "u_DirectLightDirection",
                        fun: function (gl, light) {
                            gl.uniform3fv(this.location, light.direct.elements);
                        }
                    },
                    {
                        lightName: 'ambient',
                        name: "u_AmbientLightColor",
                        fun: function (gl, light) {
                            gl.uniform3fv(this.location, light.color.elements);
                        }
                    },
                ],
                useTextures: [
                    {
                        name: "u_Sampler0",
                        channel: 0,
                        textureName: "default",
                    },
                ],
                init: function (obj) {
                    this.matrix.translate(0, 0.5, 0);
                    this.matrix.scale(0.3, 1, 0.3);
                    this.operateMatrix.translate(0, 1, 0);

                },
                update: function (elapsed) {

                },
                selected: {
                    program: programs["pickObj-selected"],
                    attributes: [
                        {
                            name: "a_Position",
                            dataAmount: 3,
                            beginIndex: 0,
                            bufferName: "boxVertexPos",
                        },
                    ],
                    uniforms: [
                        {
                            name: "u_MVPMatrix",
                            fun: webgl.mvpGeneralFun
                        },

                        {
                            name: "u_SelectedColor",
                            fun: webgl.selectedGeneralFun

                        }
                    ],
                }
            }
        );

        let arm4 = stage.createObj(
            {
                name: "arm4",
                program: programs[`${folder}-baseShaderPick`],
                primitiveType: gl.TRIANGLES,
                attributes: [
                    {
                        name: "a_Position",
                        dataAmount: 3,
                        beginIndex: 0,
                        bufferName: "boxVertexPos",
                    },
                    {
                        name: "a_Color",
                        dataAmount: 3,
                        beginIndex: 0,
                        bufferName: 'boxVertexColorWhite',
                    },
                    {
                        name: "a_Normal",
                        dataAmount: 3,
                        beginIndex: 0,
                        bufferName: 'boxNormal'
                    },
                    {
                        name: "a_TexCoord",
                        dataAmount: 2,
                        beginIndex: 0,
                        bufferName: 'boxTextureCord',
                    }
                ],

                indice: { bufferName: 'boxIndice' },
                uniforms: [
                    {
                        name: "u_MVPMatrix",
                        fun: webgl.mvpGeneralFun
                    },
                    {
                        name: "u_ModelMatrix",
                        fun: webgl.modelGeneralFun
                    },
                    {
                        name: "u_NormalMatrix",
                        fun: webgl.normalGeneralFun
                    },

                ],
                useLights: [
                    {
                        lightName: 'direct',
                        name: "u_DirectLightColor",
                        fun: function (gl, light) {
                            gl.uniform3fv(this.location, light.color.elements);
                        }
                    },
                    {
                        lightName: 'direct',
                        name: "u_DirectLightDirection",
                        fun: function (gl, light) {
                            gl.uniform3fv(this.location, light.direct.elements);
                        }
                    },
                    {
                        lightName: 'ambient',
                        name: "u_AmbientLightColor",
                        fun: function (gl, light) {
                            gl.uniform3fv(this.location, light.color.elements);
                        }
                    },
                ],
                useTextures: [
                    {
                        name: "u_Sampler0",
                        channel: 0,
                        textureName: "default",
                    },
                ],
                init: function (obj) {
                    this.matrix.translate(0, 0.2, 0);
                    this.matrix.scale(0.8, 0.4, 0.4);
                    this.operateMatrix.translate(0, 1, 0);
                },
                update: function (elapsed) {

                },
                selected: {
                    program: programs["pickObj-selected"],
                    attributes: [
                        {
                            name: "a_Position",
                            dataAmount: 3,
                            beginIndex: 0,
                            bufferName: "boxVertexPos",
                        },
                    ],
                    uniforms: [
                        {
                            name: "u_MVPMatrix",
                            fun: webgl.mvpGeneralFun
                        },

                        {
                            name: "u_SelectedColor",
                            fun: webgl.selectedGeneralFun

                        }
                    ],
                }
            }
        );

        let arm5 = stage.createObj(
            {
                name: "arm5",
                program: programs[`${folder}-baseShaderPick`],
                primitiveType: gl.TRIANGLES,
                attributes: [
                    {
                        name: "a_Position",
                        dataAmount: 3,
                        beginIndex: 0,
                        bufferName: "boxVertexPos",
                    },
                    {
                        name: "a_Color",
                        dataAmount: 3,
                        beginIndex: 0,
                        bufferName: 'boxVertexColorWhite',
                    },
                    {
                        name: "a_Normal",
                        dataAmount: 3,
                        beginIndex: 0,
                        bufferName: 'boxNormal'
                    },
                    {
                        name: "a_TexCoord",
                        dataAmount: 2,
                        beginIndex: 0,
                        bufferName: 'boxTextureCord',
                    }
                ],

                indice: { bufferName: 'boxIndice' },
                uniforms: [
                    {
                        name: "u_MVPMatrix",
                        fun: webgl.mvpGeneralFun
                    },
                    {
                        name: "u_ModelMatrix",
                        fun: webgl.modelGeneralFun
                    },
                    {
                        name: "u_NormalMatrix",//normal must after 
                        fun: webgl.normalGeneralFun
                    },

                ],
                useLights: [
                    {
                        lightName: 'direct',
                        name: "u_DirectLightColor",
                        fun: function (gl, light) {
                            gl.uniform3fv(this.location, light.color.elements);
                        }
                    },
                    {
                        lightName: 'direct',
                        name: "u_DirectLightDirection",
                        fun: function (gl, light) {
                            gl.uniform3fv(this.location, light.direct.elements);
                        }
                    },
                    {
                        lightName: 'ambient',
                        name: "u_AmbientLightColor",
                        fun: function (gl, light) {
                            gl.uniform3fv(this.location, light.color.elements);
                        }
                    },
                ],
                useTextures: [
                    {
                        name: "u_Sampler0",
                        channel: 0,
                        textureName: "default",
                    },
                ],
                init: function (obj) {
                    this.matrix.translate(0, 0.1, 0);
                    this.matrix.scale(0.1, 0.2, 0.1);
                    this.operateMatrix.translate(-0.2, 0.4, 0);

                },
                update: function (elapsed) {

                },
                selected: {
                    program: programs["pickObj-selected"],
                    attributes: [
                        {
                            name: "a_Position",
                            dataAmount: 3,
                            beginIndex: 0,
                            bufferName: "boxVertexPos",
                        },
                    ],
                    uniforms: [
                        {
                            name: "u_MVPMatrix",
                            fun: webgl.mvpGeneralFun
                        },

                        {
                            name: "u_SelectedColor",
                            fun: webgl.selectedGeneralFun

                        }
                    ],
                }
            }
        );

        let arm6 = stage.createObj(
            {
                name: "arm6",
                program: programs[`${folder}-baseShaderPick`],
                primitiveType: gl.TRIANGLES,
                attributes: [
                    {
                        name: "a_Position",
                        dataAmount: 3,
                        beginIndex: 0,
                        bufferName: "boxVertexPos",
                    },
                    {
                        name: "a_Color",
                        dataAmount: 3,
                        beginIndex: 0,
                        bufferName: 'boxVertexColorWhite',
                    },
                    {
                        name: "a_Normal",
                        dataAmount: 3,
                        beginIndex: 0,
                        bufferName: 'boxNormal'
                    },
                    {
                        name: "a_TexCoord",
                        dataAmount: 2,
                        beginIndex: 0,
                        bufferName: 'boxTextureCord',
                    }
                ],

                indice: { bufferName: 'boxIndice' },
                uniforms: [
                    {
                        name: "u_MVPMatrix",
                        fun: webgl.mvpGeneralFun
                    },
                    {
                        name: "u_ModelMatrix",
                        fun: webgl.modelGeneralFun
                    },
                    {
                        name: "u_NormalMatrix",//normal must after 
                        fun: webgl.normalGeneralFun
                    },

                ],
                useLights: [
                    {
                        lightName: 'direct',
                        name: "u_DirectLightColor",
                        fun: function (gl, light) {
                            gl.uniform3fv(this.location, light.color.elements);
                        }
                    },
                    {
                        lightName: 'direct',
                        name: "u_DirectLightDirection",
                        fun: function (gl, light) {
                            gl.uniform3fv(this.location, light.direct.elements);
                        }
                    },
                    {
                        lightName: 'ambient',
                        name: "u_AmbientLightColor",
                        fun: function (gl, light) {
                            gl.uniform3fv(this.location, light.color.elements);
                        }
                    },
                ],
                useTextures: [
                    {
                        name: "u_Sampler0",
                        channel: 0,
                        textureName: "default",
                    },
                ],
                init: function (obj) {
                    this.matrix.translate(0, 0.1, 0);
                    this.matrix.scale(0.1, 0.2, 0.1);
                    this.operateMatrix.translate(0.2, 0.4, 0);


                },
                selected: {
                    program: programs["pickObj-selected"],
                    attributes: [
                        {
                            name: "a_Position",
                            dataAmount: 3,
                            beginIndex: 0,
                            bufferName: "boxVertexPos",
                        },
                    ],
                    uniforms: [
                        {
                            name: "u_MVPMatrix",
                            fun: webgl.mvpGeneralFun
                        },

                        {
                            name: "u_SelectedColor",
                            fun: webgl.selectedGeneralFun

                        }
                    ],
                }

            }
        );
        //hierarchy
        stage.addChild(arm1);
        arm1.addChild(arm2);
        arm2.addChild(arm3);
        arm3.addChild(arm4);
        arm4.addChild(arm5);
        arm4.addChild(arm6);
        stage.addObj({
            name: "originIndicator",
            program: programs[`${folder}-indicator`],
            primitiveType: gl.LINES,
            uniforms: [
                {
                    name: "u_MVPMatrix",
                    fun: webgl.mvpGeneralFun
                }
            ],
            attributes: [//program  independent
                {
                    name: "a_Position",
                    dataAmount: 3,
                    beginIndex: 0,
                    bufferName: 'indicatorVertexPos3Color4',
                },
                {
                    name: "a_Color",
                    dataAmount: 4,
                    beginIndex: 3,
                    bufferName: 'indicatorVertexPos3Color4',
                }
            ],
            ontop: 2
        });


        stage.beginAnimation();
        canvas.onmousedown = function (evt) {

            let stage = webgl.stage;
            var x = evt.clientX, y = evt.clientY;
            // Start dragging if a moue is in <canvas>
            var rect = evt.target.getBoundingClientRect();
            if (rect.left <= x && x < rect.right && rect.top <= y && y < rect.bottom) {
                stage.lastX = x; stage.lastY = y;
                stage.dragging = true;
            }


            stage.renderPickColor();

            let canvasX = x - rect.left, canvasY = rect.bottom - y;
            webgl.gl.readPixels(canvasX, canvasY, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, stage.pickPixels);
            let mouseColor = parent.getElementsByClassName("mouseColor")[0];
            mouseColor.innerHTML = stage.pickPixels;
            webgl.iterateChild(webgl.stage, 'objs', function (param) {
                let { obj } = param;
                if (obj.selected != undefined) {
                    obj.isSelected = false;
                    if (obj.pick.color[0] == webgl.stage.pickPixels[0] &&
                        obj.pick.color[1] == webgl.stage.pickPixels[1] &&
                        obj.pick.color[2] == webgl.stage.pickPixels[2]
                    ) {
                        obj.isSelected = true;
                    }
                }

            });

        };
        canvas.onmouseup = function (evt) {
            let stage = webgl.stage;
            stage.dragging = false;
        };
        canvas.onmousemove = function (evt) { // Mouse is moved
            let mouseXDisplay = parent.getElementsByClassName("mouseX")[0];
            let mouseYDisplay = parent.getElementsByClassName("mouseY")[0];


            let stage = webgl.stage;
            let canvas = webgl.gl.canvas;
            let arm1 = stage.getObj('arm1');
            var x = evt.clientX, y = evt.clientY;
            mouseXDisplay.innerHTML = x;
            mouseYDisplay.innerHTML = y;
            if (stage.dragging) {
                var factor = 100 / canvas.height; // The rotation ratio
                var dx = factor * (x - stage.lastX);
                var dy = factor * (y - stage.lastY);
                // Limit x-axis rotation angle to -90 to 90 degrees
                arm1.dragAngle[0] = Math.max(Math.min(arm1.dragAngle[0] + dy, 90.0), -90.0);
                arm1.dragAngle[1] = arm1.dragAngle[1] + dx;
            }
            stage.lastX = x;
            stage.lastY = y;


        };
        xs.addListenerToElement(parent, {
            element: window,
            event: 'keydown',
            fun: function (evt) {
                let camera = webgl.stage.camera;
                let arm3 = webgl.stage.getObj('arm3');
                let arm4 = webgl.stage.getObj('arm4');
                let arm5 = webgl.stage.getObj('arm5');
                let arm6 = webgl.stage.getObj('arm6');
                if (evt.keyCode == 84) {//t
                    arm3.operateMatrix.rotate(1, 1, 0, 0);
                } else if (evt.keyCode == 71) {//g
                    arm3.operateMatrix.rotate(-1, 1, 0, 0);
                } else if (evt.keyCode == 82) {//r
                    arm4.operateMatrix.rotate(1, 0, 1, 0);
                } else if (evt.keyCode == 89) {//y
                    arm4.operateMatrix.rotate(-1, 0, 1, 0);
                } else if (evt.keyCode == 70) {//f
                    arm5.operateMatrix.rotate(1, 0, 0, 1);
                    arm6.operateMatrix.rotate(-1, 0, 0, 1);
                } else if (evt.keyCode == 72) {//h
                    arm5.operateMatrix.rotate(-1, 0, 0, 1);
                    arm6.operateMatrix.rotate(1, 0, 0, 1);
                }

                //camera
                if (evt.keyCode == 39) { // right
                    camera.eyeX += 1;
                    camera.buildVMatrix();
                    display(camera);

                }
                else if (evt.keyCode == 37) { //left
                    camera.eyeX -= 1;
                    camera.buildVMatrix();
                    display(camera);

                }
                else if (evt.keyCode == 38) {//up
                    camera.eyeY -= 1;
                    camera.buildVMatrix();
                    display(camera);
                }
                else if (evt.keyCode == 40) {//down
                    camera.eyeY += 1;
                    camera.buildVMatrix();
                    display(camera);

                }
                else if (evt.keyCode == 87) {//w
                    camera.oldNear = camera.near;
                    camera.near += 1;
                    if (camera.near >= camera.far) {
                        camera.near = camera.oldNear;
                        return;
                    }
                    camera.buildPMatrix();
                    display(camera);

                }
                else if (evt.keyCode == 83) {//s
                    camera.oldNear = camera.near;
                    camera.near -= 1;
                    if (camera.near <= 0) {
                        camera.near = camera.oldNear;
                        return;
                    }
                    camera.buildPMatrix();
                    display(camera);


                }
                else if (evt.keyCode == 68) {//d
                    camera.far += 1;
                    camera.buildPMatrix();
                    display(camera);
                }
                else if (evt.keyCode == 65) {//a
                    camera.oldFar = camera.far;

                    camera.far -= 1;
                    if (camera.far <= camera.near) {
                        camera.far = camera.oldFar;
                        return;
                    }
                    camera.buildPMatrix();
                    display(camera);

                }
                else if (evt.keyCode == 81) {//q
                    camera.fov -= 1;
                    camera.buildPMatrix();
                    display(camera);
                }
                else if (evt.keyCode == 69) {//e
                    camera.fov += 1;
                    camera.buildPMatrix();
                    display(camera);

                }
                else if (evt.keyCode == 90) {//z
                    camera.aspect -= 0.01;
                    camera.buildPMatrix();
                    display(camera);
                }
                else if (evt.keyCode == 67) {//c
                    camera.aspect += 0.01;
                    camera.buildPMatrix();
                    display(camera);

                }
            }
        });

        function display(camera) {

            //             let nearDisplay = xs.getElement(parent, 'near');
            //             let farDisplay = xs.getElement(parent, 'far');
            //             nearDisplay.innerHTML = camera.near;
            //             farDisplay.innerHTML = camera.far;
        }
        param.task.finish();
    }


};
