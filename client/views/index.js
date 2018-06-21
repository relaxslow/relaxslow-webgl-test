

xs.init = function (param) {
    let { parent } = param;

    let dynamicsPage = parent.getElementsByClassName('dynamicsPage')[0];


    new xs.Task({
        msg: `addnew`,
        data: {
            file: `/client/views/tut/emptyPage/page`,
            element: dynamicsPage,
            plug: "current",
        },
        fun: xs.addNew
    });

    function linkPageToButton(buttonClassName, pagefileFolder) {
        let button = parent.getElementsByClassName(buttonClassName)[0];
        button.addEventListener('click', function (evt) {
            new xs.Task({
                msg: 'loadnewpage',
                data: {
                    cssfiles: ['/client/views/tut/webglStyles'],
                    file: `/client/views/tut/${pagefileFolder}/page`,
                    socket: dynamicsPage,
                    sendData: { folder: pagefileFolder }
                },
                fun: xs.loadNewPage
            }).run();

        });
    }

    linkPageToButton('emptyPage', 'emptyPage');
    linkPageToButton('emptyPage2', 'emptyPage2');


    linkPageToButton('webgl026', 'helloCube');
    linkPageToButton('webgl027', 'lightedCube');
    linkPageToButton('webgl028', 'JointModel');
    linkPageToButton('webgl029', 'rotateObject');
    linkPageToButton('webgl030', 'pickObj');






};



