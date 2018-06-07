// xs.init = function () {
//     // let test = new xs.Task({
//     //     msg: "atest",
//     //     fun: function () {
//     //         console.log("atest!!");
//     //         xs.TaskFinish(test, null);
//     //     }
//     // });

//     // xs.allTaskGroups = [];
//     // xs.allTranslateNode = [];
//     // let identify = xs.identifyUser();


//     // let xsroot = xs.initXSRoot();
//     // xs.loadNewPage({
//     //     socket: xsroot,
//     //     file: '/client/views/index',
//     //     preTaskGroup: 'identify'
//     // });




// };

function defineLib(libName) {
    window.currentNamespace = libName;
    if (window[libName] == undefined)
        window[libName] = {};
}
defineLib('xs');
defineLib('test');
xs.init = function (param) {
    xs.taskManager = new xs.TaskManager();
    let button = document.getElementsByClassName("test")[0];
    button.addEventListener('click', test.directToUrl);
    new xs.Task({
        msg: `identify`,
        fun: xs.identifyUser
    }).run();


};

test.other = function () {
    console.log('I love you');
};
test.simpleLeak = function () {
    console.log('a leak');
    if (window.xxx == undefined)
        window.xxx = [];
    for (let i = 0; i < 10000; i++) {
        window.xxx.push('a');
    }

};

// window.yyy = [];
test.createTaskGroup = function () {
    new xs.Task({
        msg: `create task group!!`,
        fun: param => {

            param.task.finish();
        }
    }).run();
    let taskGroup = new xs.Task({
        msg: `a task group`,
        preTasks: [pre],
        fun: param => {
            let { task } = param;
            let level1pre = new xs.Task({
                msg: `level1pre`,
                fun: param => {
                    let { task } = param;
                    task.finish();
                }
            });
            for (let i = 0; i < 2; i++) {
                let task = new xs.Task({
                    msg: `test task ${i}`,
                    preTask: level1pre,
                    fun: taskfun,
                    data: { index: i },
                });
                // let xxx = [1, 2, 3, 4, 5];
                // window.yyy.push(xxx);
            }
            task.finish();
        }
    });
    let post = new xs.Task({
        msg: `post task!!`,
        preTasks: [taskGroup],
        fun: param => {
            let { task } = param;
            task.finish();
        }
    });
    pre.run();

    function taskfun(param) {
        let { task, index } = param;
        // console.log(`test task ${index}!!!`);

        let level2 = new xs.Task({
            msg: `level2`,
            fun: param => {
                let { task } = param;
                // console.log(`this is a level2 task!!`);
                task.finish();
            }
        });

        task.finish(null);

    }

};
test.addnewModule = function () {
    let root = xs.initRoot();
    new xs.Task({
        msg: `addnew`,
        data: { file: `/client/views/tut/emptyPage/page`, element: root },
        fun: xs.addNew
    }).run();
};
test.addchild = function () {
    let root = xs.initRoot();


    let div = xs.aDiv({
        styles: ['testDiv'],
        childs: [
            xs.aDiv({ styles: ['testChildDiv1'] }),
            xs.aDiv({ styles: ['testChildDiv2'] })
        ],
    });
    xs.addChild(root, [div]);
};

test.translateAll = function () {
    let task = new xs.Task({
        msg: `translate all!!`,
        fun: param => {
            let { task } = param;
            let root = xs.getRoot();
            let allTranslateNode = [];
            findAllTranslateNode(root, allTranslateNode);
            for (let i = 0; i < allTranslateNode.length; i++) {
                const textNode = allTranslateNode[i];
                translateOne(textNode, `USA`);
            }
            allTranslateNode = null;
            task.finish();
        }
    });
    task.run();
    function translateOne(textNode, currentlanguage) {

        let index = textNode.translateIndex;
        let type = textNode.dataset.translate;
        let task = new xs.Task({
            msg: `translate:${index}`,
            fun: (param) => {
                let { task } = param;
                xs.sendRequest({
                    url: `/get${type}Text/:${encodeURI(index)}/${currentlanguage}`, fun: function (translated) {
                        let decoded;
                        if (type === "Content")
                            decoded = xs.b64DecodeUnicode(translated);
                        else decoded = decodeURI(translated);
                        textNode.innerHTML = decoded;
                        task.finish();
                    }
                });
            },

        });

    }
    function findAllTranslateNode(element, allTranslateNode) {

        for (let i = 0; i < element.childNodes.length; i++) {
            const child = element.childNodes[i];
            if (isTranslateNode(child)) {
                allTranslateNode.push(child);
                if (child.translateIndex == undefined)
                    child.translateIndex = child.innerHTML;
            }
            let newIterate;
            if (child.childNodes.length != 0)
                newIterate = new findAllTranslateNode(child, allTranslateNode);
        }
    }
    function isTranslateNode(element) {
        if (element.nodeName === "SPAN" && element.dataset.translate != undefined)
            return true;
        if (element.nodeName === "BUTTON" && element.dataset.translate != undefined)
            return true;
        return false;
    }


};
test.directToUrl = function () {
    let root = xs.initRoot();
    if (xs.taskManager.allTasks.length > 0)
        return;
    new xs.Task({
        msg: `directToUrl`,
        data: { url: '/', operation: 'click test button', socket: root },
        fun: xs.directToUrl
    }).run();

};

test.generatorFun = function (evt) {
    function* Task() {
        yield 1;
        yield 2;
        yield 3;
    }
    let task = Task();

    let result = task.next();
    while (result.done == false) {
        console.log(result.value);
        result = task.next();

    }



};
test.identify = function () {
    new xs.Task({
        msg: `identify`,
        fun: xs.identifyUser
    }).run();

};
test.Task = function () {
    let task0 = new xs.Task({
        msg: `task0`,
        fun: param => {
            let { task } = param;
            console.log(`task0`);
            task.finish({ str: "finish task 0" });
        }
    });
    let task1 = new xs.Task({
        msg: `task1`,
        preTasks: [task0],
        fun: param => {
            let { task } = param;
            console.log('task1');
            let arr = [11, 22, 33, 44, 55];
            task.finish({ arr: arr });


        }
    });
    let task2 = new xs.Task({
        msg: `task2`,
        preTasks: [task1],
        fun: param => {
            let { task, arr } = param;
            console.log('task2');
            for (let i = 0; i < arr.length; i++) {
                const num = arr[i];
                processOne(num, i);

            }
            task.finish({ x: 10 });

            function processOne(num, index) {
                let one = new xs.Task({
                    msg: `process ${index}`,
                    data: { number: num },
                    fun: param => {
                        let { task, number } = param;
                        console.log(num);
                        task.finish();
                    }
                });

            }
        }
    });
    let task3 = new xs.Task({
        msg: `task3`,
        preTasks: [task2],
        fun: param => {
            let { task } = param;
            console.log(`task3`);
            task.finish();
        }
    });
    task0.run();
};
//lib---------------------------------------------------



