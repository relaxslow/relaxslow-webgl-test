defineLib('xs');
xs.mouseIsInRect = (evt, element) => {
    if (element == undefined)
        return false;
    let mouseX = evt.clientX;
    let mouseY = evt.clientY;
    let rect = element.getBoundingClientRect();
    let l = Math.floor(rect.left);
    let r = Math.floor(rect.right);
    let t = Math.floor(rect.top);
    let b = Math.floor(rect.bottom);

    if (mouseX >= l && mouseX <= r &&
        mouseY >= t && mouseY <= b)
        return true;
    return false;
};
xs.initAnimation = (element) => {
    if (element.animation == undefined)
        element.animation = {};
    element.animation.progress = 1;
};
xs.animate = (param) => {
    let { element, animationData, duration, fun, begin } = param;
    if (element == undefined || animationData == undefined)
        return;

    xs.initAnimation(element);
    if (element.animation.ID != null) {
        cancelAnimationFrame(element.animation.ID);
    }
    element.animation.ID = requestAnimationFrame(function (timeStamp) {
        element.animation.startTime = timeStamp;
        update(timeStamp);
    });

    function update(timeStamp) {

        let runTime = timeStamp - element.animation.startTime;
        let progress = runTime / duration;
        if (begin != undefined)
            progress += begin;
        progress = Math.min(progress, 1);
        element.animation.progress = progress;
        for (let i = 0; i < animationData.length; i++) {
            const data = animationData[i];
            let { property, from, to, dist, unit, translation, scale, rotate } = data;

            if (property === 'transform') {
                element.m = xs.identityMatrix();
                if (translation != undefined) {
                    if (element.animation.currentTranslation == undefined)
                        element.animation.currentTranslation = translation.from.slice();
                    let tx = currentValue(translation.from[0], translation.to[0], progress);
                    let ty = currentValue(translation.from[1], translation.to[1], progress);
                    let tz = currentValue(translation.from[2], translation.to[2], progress);
                    xs.translateElement(element, tx, ty, tz);
                    element.animation.currentTranslation = [tx, ty, tz];
                }
                if (scale != undefined) {
                    if (element.animation.currentScale == undefined)
                        element.animation.currentScale = scale.from.slice();
                    let sw = currentValue(scale.from[0], scale.to[0], progress);
                    let sh = currentValue(scale.from[1], scale.to[1], progress);
                    let sd = currentValue(scale.from[2], scale.to[2], progress);
                    xs.scaleElement(element, sw, sh, sd);
                    element.animation.currentScale = [sw, sh, sd];
                }
                if (rotate != undefined) {
                    if (element.animation.currentRotate == undefined)
                        element.animation.currentRotate = rotate.from.slice();
                    let rx = currentValue(rotate.from[0], rotate.to[0], progress);
                    let ry = currentValue(rotate.from[1], rotate.to[1], progress);
                    let rz = currentValue(rotate.from[2], rotate.to[2], progress);
                    xs.rotateElement(element, rx, ry, rz);
                    element.animation.currentRotate = [rx, ry, rz];

                }
                element.style.transform = xs.matrixArrayToCssMatrix(element.m);
            }
            else {
                if (dist == undefined) {
                    dist = to - from;
                    data.dist = dist;
                }

                let value = from + dist * progress;
                if (unit == undefined) {
                    unit = "";
                }
                element.style[property] = value + unit;
            }
        }
        if (progress < 1) {
            element.animation.ID = requestAnimationFrame(update);
        } else {
            endAnimation();
        }


        function endAnimation() {
            element.animation.ID = null;
            if (fun != undefined)
                fun(element);
        }

        function currentValue(from, to, progress) {

            let dist = to - from;

            return from + dist * progress;
        }
    }



};

xs.translateElement = (element, x, y, z) => {

    element.m[12] = x;
    element.m[13] = y;
    element.m[14] = z;
};
xs.scaleElement = (element, w, d, h) => {

    element.m[0] *= w;
    element.m[5] *= d;
    element.m[10] *= h;
};
xs.rotateElement = (element, x, y, z) => {
    let c = Math.cos(x * xs.DegToRad);
    let s = Math.sin(x * xs.DegToRad);
    element.m[5] *= c;
    element.m[6] = -s;
    element.m[9] = s;
    element.m[10] *= c;
    c = Math.cos(y * xs.DegToRad);
    s = Math.sin(y * xs.DegToRad);
    element.m[0] *= c;
    element.m[2] = s;
    element.m[8] = -s;
    element.m[10] *= c;
    c = Math.cos(z * xs.DegToRad);
    s = Math.sin(z * xs.DegToRad);
    element.m[0] *= c;
    element.m[1] = -s;
    element.m[4] = s;
    element.m[5] *= c;
};
xs.transformElement = (param) => {
    let { element, translation, scale, rotate } = param;
    element.m = xs.identityMatrix();
    if (translation != undefined) {
        xs.translateElement(element, translation[0], translation[1], translation[2]);
    }
    if (scale != undefined) {
        xs.scaleElement(element, scale[0], scale[1], scale[2]);
    }
    if (rotate != undefined) {
        xs.rotateElement(element, rotate[0], rotate[1], rotate[2]);
    }

    element.style.transform = xs.matrixArrayToCssMatrix(element.m);
};



