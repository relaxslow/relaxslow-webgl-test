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
                `/client/views/tut/${data.folder}/indicator`,
                `/client/views/tut/${data.folder}/cube`,
                `/client/views/tut/${data.folder}/triangles`
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