xs.redAlert = function redAlert(msg) {
    throw new Error(msg);
};
xs.yellowAlert = function (msg) {
    console.log(`%c${msg}`, 'background: #000000; color: #ffff00');
    console.trace();
};
xs.successHint = function (msg) {
    console.log(`%c ${msg}`, 'background: #222; color: #bada55');
};
xs.checkInit = function checkInit(param) {
    if (xs.init != undefined) {
        xs.init(param);
        xs.init = undefined;
    }
    else
        xs.redAlert(`init not define in ${param.currentfile}`);

};
xs.Task = class {
    constructor(param) {
        "use strict";
        let { msg, preTasks, fun, data } = param;
        xs.taskManager.add(this);
        xs.taskManager.collectChild(this);

        this.msg = msg;
        this.status = 'pending';
        this.fun = fun;

        this.input = {};
        this.output = {};

        this.postTasks = [];
        if (preTasks != undefined) {
            this.preTasks = [];
            this.addPreTask(preTasks);
            this.connect(this.preTasks);
        }
        if (data != undefined) {
            for (const key in data) {
                if (data[key] != undefined)
                    this.input[key] = data[key];
            }

        }
        this.input.task = this;

    }
    addPreTask(tasks) {
        for (let j = 0; j < tasks.length; j++) {
            const preTask = tasks[j];
            if (preTask != undefined) {
                let newIterate;
                if (Array.isArray(preTask))
                    newIterate = new addPreTask(preTask);
                if (typeof preTask === "string") {
                    let task = xs.taskManager.searchChildTask(preTask);
                    this.preTasks.push(task);
                }
                else {
                    this.preTasks.push(preTask);
                }
            }

        }
    }
    connect(preTasks) {
        for (let i = 0; i < preTasks.length; i++) {
            const preTask = preTasks[i];
            preTask.postTasks.push(this);
        }
    }

    run() {
        this.status = 'running';
        xs.taskManager.childTask.length = 0;
        this.fun(this.input);
    }
    finish(outputData) {
        "use strict";
        if (outputData != undefined) {
            this.result(outputData);
        }
        this.finishStep();
        if (xs.taskManager.childTask.length != 0) {
            this.addChild(xs.taskManager.childTask);
            let beginTasks = [];
            for (let i = 0; i < this.subTasks.length; i++) {
                const subTask = this.subTasks[i];
                if (subTask.preTasks == undefined) {
                    beginTasks.push(subTask);
                }
            }
            for (let i = 0; i < beginTasks.length; i++) {
                const beginTask = beginTasks[i];
                beginTask.run();
            }
        }
        else {
            this.sendResultToPostTask();
            this.clean();

        }

    }

    sendResultToPostTask() {
        for (let i = 0; i < this.postTasks.length; i++) {
            const postTask = this.postTasks[i];

            for (let key in this.output) {
                postTask.input[key] = this.output[key];
            }

            let index = postTask.preTasks.indexOf(this);
            postTask.preTasks.splice(index, 1);
            if (postTask.preTasks.length == 0) {
                postTask.preTasks = null;
                postTask.run();
            }

        }

    }
    result(obj) {
        for (let key in obj) {
            this.output[key] = obj[key];
        }
    }
    clean() {
        xs.taskManager.remove(this);
        this.msg = null;
        this.preTasks = null;
        this.postTasks = null;
        this.fun = null;

        if (this.parent != undefined) {
            this.parent.removeChild(this);
            this.parent = null;
        }
        this.input = null;
        this.output = null;

    }
    addChild(tasks) {
        if (this.subTasks == undefined) {
            this.subTasks = [];

        }
        for (let i = 0; i < tasks.length; i++) {
            const task = tasks[i];
            this.subTasks.push(task);
            task.parent = this;
        }

    }
    removeChild(task) {
        let index = this.subTasks.indexOf(task);
        this.subTasks.splice(index, 1);
        if (this.subTasks.length == 0) {
            this.sendResultToPostTask(this.result);
            this.clean();
        }

    }

    finishStep() {
        xs.getTaskLevel(this);
        let level = '';
        for (let i = 0; i < this.level; i++) {
            level += '--+';

        }
        console.log(`${level} ${this.msg}`);
    }


};
xs.getTaskLevel = function (task) {
    if (task.level == undefined)
        task.level = 0;

    searchLevel(task, task);
    function searchLevel(task, target) {
        if (target.parent != undefined) {
            task.level++;
            let newIterate = searchLevel(task, target.parent);
        }
    }

};
xs.TaskManager = class {
    constructor(param) {
        this.allTasks = [];//all
        this.childTask = []; //this is a cache use to collect childtasks,it will reset at the beginning of each task function 
    }
    add(task) {
        this.allTasks.push(task);
    }
    remove(task) {
        let index = this.allTasks.indexOf(task);
        this.allTasks.splice(index, 1);
        if (this.allTasks.length == 0)
            this.cleanCache();

    }
    collectChild(task) {
        this.childTask.push(task);
    }
    searchChildTask(taskname) {
        for (let i = 0; i < this.childTask.length; i++) {
            const task = this.childTask[i];
            if (taskname === task.msg)
                return task;
        }
        xs.redAlert(`can't find specific task`);
    }
    cleanCache() {
        this.allTasks.length = 0;
        this.childTask.length = 0;
    }
    abort(task) {
        task.status = 'abort';
        this.cleanCache();
    }

};



xs.getRoot = function () {
    return document.getElementsByClassName("Root")[0];
};
xs.initRoot = function () {
    "use strict";

    let xsroot = xs.getRoot();
    xs.generateElementId(xsroot);
    if (xsroot.root == undefined) {
        xsroot.root = xsroot;
        xsroot.childRoot = [];
        xsroot.cssComponents = [];
        xsroot.libs = [];
    }
    return xsroot;
};