//matrix//copy from MDN
xs.identityMatrix = () => {
    return [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    ];
};
xs.multiplyMatrixAndPoint = (matrix, point) => {

    //Give a simple variable name to each part of the matrix, a column and row number
    var c0r0 = matrix[0], c1r0 = matrix[1], c2r0 = matrix[2], c3r0 = matrix[3];
    var c0r1 = matrix[4], c1r1 = matrix[5], c2r1 = matrix[6], c3r1 = matrix[7];
    var c0r2 = matrix[8], c1r2 = matrix[9], c2r2 = matrix[10], c3r2 = matrix[11];
    var c0r3 = matrix[12], c1r3 = matrix[13], c2r3 = matrix[14], c3r3 = matrix[15];

    //Now set some simple names for the point
    var x = point[0];
    var y = point[1];
    var z = point[2];
    var w = point[3];

    //Multiply the point against each part of the 1st column, then add together
    var resultX = (x * c0r0) + (y * c0r1) + (z * c0r2) + (w * c0r3);

    //Multiply the point against each part of the 2nd column, then add together
    var resultY = (x * c1r0) + (y * c1r1) + (z * c1r2) + (w * c1r3);

    //Multiply the point against each part of the 3rd column, then add together
    var resultZ = (x * c2r0) + (y * c2r1) + (z * c2r2) + (w * c2r3);

    //Multiply the point against each part of the 4th column, then add together
    var resultW = (x * c3r0) + (y * c3r1) + (z * c3r2) + (w * c3r3);

    return [resultX, resultY, resultZ, resultW];
};

xs.multiplyMatrices = (matrixA, matrixB) => {

    // Slice the second matrix up into columns
    var column0 = [matrixB[0], matrixB[4], matrixB[8], matrixB[12]];
    var column1 = [matrixB[1], matrixB[5], matrixB[9], matrixB[13]];
    var column2 = [matrixB[2], matrixB[6], matrixB[10], matrixB[14]];
    var column3 = [matrixB[3], matrixB[7], matrixB[11], matrixB[15]];

    // Multiply each column by the matrix
    var result0 = xs.multiplyMatrixAndPoint(matrixA, column0);
    var result1 = xs.multiplyMatrixAndPoint(matrixA, column1);
    var result2 = xs.multiplyMatrixAndPoint(matrixA, column2);
    var result3 = xs.multiplyMatrixAndPoint(matrixA, column3);

    // Turn the result columns back into a single matrix
    return [
        result0[0], result1[0], result2[0], result3[0],
        result0[1], result1[1], result2[1], result3[1],
        result0[2], result1[2], result2[2], result3[2],
        result0[3], result1[3], result2[3], result3[3]
    ];
};

xs.translation = (x, y, z) => {
    return [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        x, y, z, 1
    ];
};

xs.scale = (w, h, d) => {
    return [
        w, 0, 0, 0,
        0, h, 0, 0,
        0, 0, d, 0,
        0, 0, 0, 1
    ];
};
xs.DegToRad = 0.017453292519943295;
// function deg2rad(deg) {
//     return deg * (Math.PI / 180);
//     }

//
// var index = ` 
// 0,  1,  2,  3,
// 4,  5,  6,  7,
// 8,  9, 10, 11,
// 12, 13, 14, 15
// `;


// var position = `
// 00, 01, 02, 03,
// 10, 11, 12, 13,
// 20, 21, 22, 23,
// 30, 31, 32, 33
// `;
xs.rotate = (x, y, z) => {

    let m = xs.identityMatrix();

    let c = Math.cos(x * xs.DegToRad);
    let s = Math.sin(x * xs.DegToRad);
    m[5] *= c;
    m[6] = -s;
    m[9] = s;
    m[10] *= c;
    c = Math.cos(y * xs.DegToRad);
    s = Math.sin(y * xs.DegToRad);
    m[0] *= c;
    m[2] = s;
    m[8] = -s;
    m[10] *= c;

    c = Math.cos(z * xs.DegToRad);
    s = Math.sin(z * xs.DegToRad);
    m[0] *= c;
    m[1] = -s;
    m[4] = s;
    m[5] *= c;
    return m;

};
xs.rotateX = (a) => {
    let c = Math.cos(a * xs.DegToRad);
    let s = Math.sin(a * xs.DegToRad);
    return [
        1, 0, 0, 0,
        0, c, -s, 0,
        0, s, c, 0,
        0, 0, 0, 1
    ];

};
xs.rotateY = (a) => {
    let c = Math.cos(a * xs.DegToRad);
    let s = Math.sin(a * xs.DegToRad);
    return [
        c, 0, s, 0,
        0, 1, 0, 0,
        -s, 0, c, 0,
        0, 0, 0, 1
    ];
};
xs.rotateZ = (a) => {
    let c = Math.cos(a * xs.DegToRad);
    let s = Math.sin(a * xs.DegToRad);
    return [
        c, -s, 0, 0,
        s, c, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    ];
};
// Create the matrix3d style property from a matrix array
xs.matrixArrayToCssMatrix = (array) => {
    return 'matrix3d(' + array.join(',') + ')';
};
// for example
//   // Grab the DOM element
//   var moveMe = document.getElementById('move-me');

//   // Returns a result like: "matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 50, 100, 0, 1);"
//   var matrix3dRule = matrixArrayToCssMatrix(translationMatrix);

//   // Set the transform
//   moveMe.style.transform = matrix3dRule;


xs.Matrices = function (matrices) {

    var inputMatrix = matrices[0];

    for (var i = 1; i < matrices.length; i++) {
        inputMatrix = xs.multiplyMatrices(inputMatrix, matrices[i]);
    }

    return inputMatrix;
};


//note the matrix multiplication in webgl and css3 needs to happen in reverse order than its intuitive order
//for example if you want to scale something down by 80%, move it down 200 pixels, and then rotate about the origin 90 degrees 
// var transformMatrix = MDN.multiplyArrayOfMatrices([
//     rotateAroundZAxis(Math.PI * 0.5),    // Step 3: rotate around 90 degrees
//     translate(0, 200, 0),                // Step 2: move down 100 pixels
//     scale(0.8, 0.8, 0.8),                // Step 1: scale down
//   ]);
