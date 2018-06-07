### Thursday, June 7, 2018

complete Classes : `xs.Task`  `webgl.Obj`

_xs.Task_
Use to manage life period of functions. Easyly pass result between asynchronize functions. Isolate functions, make the code clear.

#### useage:
```javascript
    new xs.Task({
        msg: 'init Webgl',
        preTasks: ['loadLib'],
        fun: function (param) {
          //...
           param.task.finish({ gl: gl, canvas: canvas });
        }
    });
     new xs.Task({
        msg: `loadPrograms`,
        preTasks: ['init Webgl'],
        data: {
            files: [
                `/client/views/tut/indicator`,
                `/client/views/tut/cube`,
                `/client/views/tut/triangles`
            ],

        },
        fun: function(param){
          //...
           param.task.finish();
        }

    });
```
> The task is promise to run after the preTask it declared. 

> The preTasks' `param.task.finish()` function can pass data to all the post functions.  

> Support nest Tasks. Child task will run after the parent task. The parent  wait all the child finish and then  pass the data to post tasks.

_webgl.Obj_
use to manage all the obj in the scene, envelop webgl render pipeline.

#### useage:
```javascript:
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
                   //---
                },
                update: function (elapsed) {//update
                //...

                },

            });
            this.ontop = 1;

        };
```
> Use the javascript pattern(json) to define a obj. The class facilitate comprehension of the webgl pipeline.

> Each Object contain buffers and textures which can be use by parts. Each object may have multi parts.

> Each part has a complete definition about how the use program to present object. Uniforms, attributes, useTextures