xs.generateElementId = function (element) {
    if (xs.currentIndex == undefined)
        xs.currentIndex = 0;
    else
        xs.currentIndex++;
    element.a_id = xs.currentIndex;
};

//net---------------------
xs.sendRequest = function (obj) {//attempt change to obj parameter

    let { url, method, jsonObj, fun, type } = obj;
    if (type == undefined)
        type = "none";
    if (url == undefined) throw " need url to send request ";

    let xhttp = new XMLHttpRequest();
    if (method == undefined) method = "GET";
    xhttp.open(method, url, true);
    xhttp.setRequestHeader("x-requested-with", "XMLHttpRequest");

    if (method === "GET") {
        if (jsonObj != undefined)
            url += "?data=" + encodeURIComponent(JSON.stringify(jsonObj));
        xhttp.setRequestHeader("Content-Type", "text/plain");
        xhttp.send();
    } else if (method === "POST") {
        xhttp.setRequestHeader("Content-Type", "text/plain");

        xhttp.send(jsonObj);
    } else if (method === "PUT") {
        xhttp.setRequestHeader("Content-Type", "text/plain");
        xhttp.send(jsonObj);
    }
    else if (method === "DELETE") {
        xhttp.send();
    }
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            if (fun != undefined)
                fun(this.responseText);
            if (this.readyState == 4 && this.status == 500) {
                window.stop();
            }
        }

    };

};

xs.b64DecodeUnicode = function (str) {
    return decodeURIComponent(Array.prototype.map.call(atob(str), function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
};
xs.b64EncodeUnicode = function (str) {
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function (match, p1) {
        return String.fromCharCode(parseInt(p1, 16));
    }));
};

xs.directToUrl = function (param) {
    let { url, operation, socket } = param;
    new xs.Task({
        msg: `inform server`,
        data: param,
        fun: param => {
            let { url, operation } = param;
            let historyRec = { index: ++xs.historyLastIndex, operation: operation, url: url, time: xs.getCurrentTimeString() };

            let encode = xs.b64EncodeUnicode(url);
            xs.sendRequest({
                url: `/directToUrl/:${encode}`,
                method: "POST",
                jsonObj: JSON.stringify({ id: localStorage.getItem("id"), history: historyRec }),
                fun: function (userdataStr) {
                    let parsedUserInfo = JSON.parse(userdataStr);
                    localStorage.setItem('currentView', parsedUserInfo.currentView);
                    localStorage.setItem('currentUrl', parsedUserInfo.currentUrl);
                    localStorage.setItem('currentMenu', parsedUserInfo.currentMenu);
                    if (operation != "backOrForward") {
                        xs.changeUrl(parsedUserInfo.currentUrl);
                    }

                    param.task.finish({ file: parsedUserInfo.currentView });
                }
            });
        }
    });
    new xs.Task({
        msg: `load new page`,
        preTasks: ["inform server"],
        data: { socket: socket },
        fun: xs.loadNewPage
    });



    param.task.finish();

};
xs.changeUrl = function (url) {
    window.history.pushState({ index: ++xs.historyLastIndex, url: `${url}` }, "Title", `${url}`);
};

xs.loadNewPage = function (param) {
    new xs.Task({
        msg: "prepare",
        data: param,
        fun: param => {
            let { socket } = param;
            xs.stopAllAnimation(socket.currentPlug);
            xs.removeAllLibs(socket.currentPlug);
            param.task.finish();
        },
    });
    new xs.Task({
        msg: `add new `,
        preTasks: ["prepare"],
        data: { file: param.file, element: param.socket, plug: "new", data: param.sendData },
        fun: xs.addNew

    });
    new xs.Task({
        msg: `swapPage`,
        preTasks: [`add new `],
        data: { socket: param.socket },
        fun: xs.swapPage
    });

    param.task.finish();

};


xs.identifyUser = function (param) {

    let id = localStorage.getItem('id');
    let language = localStorage.getItem('language');
    let currentMenu = localStorage.getItem('currentMenu');
    let currentUrl = window.location.pathname;
    let historyRecord = { index: 0, operation: "loginSystem", time: xs.getCurrentTimeString() };
    let userInfo = { id: id, currentUrl: currentUrl, currentMenu: currentMenu, language: language, history: historyRecord };

    initUserHistory();
    xs.sendRequest({
        url: "/identify",
        method: "PUT",
        jsonObj: JSON.stringify(userInfo),
        fun: function (userInfo) {
            let parsedUserInfo = JSON.parse(userInfo);
            updateLocal(parsedUserInfo);
            addListenerToBackAndForward();
            replaceUrl(parsedUserInfo.currentUrl);

            param.task.finish();
        }
    });



    function updateLocal(userInfo) {
        localStorage.setItem("id", userInfo.id);
        localStorage.setItem("language", userInfo.language);
        localStorage.setItem("currentView", userInfo.currentView);
        localStorage.setItem("currentUrl", userInfo.currentUrl);
        localStorage.setItem("currentMenu", userInfo.currentMenu);
    }
    function initUserHistory() {
        xs.historyLastIndex = 0;
        xs.historyMaxRecordNum = 5;//history number record in localstorage
    }
    function replaceUrl(url) {
        window.history.replaceState({ index: window.historyLastIndex, url: `${url}` }, "title", `${url}`);

    }
    function addListenerToBackAndForward() {
        window.onpopstate = function (event) {
            let url = event.state.url;
            let operation = "backOrForward";
            xs.directToUrl({ url: event.state.url, operation: operation });
        };
    }
};

xs.getCurrentTimeString = function () {
    let d = new Date();
    d.setTime(d.getTime());
    return d.toUTCString();
};


