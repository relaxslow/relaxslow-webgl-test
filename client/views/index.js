Init = (param) => {
    let { parent } = param;
    let dynamicsPage = parent.getElementsByClassName('dynamicsPage')[0];
    function addNewPageToButton(buttonClass, pageFilePath) {
        let button = parent.getElementsByClassName(buttonClass)[0];
        button.addEventListener('click', function (evt) {
            xs.loadNewPage({ cssfile: ['/client/views/tut/webglStyles'], file: pageFilePath, socketElement: dynamicsPage });
        });
    }
    function linkPageToButton(buttonClassName, pagefileFolder) {
        let button = parent.getElementsByClassName(buttonClassName)[0];
        button.addEventListener('click', function (evt) {
            xs.loadNewPage({ cssfile: ['/client/views/tut/webglStyles'], file: `/client/views/tut/${pagefileFolder}/page`, socketElement: dynamicsPage, data: { folder: pagefileFolder } });
        });
    }
    linkPageToButton('emptyPage', 'emptyPage');
    linkPageToButton('emptyPage2', 'emptyPage2');

    addNewPageToButton('webgl000', '/client/views/tut/canvas2d');
    addNewPageToButton('webgl001', '/client/views/tut/canvas');
    addNewPageToButton('webgl002', '/client/views/tut/shader');
    addNewPageToButton('webgl003', '/client/views/tut/shader2d');
    addNewPageToButton('webgl004', '/client/views/tut/helloPoint1');
    addNewPageToButton('webgl005', '/client/views/tut/helloPoint2');
    addNewPageToButton('webgl006', '/client/views/tut/clickedPoint');
    addNewPageToButton('webgl007', '/client/views/tut/coloredPoints/page');
    addNewPageToButton('webgl008', '/client/views/tut/multiPoint/page');
    addNewPageToButton('webgl009', '/client/views/tut/HelloTriangle/page');
    addNewPageToButton('webgl010', '/client/views/tut/translatedTriangle/page');
    addNewPageToButton('webgl011', '/client/views/tut/RotatedTriangle/page');
    addNewPageToButton('webgl012', '/client/views/tut/rotatedTriangle_matrix/page');
    addNewPageToButton('webgl013', '/client/views/tut/rotatedTriangle_matrix4/page');
    addNewPageToButton('webgl014', '/client/views/tut/RotatedTranslatedTriangle/page');
    addNewPageToButton('webgl015', '/client/views/tut/RotatingTriangle/page');
    linkPageToButton('webgl016', 'MultiAttributeSize');
    linkPageToButton('webgl017', 'MultiAttributeSize_Interleaved');
    linkPageToButton('webgl018', 'MultiAttributeColor');
    linkPageToButton('webgl019', 'fragCoord');
    linkPageToButton('webgl020', 'TexturedQuad');
    linkPageToButton('webgl021', 'MultiTexture');
    linkPageToButton('webgl022', 'LookAtTriangles');
    linkPageToButton('webgl023', 'LookAtTrianglesWithKeys');
    linkPageToButton('webgl024', 'OrthoView');
    linkPageToButton('webgl025', 'PerspectiveView');
    





};



