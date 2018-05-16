defineLib('webgl');
webgl.getShaderSrc = (param) => {
    let { file, fun } = param;
    let encodeFileName = xs.b64EncodeUnicode(file);
    xs.sendRequest({
        url: `/getShader/:${encodeFileName}`,
        fun: function (loadedShader) {
            fun(loadedShader, file);
        }
    });
};

webgl.getShaderSrcs = (param) => {
    let { files, fun } = param;
    let shaders = {};
    let count = files.length;
    xs.addStep("get shaders", files.length);
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        webgl.getShaderSrc({ file: file, fun: finishGet });
    }
    function finishGet(shader, file) {
        let varName = file.slice(file.lastIndexOf("/") + 1, file.indexOf("."));
        let type = file.slice(file.indexOf(".") + 1);
        shaders[`${varName}_${type}`] = shader;
        xs.finishStep(`get shaders ${file}`);
        count--;
        if (count == 0) {
            fun(shaders);
        }

    }

};

webgl.createShader = (gl, type, source) => {
    var shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (success) {
        return shader;
    }

    console.log(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
};

webgl.createProgram2 = (gl, vertexShader, fragmentShader) => {
    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    var success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (success) {
        return program;
    }

    console.log(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
};

webgl.resize = (canvas) => {
    // Lookup the size the browser is displaying the canvas.
    var displayWidth = canvas.clientWidth;
    var displayHeight = canvas.clientHeight;

    // Check if the canvas is not the same size.
    if (canvas.width !== displayWidth ||
        canvas.height !== displayHeight) {

        // Make the canvas the same size
        canvas.width = displayWidth;
        canvas.height = displayHeight;
    }
};
webgl.resize2 = (canvas) => {
    var cssToRealPixels = window.devicePixelRatio || 1;

    // Lookup the size the browser is displaying the canvas in CSS pixels
    // and compute a size needed to make our drawingbuffer match it in
    // device pixels.
    var displayWidth = Math.floor(canvas.clientWidth * cssToRealPixels);
    var displayHeight = Math.floor(canvas.clientHeight * cssToRealPixels);

    // Check if the canvas is not the same size.
    if (canvas.width !== displayWidth ||
        canvas.height !== displayHeight) {

        // Make the canvas the same size
        canvas.width = displayWidth;
        canvas.height = displayHeight;
    }
};


webgl.loadImgs = function (imgPaths, fun) {
    let imgs = {};
    let count = imgPaths.length;
    for (let i = 0; i < imgPaths.length; i++) {
        addOne(imgPaths[i]);

    }
    function addOne(imgPath) {
        let img = new Image();
        img.src = imgPath;
        let shortName = imgPath.slice(imgPath.lastIndexOf("/") + 1, imgPath.indexOf("."));
        let type = imgPath.slice(imgPath.indexOf(".") + 1);
        img.onload = function () {
            console.log(`load img ${imgPath}`);
            imgs[`${shortName}_${type}`] = img;
            count--;
            if (count == 0 && fun != undefined)
                fun(imgs);
        };

    }

};
webgl.connectAttributes = function (gl, part) {
    for (let i = 0; i < part.attributes.length; i++) {
        const attribute = part.attributes[i];
        gl.bindBuffer(gl.ARRAY_BUFFER, attribute.buffer);
        let FSIZE = attribute.buffer.FSIZE;
        let span = attribute.buffer.span;
        gl.vertexAttribPointer(attribute.location, attribute.dataAmount, attribute.dataType, attribute.normalized, FSIZE * span, FSIZE * attribute.beginIndex);
        gl.enableVertexAttribArray(attribute.location);
    }
};
webgl.connectUniforms = function (gl, part) {
    for (let key in part.uniforms) {
        const uniform = part.uniforms[key];
        uniform.fun(gl, part);
    }
};


webgl.createVertexBuf = function (gl, param) {
    let { name, verticeData, pointNum } = param;
    let vertexBuffer = gl.createBuffer();
    if (!vertexBuffer) {
        xs.redAlert('Failed to create the buffer object');
        return;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, verticeData, gl.STATIC_DRAW);
    vertexBuffer.name = name;
    vertexBuffer.data = verticeData;
    vertexBuffer.pointNum = pointNum;
    vertexBuffer.span = verticeData.length / pointNum;
    vertexBuffer.FSIZE = verticeData.BYTES_PER_ELEMENT;

    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    return vertexBuffer;
};
webgl.getMVPLoc = function (gl, program) {
    return gl.getUniformLocation(program, 'u_MVPMatrix');
}
webgl.createVertexBuffer = function (gl, param) {
    let { buffer, span, infos } = param;
    let vertexBuffer = gl.createBuffer();
    if (!vertexBuffer) {
        xs.redAlert('Failed to create the buffer object');
        return;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, buffer, gl.STATIC_DRAW);
    let FSIZE = buffer.BYTES_PER_ELEMENT;
    for (let i = 0; i < infos.length; i++) {
        const info = infos[i];
        let a_attribute = gl.getAttribLocation(gl.program, info.attribute);
        if (a_attribute < 0) {
            xs.redAlert(`Failed to get the storage location of ${info.attribute}`);
            return;
        }
        gl.vertexAttribPointer(a_attribute, info.dataAmount, info.dataType, info.normalized, FSIZE * span, FSIZE * info.beginIndex);
        gl.enableVertexAttribArray(a_attribute);
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    return vertexBuffer;
};
webgl.createTextureBuffer = function (gl, channel, image, texParam) {

    let textureBuffer = gl.createTexture();
    if (!textureBuffer) {
        xs.redAlert('Failed to create the texture object');
        return;
    }

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    gl.activeTexture(gl[`TEXTURE${channel}`]);
    gl.bindTexture(gl.TEXTURE_2D, textureBuffer);
    for (let key in texParam) {
        gl.texParameteri(gl.TEXTURE_2D, gl[key], gl[texParam[key]]);
    }

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    return textureBuffer;
};
webgl.createTexture = function (gl, channel, image, texParam) {


    let texture = gl.createTexture();
    if (!texture) {
        xs.redAlert('Failed to create the texture object');
        return;
    }

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    gl.activeTexture(gl[`TEXTURE${channel}`]);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    for (let key in texParam) {
        gl.texParameteri(gl.TEXTURE_2D, gl[key], gl[texParam[key]]);
    }
    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);



};
webgl.changeChannelTexture2D = function (gl, channel, texture) {
    gl.activeTexture(gl[`TEXTURE${channel}`]);
    gl.bindTexture(gl.TEXTURE_2D, texture);
};
webgl.connectTextureToShader2 = function (gl, channel, program, sampler) {
    let u_Sampler = gl.getUniformLocation(program, sampler);
    if (!u_Sampler) {
        xs.redAlert('Failed to get the storage location of u_Sampler');

        return;
    }
    gl.uniform1i(u_Sampler, channel);
};
webgl.connectTextureToShader = function (gl, channel, sampler) {
    let u_Sampler = gl.getUniformLocation(gl.program, sampler);
    if (!u_Sampler) {
        xs.redAlert('Failed to get the storage location of u_Sampler');

        return;
    }
    gl.uniform1i(u_Sampler, channel);
};

webgl.getModelMatrixInShader = function (gl) {
    let u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
    if (u_ModelMatrix == null)
        xs.redAlert(`can't find uniform u_ModelMatrix`);
    return u_ModelMatrix;
};

webgl.createProgram = function (gl, vertexCode, fragCode, name) {
    let program = cuon.createProgram(gl, vertexCode, fragCode);
    if (program == null)
        xs.redAlert(`failed create program`);
    program.name = name;
    return program;
};
webgl.getAttribLocation = function (gl, program, attributes) {
    for (let i = 0; i < attributes.length; i++) {
        const attribute = attributes[i];
        attribute.location = gl.getAttribLocation(program, attribute.name);
        if (attribute.location < 0) {
            xs.redAlert(`Failed to get the storage location of ${attribute.name}`);
            return;
        }
        if (attribute.dataType == undefined)
            attribute.dataType = gl.FLOAT;
        if (attribute.normalized == undefined)
            attribute.normalized = false;


    }
};
webgl.getUniformLocation = function (gl, program, uniforms) {
    for (let key in uniforms) {
        const uniform = uniforms[key];
        uniform.location = gl.getUniformLocation(program, uniform.name);
        if (uniform.location < 0) {
            xs.redAlert(`Failed to get location of ${uniform.name}`);
            return;
        }
    }

};
webgl.setPart = function (gl, parts) {
    for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        webgl.createPart(gl, part);
    }
    return parts;
};
webgl.createPart = function (gl, part) {
    part.matrix = new cuon.Matrix4();
    if (part.first == undefined)
        part.first = 0;
    if (part.count == undefined)
        part.count = part.attributes[0].buffer.pointNum;
    webgl.getUniformLocation(gl, part.program, part.uniforms);
    webgl.getAttribLocation(gl, part.program, part.attributes);
    return part;
};

webgl.initParts = function (parts) {
    for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        if (part.init != undefined)
            part.init();
    }
};