xs.XtranslateAll = function (preTasks, root) {
    let task1 = new xs.Task({
        msg: 'translate All',
        fun: param => {
            let { task } = param;
            let allTranslateNode = [];
            findAllTranslateNode(root, allTranslateNode);
            for (let i = 0; i < allTranslateNode.length; i++) {
                const textNode = allTranslateNode[i];
                one = translateOne(textNode, `USA`);
                task.addChild([one]);
                task.finish(null);
            }
        }
    });
    function translateOne(textNode, currentlanguage) {

        let index = textNode.translateIndex;
        let type = textNode.dataset.translate;
        let task = new xs.Task({
            msg: `translate:${index}`,
            fun: (param) => {
                let { task } = param;
                xs.sendRequest({
                    url: `/get${type}Text/:${encodeURI(index)}/${currentlanguage}`, fun: function (translated) {
                        let decoded;
                        if (type === "Content")
                            decoded = xs.b64DecodeUnicode(translated);
                        else decoded = decodeURI(translated);
                        textNode.innerHTML = decoded;
                        task.finish(null);
                    }
                });
            },

        });
        return task;

    }
};
xs.translateAll = function (preTaskGroup, root) {

    let allTranslateNode = [];
    findAllTranslateNode(root, allTranslateNode);

    let taskGroup = new xs.TaskGroup({ name: 'translate All', preTaskGroup: preTaskGroup });
    for (let i = 0; i < allTranslateNode.length; i++) {
        const textNode = allTranslateNode[i];
        translateOne(textNode, `USA`);
    }
    allTranslateNode = null;
    return taskGroup;
    function translateOne(textNode, currentlanguage) {

        let index = textNode.translateIndex;
        let type = textNode.dataset.translate;
        let task = new xs.Task({
            msg: `translate:${index}`,
            fun: (param) => {
                let { task } = param;
                xs.sendRequest({
                    url: `/get${type}Text/:${encodeURI(index)}/${currentlanguage}`, fun: function (translated) {
                        let decoded;
                        if (type === "Content")
                            decoded = xs.b64DecodeUnicode(translated);
                        else decoded = decodeURI(translated);
                        textNode.innerHTML = decoded;
                        task.finish(null);
                    }
                });
            },
            taskGroup: taskGroup
        });

    }
    function findAllTranslateNode(element, allTranslateNode) {

        for (let i = 0; i < element.childNodes.length; i++) {
            const child = element.childNodes[i];
            if (isTranslateNode(child)) {
                allTranslateNode.push(child);
                if (child.translateIndex == undefined)
                    child.translateIndex = child.innerHTML;
            }
            let newIterate;
            if (child.childNodes.length != 0)
                newIterate = new findAllTranslateNode(child, allTranslateNode);
        }
    }
    function isTranslateNode(element) {
        if (element.nodeName === "SPAN" && element.dataset.translate != undefined)
            return true;
        if (element.nodeName === "BUTTON" && element.dataset.translate != undefined)
            return true;
        return false;
    }


};


xs.swapPage = function (param) {
    let { socket } = param;
    xs.hide(socket.currentPlug);
    xs.hang(socket.currentPlug);
    xs.insert(socket.newPlug);
    xs.show(socket.newPlug);


    xs.stopAllTimer(socket.currentPlug);
    xs.removeAllListener(socket.currentPlug);



    xs.removeOldCss(socket.currentPlug);
    xs.disconnectPlug(socket.currentPlug);

    socket.currentPlug = socket.newPlug;
    socket.newPlug = null;


    window.focus();
    xs.checkUrlContentMatch();

    param.task.finish();
    console.log("----------document process complete---------");

};
/**
 * 
 * @param file
 * @param element
 * @param plug
 */
xs.addNew = function (param) {
    "use strict";
    // let { id, styles, data, element, file, cssfiles, plug } = param;
    new xs.Task({
        msg: `build primitive`,
        data: param,
        fun: param => {
            let { file, element, styles, plug, id } = param;
            let shortName = file.slice(file.lastIndexOf("/") + 1);
            if (styles == undefined) {
                styles = [`${shortName}Box`];
            }

            let div = xs.aDiv({ id: id, styles: styles });
            div.dataset.file = `${file}`;//**debug
            //plugable
            if (plug == undefined) {
                element.appendChild(div);
                div.root = element.root;
            }
            else {
                if (div.cssComponents == undefined)
                    div.cssComponents = [];
                if (div.childRoot == undefined)
                    div.childRoot = [];
                if (div.timers == undefined)
                    div.timers = [];
                if (div.event == undefined)
                    div.event = [];
                if (div.libs == undefined)
                    div.libs = [];
                div.root = div;
                element.root.childRoot.push(div);
                if (plug === "current") {
                    element.appendChild(div);
                    element.currentPlug = div;
                } else if (plug === "new") {
                    element.insertBefore(div, element.currentPlug);
                    element.newPlug = div;
                    xs.hide(div);
                    xs.hang(div);
                }
            }
            param.task.finish({ div: div });
        }
    });

    new xs.Task({
        msg: `add needed css`,
        preTasks: [`build primitive`],
        data: param,
        fun: param => {
            let { div, file, cssfiles, element, plug } = param;
            if (cssfiles == undefined)
                cssfiles = [];
            cssfiles.push(file);
            for (let i = 0; i < cssfiles.length; i++) {
                const css = cssfiles[i];
                new xs.Task({
                    msg: `addCss:${css}`,
                    data: { css: css, element: element, plug: plug, div: div },
                    fun: addOneCss
                });

            }

            param.task.finish();
        }
    });

    new xs.Task({
        msg: `loadHtml:${param.file}`,
        preTasks: [`build primitive`, `add needed css`],
        data: param,
        fun: param => {
            let { div, file } = param;
            xs.fileExist(file, "html", function (isExist) {
                if (isExist === "yes") {
                    xs.sendRequest({
                        url: `/readHtmlFile${file}`, fun: function (htmlStr) {
                            div.innerHTML = htmlStr;
                            addrootToHtmlDiv(div);
                            param.task.finish({ htmlLoadOk: true });

                        }
                    });
                } else {
                    param.task.finish({ htmlLoadOk: false });
                }

            });
        }
    });



    new xs.Task({
        msg: `loadJs:${param.file}`,
        preTasks: [
            `build primitive`,
            `loadHtml:${param.file}`,
            `add needed css`
        ],
        data: param,
        fun: (param) => {
            let { task, htmlLoadOk, div, file, sendData } = param;

            xs.fileExist(file, "js", function (isExist) {
                if (isExist === "yes") {
                    xs.addScript(`${file}.js`, function (script) {
                        script.parentNode.removeChild(script);
                        xs.checkInit({ parent: div, data: param.data, currentfile: file });

                        task.finish(null);
                    });
                } else {
                    if (htmlLoadOk == true)
                        xs.yellowAlert(`${file}.js not exist.`);
                    else
                        xs.yellowAlert(`both ${file}(js/html) not exist.`);
                    task.finish(null);
                }
            });
        }

    });
    // let collectTranslateNodes = xs.collectTranslateNode([prepare, loadJs], file);
    param.task.finish();

    function addOneCss(param) {
        let { div, css, element, plug } = param;
        if (!isNeededCss(css, element, plug))
            return;
        xs.fileExist(css, "css", function (isExist) {
            if (isExist === "yes") {
                addCSS(css, function (cssLink) {
                    let cssComponent = { name: css, ref: cssLink };
                    div.root.cssComponents.push(cssComponent);
                    param.task.finish(null);
                });
            }
            else {
                param.task.finish(null);
            }
        });
    }
    function addCSS(neededCss, fun) {
        let cssName = neededCss + ".css";
        let cssLink = document.createElement("link");
        cssLink.setAttribute("rel", "stylesheet");
        cssLink.setAttribute("type", "text/css");
        cssLink.setAttribute("href", cssName);
        cssLink.onload = function (evt) {
            if (fun != undefined)
                fun(cssLink);
        };
        document.getElementsByTagName("head")[0].appendChild(cssLink);
    }



    function isNeededCss(css, element, plug) {
        let skiproot;

        if (plug === "new") {
            skiproot = [element.currentPlug];
        } else {
            skiproot = null;
        }
        xs.iterateRoots({
            root: xs.getRoot(),
            fun: root => {
                for (let i = 0; i < root.cssComponents.length; i++) {
                    const cssComponent = root.cssComponents[i];
                    if (css === cssComponent.name)
                        return false;
                }
            },
            skip: skiproot
        });


        return true;
    }

    function addrootToHtmlDiv(div) {

        let allChildDiv = div.getElementsByTagName("DIV");
        for (let i = 0; i < allChildDiv.length; i++) {
            const childDiv = allChildDiv[i];
            childDiv.root = div.root;
        }

    }
};








