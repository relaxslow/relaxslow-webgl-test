  // stage.addObj(
        //     {
        //         name: "boxUnderDirectLight",
        //         program: programs["lightedCube-cubeDirectLight"],
        //         primitiveType: gl.TRIANGLES,

        //         uniforms: [
        //             {
        //                 name: "u_MVPMatrix",
        //                 fun: webgl.mvpGeneralFun
        //             },
        //             {
        //                 name: "u_ModelMatrix",
        //                 fun: function (gl, part) {
        //                     gl.uniformMatrix4fv(this.location, false, part.matrix.elements);
        //                 }
        //             },
        //             {
        //                 name: "u_NormalMatrix",
        //                 fun: function (gl, part) {
        //                     part.normalMatrix.setInverseOf(part.matrix);
        //                     part.normalMatrix.transpose();
        //                     gl.uniformMatrix4fv(this.location, false, part.normalMatrix.elements);
        //                 }
        //             },

        //         ],
        //         attributes: [
        //             {
        //                 name: "a_Position",
        //                 dataAmount: 3,
        //                 beginIndex: 0,
        //                 bufferName: "boxVertexPos",
        //             },
        //             {
        //                 name: "a_Color",
        //                 dataAmount: 3,
        //                 beginIndex: 0,
        //                 bufferName: 'boxVertexColor',
        //             },
        //             {
        //                 name: "a_Normal",
        //                 dataAmount: 3,
        //                 beginIndex: 0,
        //                 bufferName: 'boxNormal'
        //             },

        //         ],

        //         indice: { bufferName: 'boxIndice' },
        //         useLights: [
        //             {
        //                 lightName: 'direct',
        //                 name: "u_DirectLightColor",
        //                 fun: function (gl, light) {
        //                     gl.uniform3fv(this.location, light.color.elements);
        //                 }
        //             },
        //             {
        //                 lightName: 'direct',
        //                 name: "u_DirectLightDirection",
        //                 fun: function (gl, light) {
        //                     gl.uniform3fv(this.location, light.direct.elements);
        //                 }
        //             },
                    

        //         ],

        //     }
        // );