xs.fileExist = function (filePath, filetype, fun) {
    xs.sendRequest({
        url: `/fileExist${filePath}/${filetype}`, fun: function (isExist) {
            fun(isExist);

        }
    });
};
xs.iterateRoots = function (params) {
    let { root, fun, skip } = params;
    fun(root);
    if (root.childRoot != undefined) {
        for (let j = 0; j < root.childRoot.length; j++) {
            const childRoot = root.childRoot[j];
            let newIterate;
            if (!isSkipRoot(childRoot, skip))
                newIterate = new xs.iterateRoots({ root: childRoot, fun: fun });
        }
    }
    function isSkipRoot(root, skipArr) {
        if (skipArr != undefined) {
            for (let k = 0; k < skipArr.length; k++) {
                const skiproot = skipArr[k];
                if (skiproot != undefined) {
                    if (skiproot == root)
                        return true;
                }
            }
            return false;
        }
        return false;
    }
};



xs.stopAllAnimation = function (plug) {
    if (plug == undefined)
        return;
    console.log("stop animation in old plug!");
    xs.iterateRoots({
        root: plug,
        fun: function (root) {
            root.animateable = false;
        }
    });

};

xs.removeAllLibs = function (plug) {
    if (plug == undefined)
        return;
    xs.iterateRoots({
        root: plug,
        fun: function (root) {
            for (let i = 0; i < root.libs.length; i++) {
                const lib = root.libs[i];
                window[lib.nameSpace] = null;
            }
        }
    });
};
xs.addScript = function (file, fun) {
    let script = document.createElement('script');
    script.setAttribute("type", "text/javascript");
    script.setAttribute("src", file);
    script.onload = function (evt) {
        fun(script);
    };
    document.getElementsByTagName("head")[0].appendChild(script);
};




xs.aDiv = function (param) {
    let { id, parent, styles, childs, data } = param;
    let div = xs.createElement(id, 'div');
    xs.generateElementId(div);
    xs.addStyle(div, styles);

    if (parent != undefined) {
        parent.appendChild(div);
        div.root = parent.root;
    }
    xs.addChild(div, childs);
    xs.addTouch(div, param);
    if (data != undefined) {
        div.data = data;
    }
    return div;
};
xs.addStyle = function (element, styleArr) {
    if (styleArr == undefined) {
        //         console.log("style not defined");
        return;
    }
    for (let i = 0; i < styleArr.length; i++) {
        const style = styleArr[i];
        if (style == undefined)
            continue;
        if (style === "")
            continue;
        element.classList.add(style);
    }
};

xs.addChild = function (element, childArr) {
    if (childArr == undefined || childArr.length == 0)
        return;
    for (let i = 0; i < childArr.length; i++) {
        const child = childArr[i];
        if (Array.isArray(child) == true) {
            let newIterate = new xs.addChild(element, child);
        } else {
            if (childArr[i] != undefined)
                element.appendChild(child);

            if (element.root == undefined) {
                if (element.followerList == undefined)
                    element.followerList = [];
                if (child != undefined)
                    element.followerList.push(child);
            }
            else {
                if (child != undefined)
                    child.root = element.root;
                if (child.followerList != undefined) {
                    for (let i = 0; i < child.followerList.length; i++) {
                        const follower = child.followerList[i];
                        follower.root = element.root;
                    }
                    child.followerList = null;
                }


            }
        }

    }

};

xs.createElement = function (idStr, elementType) {
    let element;
    if (idStr != undefined) {
        element = document.getElementById(idStr);
        if (element == null)
            element = document.createElement(elementType);
        else {
            if (element.nodeName === elementType.toUpperCase()) {
                return element;
            }

            else {
                throw "id conflict";

            }
        }
        element.id = idStr;
    } else {
        element = document.createElement(elementType);
    }

    return element;
};

xs.addTouch = function (element, obj) {
    let { onMouseover, onMouseout, onClick } = obj;
    if (onMouseover != undefined)
        element.addEventListener("mouseover", function (evt) {
            onMouseover(evt);
            evt.stopPropagation();
        }, false);
    if (onMouseout != undefined)
        element.addEventListener("mouseout", function (evt) {
            onMouseout(evt);
            // evt.stopPropagation();
        }, false);
    if (onClick != undefined)
        element.addEventListener("click", function (evt) {
            onClick(evt);
            evt.stopPropagation();
        }, false);

};
xs.hang = function (plug) {
    if (plug == undefined)
        return;
    plug.style.position = "fixed";
};
xs.insert = function (plug) {
    if (plug == undefined)
        return;
    plug.style.position = "static";
};

xs.show = function (element) {
    if (element == undefined)
        return;
    if (element.show == true)
        return;
    element.style.visibility = "visible";
    element.show = true;
};
xs.hide = function (element) {
    if (element == undefined)
        return;
    element.style.visibility = "hidden";
    element.show = false;
};

xs.checkUrlContentMatch = function () {
    let decodedUrl = decodeURI(window.location.pathname);
    let decodedActualUrl = decodeURI(localStorage.getItem('currentUrl'));
    if (decodedUrl !== decodedActualUrl) {
        xs.directToUrl({ url: window.location.pathname, operation: "correct url mismatch caused by quick user click " });
    }
};

xs.stopAllTimer = function (plug) {
    console.log("stop timer in old plug!");
    if (plug != undefined) {
        xs.iterateRoots({
            root: plug,
            fun: (root) => {
                for (let i = 0; i < root.timers.length; i++) {
                    const timer = root.timers[i];
                    timer.stop();
                }
            }
        });

    }
};
xs.removeOldCss = function (plug) {
    if (plug == undefined)
        return;
    xs.iterateRoots({
        root: plug,
        fun: (root) => {
            for (let i = 0; i < root.cssComponents.length; i++) {
                const cssComponent = root.cssComponents[i];
                cssComponent.ref.parentNode.removeChild(cssComponent.ref);
                cssComponent.ref = null;
            }
            root.cssComponents = null;
        }
    });

};


xs.removeAllListener = function (plug) {
    if (plug != undefined) {
        xs.iterateRoots({
            root: plug,
            fun: function (root) {
                for (let i = 0; i < root.event.length; i++) {
                    const info = root.event[i];
                    info.element.removeEventListener(info.event, info.fun);
                }
            }
        });

    }
};
xs.addListenerToElement = function (parent, info) {
    info.element.addEventListener(info.event, info.fun, false);
    parent.root.event.push(info);
};


xs.disconnectPlug = function (plug) {
    if (plug != undefined) {
        let index = plug.parentNode.root.childRoot.indexOf(plug);
        plug.parentNode.root.childRoot.splice(index, 1);
        plug.parentNode.removeChild(plug);
    }
};
xs.removeOldCss = function (plug) {
    if (plug == undefined)
        return;
    xs.iterateRoots({
        root: plug,
        fun: (root) => {
            for (let i = 0; i < root.cssComponents.length; i++) {
                const cssComponent = root.cssComponents[i];
                cssComponent.ref.parentNode.removeChild(cssComponent.ref);
                cssComponent.ref = null;
            }
            root.cssComponents = null;
        }
    });

};

xs.addLibs = function (param) {
    let { files, div } = param;
    for (let index = 0; index < files.length; index++) {
        const file = files[index];
        // xs.addLib({ file: file, div: div });
        new xs.Task({
            msg: `load one lib:${file}`,
            data: { file: file, div: div },
            fun: xs.addLib
        });
    }

    param.task.finish();
};

xs.addLib = function (param) {
    let { file, div } = param;
    xs.fileExist(file, "js", function (isExist) {
        if (isExist === "yes") {
            xs.addScript(`${file}.js`, function (script) {
                script.parentNode.removeChild(script);
                let lib = { name: file };
                lib.nameSpace = window.currentNamespace;
                window.currentNamespace = null;
                div.root.libs.push(lib);
                param.task.finish();
            });
        } else {
            xs.redAlert(`file not exist: ${file}`);

        }
    });

};

xs.getElement = function (parent, className) {
    let element = parent.getElementsByClassName(className)[0];
    if (element == null)
        xs.redAlert(`can't find element ${className}`);
    return element;
};
//webgl
defineLib('webgl');
webgl.loadPrograms = function (param) {
    let { files } = param;
    let programs = { total: files.length };
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        new xs.Task({
            msg: `load program${file}`,
            data: { file: file, gl: param.gl, programs: programs },
            fun: webgl.loadOneProgram
        });
    }
    webgl.programs = programs;
    // param.task.finish({ programs: programs });
    param.task.finish();

};
webgl.loadOneProgram = function (param) {
    'use strict';
    new xs.Task({
        msg: `getVertexShader`,
        data: { type: '.vert', file: param.file },
        fun: webgl.getShaderSrc
    });

    new xs.Task({
        msg: `getFragShader`,
        data: { type: '.frag', file: param.file },
        fun: webgl.getShaderSrc
    });

    new xs.Task({
        msg: `combine`,
        preTasks: [`getVertexShader`, `getFragShader`],
        data: param,
        fun: param => {
            let { file, vertsrc, fragsrc, gl, programs } = param;
            let nameArr = file.split('/');
            if (nameArr[0] === "")
                nameArr.splice(0, 1);
            let fullName = `${nameArr[nameArr.length - 2]}-${nameArr[nameArr.length - 1]}`;
            // for (let j = 0; j < nameArr.length; j++) {
            //     const name = nameArr[j];
            //     fullName += name;
            //     if (j != nameArr.length - 1)
            //         fullName += '-';
            // }
            programs[fullName] = webgl.createProgram(gl, vertsrc, fragsrc, fullName);
            param.task.finish();
        }
    });
    param.task.finish();
};


webgl.getShaderSrc = function (param) {
    let { file, type } = param;
    let shaderFilePath = file + type;
    let encodeFileName = xs.b64EncodeUnicode(shaderFilePath);
    xs.sendRequest({
        url: `/getShader/:${encodeFileName}`,
        fun: function (loadedShader) {
            if (type === ".vert")
                param.task.finish({ vertsrc: loadedShader });
            else if (type === ".frag")
                param.task.finish({ fragsrc: loadedShader });

        }
    });
};

webgl.createProgram = function (gl, vertexCode, fragCode, name) {
    let program = cuon.createProgram(gl, vertexCode, fragCode);
    if (program == null)
        xs.redAlert(`failed create program`);
    program.name = name;
    return program;
};
webgl.loadImgs = function (param) {
    let { imgs } = param;
    let imglib = { total: imgs.length };
    for (let i = 0; i < imgs.length; i++) {
        const img = imgs[i];
        new xs.Task({
            msg: `loadImg:${img}`,
            data: { imgPath: img, imglib: imglib },
            fun: webgl.loadOneImg
        });

    }
    webgl.imgs = imglib;
    param.task.finish();

};
webgl.loadOneImg = function (param) {
    let { imgPath, imglib } = param;
    let img = new Image();
    img.src = imgPath;
    let shortName = imgPath.slice(imgPath.lastIndexOf("/") + 1, imgPath.indexOf("."));
    let type = imgPath.slice(imgPath.indexOf(".") + 1);
    img.onload = function () {
        imglib[`${shortName}_${type}`] = img;
        param.task.finish();
    };


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
    vertexBuffer.num = pointNum;
    vertexBuffer.span = verticeData.length / pointNum;
    vertexBuffer.FSIZE = verticeData.BYTES_PER_ELEMENT;

    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    return vertexBuffer;
};
webgl.createIndiceBuf = function (gl, param) {
    let { name, indiceData } = param;
    let indiceBuf = gl.createBuffer();
    if (!indiceBuf) {
        xs.redAlert('Failed to create the buffer object');
        return;
    }
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indiceBuf);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indiceData, gl.STATIC_DRAW);
    indiceBuf.num = indiceData.length;
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    return indiceBuf;
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
webgl.getTextureLocation = function (gl, program, useTextures) {
    for (let i = 0; i < useTextures.length; i++) {
        const useTexture = useTextures[i];
        useTexture.location = gl.getUniformLocation(program, useTexture.name);
        if (!useTexture.location) {
            xs.redAlert(`Failed to get the location of ${useTexture.name}`);
            return;
        }
    }
};


webgl.changeChannelTexture2D = function (gl, channel, texture) {
    gl.activeTexture(gl[`TEXTURE${channel}`]);
    gl.bindTexture(gl.TEXTURE_2D, texture);
};

webgl.connectTexture = function (gl, part) {
    if (part.useTextures != undefined) {
        for (let i = 0; i < part.useTextures.length; i++) {
            const info = part.useTextures[i];
            webgl.changeChannelTexture2D(gl, info.channel, info.texture);
            gl.uniform1i(info.location, info.channel);

        }
    }
};
webgl.connectIndice = function (gl, part) {
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, part.indice);
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



webgl.Camera = class {
    constructor() {
        this.matrix = new cuon.Matrix4();
        this.pMatrix = new cuon.Matrix4();
        this.vMatrix = new cuon.Matrix4();

    }
    setName(name) {
        this.name = name;
    }
    setLookAt(eyeX, eyeY, eyeZ, atX, atY, atZ, upX, upY, upZ) {
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

    }
    setOrtho(left, right, bottom, top, near, far) {
        this.left = left;
        this.right = right;
        this.bottom = bottom;
        this.top = top;
        this.near = near;
        this.far = far;
        this.buildOrthoPMatrix();
    }
    setPerspective(fov, aspect, near, far) {
        this.fov = fov;
        this.aspect = aspect;
        this.near = near;
        this.far = far;
        this.buildPerspectivePMatrix();
    }
    buildVMatrix() {
        this.vMatrix.setLookAt(this.eyeX, this.eyeY, this.eyeZ, this.atX, this.atY, this.atZ, this.upX, this.upY, this.upZ);
        this.matrix.set(this.pMatrix).multiply(this.vMatrix);
    }
    buildOrthoPMatrix() {
        this.pMatrix.setOrtho(this.left, this.right, this.bottom, this.top, this.near, this.far);
        this.matrix.set(this.pMatrix).multiply(this.vMatrix);
    }
    buildPerspectivePMatrix() {
        this.pMatrix.setPerspective(this.fov, this.aspect, this.near, this.far);
        this.matrix.set(this.pMatrix).multiply(this.vMatrix);
    }
};
webgl.setName = function (obj, name) {
    obj.name = name;
};
// webgl.StageManager = class {
//     constructor() {
//         webgl.stageManager = this;
//         this.stages = [];

//     }
//     addStage(stage) {
//         this.stages.push(stage);
//     }
//     addAnimation(animation) {
//         this.animation = animation;
//     }
// }
webgl.Stage = class {
    constructor(imgs, programs) {
        // this.canvas = canvas;
        // this.gl = gl;
        webgl.animation.stage = this;
        this.imgs = imgs;
        this.programs = programs;

        this.ontop = [];
        this.objs = [];

        this.camera = null;
        this.mvpMatrix = new cuon.Matrix4();


    }


    clear() {
        let gl = webgl.gl;
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);   // Clear <canvas>
        gl.enable(gl.POLYGON_OFFSET_FILL);
        //                 gl.enable(gl.POLYGON_OFFSET_LINE);
    }
    useCamera(camera) {
        this.camera = camera;
        this.camera.init();
    }
    addChild(obj) {

        obj.init();

        webgl.initParts(obj.parts);


        if (obj.ontop != undefined) {
            let insertIndex = this.ontop.length;
            for (let i = 0; i < this.ontop.length; i++) {
                const o = this.ontop[i];
                if (obj.ontop < o.ontop)
                    insertIndex = i - 1;
            }
            this.ontop.splice(insertIndex, 0, obj);
        }
        else
            this.objs.push(obj);
    }

    render(elapsed) {

        for (let i = 0; i < this.objs.length; i++) {
            const obj = this.objs[i];
            // if (obj.ontop == true)
            //     gl.clear(gl.DEPTH_BUFFER_BIT);
            webgl.renderParts(obj.parts, elapsed);

        }
        for (let i = 0; i < this.ontop.length; i++) {
            const obj = this.ontop[i];
            webgl.gl.clear(webgl.gl.DEPTH_BUFFER_BIT);
            webgl.renderParts(obj.parts, elapsed);

        }
    }
    clean() {
        this.camera = null;
        this.cleanGroup(this.objs);
        this.cleanGroup(this.ontop);
    }
    cleanGroup(group) {
        for (let i = 0; i < group.length; i++) {
            const obj = group[i];
            obj.clean();
        }
    }


};
webgl.mvpGeneralFun = function mvpGeneralFun(gl, part) {
    let stage = webgl.animation.stage;
    stage.mvpMatrix.set(stage.camera.matrix).multiply(part.matrix);
    gl.uniformMatrix4fv(part.uniforms.MVP.location, false, stage.mvpMatrix.elements);
};

webgl.Animation = class {
    constructor(param) {
        let { frameRate } = param;
        webgl.animation = this;
        this.frameRate = frameRate;

    }


    begin(parent, stage) {
        this.parent = parent;
        this.stage = stage;

        this.last = Date.now();
        this.loop();
    }
    loop() {
        let animation = webgl.animation;
        if (animation.parent.root.animateable == false) {
            animation.clean();

            return;
        }

        animation.id = requestAnimationFrame(animation.loop);
        let now = Date.now();
        let elapsed = now - animation.last; // milliseconds
        if (elapsed < 1000 / animation.framerate)
            return;
        animation.last = now;

        animation.stage.clear();
        animation.stage.render(elapsed);
    }
    clean() {
        cancelAnimationFrame(this.id);

        this.parent = null;
        this.stage.clean();
        this.stage = null;

        webgl.animation = null;
        webgl.gl = null;
        webgl.imgs = null;
        // this.removeGPUPrograms();
        webgl.programs = null;
    }

};


webgl.initParts = function (parts) {
    for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        if (part.init != undefined)
            part.init(part.data);
    }
};
webgl.renderParts = function (parts, elapsed) {
    for (let j = 0; j < parts.length; j++) {
        const part = parts[j];
        webgl.gl.useProgram(part.program);

        if (part.update != undefined) part.update(elapsed);

        webgl.connectAttributes(webgl.gl, part);
        webgl.connectIndice(webgl.gl, part);
        webgl.connectUniforms(webgl.gl, part);
        webgl.connectTexture(webgl.gl, part);

        // if (part.polygonOffset != undefined) {
        //     gl.polygonOffset(part.polygonOffset.factor, part.polygonOffset.unit); // Set the polygon offset
        // }
        // else {
        //     gl.polygonOffset(1, 100);
        // }
        webgl.drawPart(webgl.gl, part);

    }
};

webgl.drawPart = function (gl, part) {
    if (part.indice == undefined) {
        gl.drawArrays(part.primitiveType, part.first, part.count); //POINTS//TRIANGLES//TRIANGLE_STRIP
    } else {
        gl.drawElements(part.primitiveType, part.count, part.indiceDataType, part.offset);
    }
};
webgl.Obj = class {
    constructor() {
        this.buffers = {};
        this.textures = {};
        this.parts = [];
    }
    addBuffer(param) {
        let { name, verticeData, pointNum } = param;
        let buffer = webgl.createVertexBuf(webgl.gl, param);
        this.buffers[name] = buffer;
    }
    addIndice(param) {
        let { name, indiceData } = param;
        let buffer = webgl.createIndiceBuf(webgl.gl, param);
        this.buffers[name] = buffer;
    }
    addTexBuffer(param) {
        let { name, channel, img, texParam } = param;
        let buffer = webgl.createTextureBuffer(webgl.gl, 0, img, texParam);
        this.textures[name] = buffer;
    }
    addPart(part) {
        part.parent = this;
        this.parts.push(part);
        this.createPart(part);
    }
    clean() {
        this.stage = null;
        this.name = null;
        this.cleanParts();
        this.removeGPUTexture();
        this.removeGPUBuffer();
        this.parts = null;
        this.buffers = null;
        this.textures = null;


    }
    cleanParts() {
        for (let i = 0; i < this.parts.length; i++) {
            const part = this.parts[i];
            part.program = null;
            part.uniform = null;
            part.attributes = null;
            part.useTextures = null;
            part.init = null;
            part.update = null;
        }
    }
    removeGPUTexture() {
        for (let i = 0; i < this.textures.length; i++) {
            const texture = this.textures[i];
            webgl.gl.deleteTexture(texture);
        }
    }
    removeGPUBuffer() {
        for (let i = 0; i < this.buffers.length; i++) {
            const buffer = this.buffers[i];
            webgl.gl.deleteBuffer(buffer);
        }
    }
    setName(name) {
        this.name = name;
    }


    // setPart(gl, parts) {
    //     for (let i = 0; i < parts.length; i++) {
    //         const part = parts[i];
    //         this.createPart(gl, part);
    //     }
    //     this.parts = parts;
    // }
    createPart(part) {
        part.matrix = new cuon.Matrix4();

        if (part.indice == undefined) {
            if (part.first == undefined) part.first = 0;
            if (part.count == undefined) part.count = part.attributes[0].buffer.num;
        }
        else {
            if (part.offset == undefined) part.offset = 0;
            if (part.count == undefined) part.count = part.indice.num;
            if (part.indiceDataType == undefined) part.indiceDataType = webgl.gl.UNSIGNED_BYTE;
        }
        if(part.program==undefined)
        xs.redAlert("specified  program is  not found ");
        webgl.getUniformLocation(webgl.gl, part.program, part.uniforms);
        webgl.getAttribLocation(webgl.gl, part.program, part.attributes);
        if (part.useTextures != undefined)
            webgl.getTextureLocation(webgl.gl, part.program, part.useTextures);

    }


};


// webgl.Part = class {

//     setProgram(program) {
//         this.program = program;
//     }
//     setPrimitiveType(type) {
//         this.primitiveType = type;
//     }
//     setUniform(uniforms) {
//         this.uniforms = uniforms;
//     }
//     setAttributes(attributes) {
//         this.attributes = attributes;
//     }
//     setIndice(buffer) {
//         this.indice = buffer;
//     }
//     setInit(fun) {
//         this.init = fun;
//     }
//     setUpdate(fun) {
//         this.update = fun;
//     }
//     setMaterial(fun) {
//         this.material = fun;
//     }
// };

// webgl.Texture = class {
//     constructor(param) {
//         let { channel, buffer, sampler } = param;
//         this.channel = channel;
//         this.buffer = buffer;
//         this.sampler = sampler;
//     }
// };
// webgl.Attributes = class {
//     constructor(param) {
//         let { name, dataAmount, beginIndex, buffer } = param;
//         this.name = name;
//         this.dataAmount = dataAmount;
//         this.beginIndex = beginIndex;
//         this.buffer = buffer;
//     }
// };

// webgl.Uniform = class {
//     constructor(param) {
//         let { name, fun } = param;
//         this.name = name;
//         this.fun = fun;
//     }
// };

