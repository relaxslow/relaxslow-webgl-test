

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
            searchLevel(task, target.parent);
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
                if (div.animations == undefined) {
                    div.animations = [];
                }
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
        xs.iterateRoots(
            xs.getRoot(),
            function (root) {
                for (let i = 0; i < root.cssComponents.length; i++) {
                    const cssComponent = root.cssComponents[i];
                    if (css === cssComponent.name)
                        return false;
                }
            },
            skiproot
        );


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
xs.iterateRoots = function (root, fun, skipArr) {
    if (!xs.isSkipRoot(root, skipArr)) {
        fun(root);
        if (root.childRoot != undefined) {
            for (let j = 0; j < root.childRoot.length; j++) {
                const childRoot = root.childRoot[j];
                xs.iterateRoots(childRoot, fun, skipArr);
            }
        }
    }



};
xs.isSkipRoot = function (root, skipArr) {
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
};


xs.stopAllAnimation = function (plug) {
    if (plug == undefined)
        return;
    console.log("stop animation in old plug!");
    xs.iterateRoots(
        plug,
        function (root) {
            for (let i = 0; i < root.animations.length; i++) {
                const animation = root.animations[i];
                animation.clean();
            }
            root.animations = null;
        }
    );

};

xs.removeAllLibs = function (plug) {
    if (plug == undefined)
        return;
    xs.iterateRoots(
        plug,
        function (root) {
            for (let i = 0; i < root.libs.length; i++) {
                const lib = root.libs[i];
                window[lib.nameSpace] = null;
            }
            root.libs = null;
        }
    );
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
        xs.iterateRoots(
            plug,
            function (root) {
                for (let i = 0; i < root.timers.length; i++) {
                    const timer = root.timers[i];
                    timer.stop();
                }
                root.timers = null;
            }
        );

    }
};



xs.removeAllListener = function (plug) {
    if (plug != undefined) {
        xs.iterateRoots(
            plug,
            function (root) {
                for (let i = 0; i < root.event.length; i++) {
                    const info = root.event[i];
                    info.element.removeEventListener(info.event, info.fun);
                }
                root.event = null;
            }
        );

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
    xs.iterateRoots(
        plug,
        function (root) {
            for (let i = 0; i < root.cssComponents.length; i++) {
                const cssComponent = root.cssComponents[i];
                cssComponent.ref.parentNode.removeChild(cssComponent.ref);
                cssComponent.ref = null;
            }
            root.cssComponents = null;
        }
    );

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
    let { files, gl } = param;
    let programs = {};
    for (let i = 0; i < files.length; i++) {
        const file = files[i];

        if (file.vert != undefined && file.frag != undefined) {
            new xs.Task({
                msg: `load program${file.vert}`,
                data: { vert: file.vert, frag: file.frag, programs: programs },
                fun: webgl.loadOneProgram
            });
        }
        else {
            xs.redAlert("must define both vert and frag src file path");
        }
    }
    param.task.finish({ programs: programs });

};
webgl.loadOneProgram = function (param) {
    'use strict';
    new xs.Task({
        msg: `getVertexShader`,
        data: { type: '.vert', file: param.vert },
        fun: webgl.getShaderSrc
    });

    new xs.Task({
        msg: `getFragShader`,
        data: { type: '.frag', file: param.frag },
        fun: webgl.getShaderSrc
    });

    new xs.Task({
        msg: `combine`,
        preTasks: [`getVertexShader`, `getFragShader`],
        data: param,
        fun: param => {
            let { vert, vertsrc, fragsrc, programs } = param;
            let nameArr = vert.split('/');
            if (nameArr[0] === "")
                nameArr.splice(0, 1);
            let fullName = `${nameArr[nameArr.length - 2]}-${nameArr[nameArr.length - 1]}`;
            // for (let j = 0; j < nameArr.length; j++) {
            //     const name = nameArr[j];
            //     fullName += name;
            //     if (j != nameArr.length - 1)
            //         fullName += '-';
            // }
            programs[fullName] = webgl.createProgram(webgl.gl, vertsrc, fragsrc, fullName);
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
    let { imgPaths, gl } = param;
    let imglib = {};
    for (let i = 0; i < imgPaths.length; i++) {
        const img = imgPaths[i];
        new xs.Task({
            msg: `loadImg:${img}`,
            data: { imgPath: img, imglib: imglib },
            fun: webgl.loadOneImg
        });

    }
    param.task.finish({ imgs: imglib });

};
webgl.loadOneImg = function (param) {
    let { imgPath, imglib } = param;
    let img = new Image();
    img.src = imgPath;
    let shortName = imgPath.slice(imgPath.lastIndexOf("/") + 1, imgPath.indexOf("."));
    img.filePath = shortName;
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
    indiceBuf.name = name;
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
webgl.createTextureBuffer = function (gl, param) {
    let { name, img, texParam } = param;
    let textureBuffer = gl.createTexture();
    if (!textureBuffer) {
        xs.redAlert('Failed to create the texture object');
        return;
    }
    textureBuffer.name = name;
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, textureBuffer);
    for (let key in texParam) {
        gl.texParameteri(gl.TEXTURE_2D, gl[key], gl[texParam[key]]);
    }

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    return textureBuffer;
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

webgl.getLocation = function (gl, program, uniformName) {
    let location = gl.getUniformLocation(program, uniformName);
    if (location < 0) {
        xs.redAlert(`Failed to get location of ${uniformName}`);
        return;
    }
    return location;
};
webgl.getUniformLocation = function (gl, program, uniforms) {
    for (let i = 0; i < uniforms.length; i++) {
        const uniform = uniforms[i];
        uniform.location = webgl.getLocation(gl, program, uniform.name);

    }

};
webgl.getTextureLocation = function (gl, program, useTextures) {
    for (let i = 0; i < useTextures.length; i++) {
        const textureUniform = useTextures[i];
        textureUniform.location = webgl.getLocation(gl, program, textureUniform.name);
        textureUniform.texture = webgl.stage.textures[textureUniform.textureName];
    }
};

webgl.getLightLocation = function (gl, program, lights) {
    for (let i = 0; i < lights.length; i++) {
        const lightUniform = lights[i];
        lightUniform.src = webgl.stage.lights[lightUniform.lightName];
        lightUniform.location = webgl.getLocation(gl, program, lightUniform.name);
    }
};
webgl.connectLight = function (gl, obj) {
    if (obj.useLights != undefined) {
        for (let i = 0; i < obj.useLights.length; i++) {
            const lightUniform = obj.useLights[i];
            lightUniform.fun(gl, lightUniform.src);
        }
    }
};
webgl.changeChannelTexture2D = function (gl, channel, texture) {
    gl.activeTexture(gl[`TEXTURE${channel}`]);
    gl.bindTexture(gl.TEXTURE_2D, texture);
};

webgl.connectTexture = function (gl, obj) {
    if (obj.useTextures != undefined) {
        for (let i = 0; i < obj.useTextures.length; i++) {
            const info = obj.useTextures[i];
            webgl.changeChannelTexture2D(gl, info.channel, info.texture);
            gl.uniform1i(info.location, info.channel);

        }
    }



};
webgl.connectIndice = function (gl, obj) {
    if (obj.indice != undefined)
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.indice.buffer);
};
webgl.connectAttributes = function (gl, obj) {
    for (let i = 0; i < obj.attributes.length; i++) {
        const attribute = obj.attributes[i];
        gl.bindBuffer(gl.ARRAY_BUFFER, attribute.buffer);
        let FSIZE = attribute.buffer.FSIZE;
        let span = attribute.buffer.span;
        gl.vertexAttribPointer(attribute.location, attribute.dataAmount, attribute.dataType, attribute.normalized, FSIZE * span, FSIZE * attribute.beginIndex);
        gl.enableVertexAttribArray(attribute.location);
    }
};
webgl.connectUniforms = function (gl, obj, funParam) {
    for (let key in obj.uniforms) {
        const uniform = obj.uniforms[key];
        uniform.fun(gl, funParam);
    }
};

webgl.connectPickUniforms = function (gl, obj, param) {
    for (let key in obj.pick.uniforms) {
        const uniform = obj.pick.uniforms[key];
        uniform.fun(gl, param);
    }
};



webgl.Camera = class {
    constructor() {
        this.name = null;
        this.type = null;
        this.matrix = new cuon.Matrix4();
        this.pMatrix = new cuon.Matrix4();//perspect
        this.vMatrix = new cuon.Matrix4();//view


    }
    setPerspective(fov, aspect, near, far) {
        this.fov = fov;
        this.aspect = aspect;
        this.near = near;
        this.far = far;
        this.buildPMatrix();
    }
    buildPMatrix() {
        let { vMatrix, pMatrix, matrix, fov, aspect, near, far } = this;
        pMatrix.setPerspective(fov, aspect, near, far);
        matrix.set(pMatrix).multiply(vMatrix);
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
    buildVMatrix() {
        let { vMatrix, pMatrix, matrix, eyeX, eyeY, eyeZ, atX, atY, atZ, upX, upY, upZ } = this;
        vMatrix.setLookAt(eyeX, eyeY, eyeZ, atX, atY, atZ, upX, upY, upZ);
        matrix.set(pMatrix).multiply(vMatrix);
    }
    setOrtho(left, right, bottom, top, near, far) {
        this.left = left;
        this.right = right;
        this.bottom = bottom;
        this.top = top;
        this.near = near;
        this.far = far;
        let { vMatrix, pMatrix, matrix } = this;
        pMatrix.setOrtho(left, right, bottom, top, near, far);
        matrix.set(pMatrix).multiply(vMatrix);
    }
};
webgl.Light = class {
    constructor() {
        this.name = null;
        this.type = null;
        this.color = null;

    }

};
webgl.Obj = class {
    constructor() {
        this.modelMatrix = new cuon.Matrix4(); //combine by parent|transform|operate|matrix

        this.parentMatrix = new cuon.Matrix4();//accumulate from parent 
        this.transformMatrix = new cuon.Matrix4();//clear every frame, better use to animate object
        this.operateMatrix = new cuon.Matrix4();//not clear every frame, use to place object or transform  object by user input
        this.matrix = new cuon.Matrix4();//most private Matrix, define object center


        this.normalMatrix = new cuon.Matrix4();//use to calculate light

        this.objs = [];
        this.ontop = [];
    }
    addChild(obj) {
        webgl.addChild(this, obj);
    }

};
webgl.Stage = class {
    constructor(param) {
        let { context, frameRate, backColor } = param;

        this.frameRate = frameRate;
        webgl.stage = this;
        context.parent.root.animations.push(this);
        this.programs = context.programs;
        // this.imgs = context.imgs;

        this.cameras = {};
        this.buffers = {};
        this.textures = {};
        this.lights = {};

        this.ontop = [];
        this.objs = [];

        this.camera = null;
        this.mvpMatrix = new cuon.Matrix4();//all obj share one mvpMatrix to render
        this.parentMatrix = new cuon.Matrix4();//accumulate frome parent to child 

        if (backColor != undefined)
            this.setBackGroundColor(backColor);
        else
            this.setBackGroundColor([0, 0, 0]);
        this.pickColors = [
            [255, 0, 0],
            [0, 255, 0],
            [0, 0, 255],
            [255, 255, 0],
            [0, 255, 255],
            [255, 0, 255],
            [128, 0, 0],
            [0, 128, 0],
            [0, 0, 128],
        ];
        this.pickPixels = new Uint8Array(4);//gl.readPixel return 255 based number


        this.clicked = 0;
    }

    beginAnimation() {
        this.last = Date.now();
        this.loop();
    }
    animationLoop() {

    }
    loop() {
        let stage = webgl.stage;
        stage.animationId = requestAnimationFrame(stage.loop);
        let now = Date.now();
        let elapsed = now - stage.last; // milliseconds
        if (elapsed < 1000 / stage.framerate)
            return;
        stage.last = now;

        stage.clear();
        stage.render(elapsed);
    }
    clean() {
        cancelAnimationFrame(this.animationId);
        this.camera = null;
        this.cleanGroup(this.objs);
        this.cleanGroup(this.ontop);



        for (let key in this.buffers) {
            webgl.gl.deleteBuffer(this.buffers[key]);
        }
        this.buffers = null;
        for (let key in this.textures) {
            webgl.gl.deleteTexture(this.textures[key]);
        }

        this.textures = null;

        for (let key in this.programs) {
            webgl.gl.deleteProgram(this.programs[key]);
        }
        this.programs = null;
        // for (let key in this.imgs) {
        //     this.imgs[key] = null;
        // }
        // this.imgs = null;
        this.cameras = null;
        this.lights = null;

        webgl.stage = null;
        webgl.gl = null;
        //         this.task.finish();

    }

    cleanGroup(group) {
        for (let i = 0; i < group.length; i++) {
            const obj = group[i];
            this.cleanObj(obj);
        }
        group.length = 0;
    }
    addCamera(param) {
        let { name, type, position, lookAt, up, fov, aspect, near, far } = param;
        let camera = new webgl.Camera();

        camera.setLookAt(position[0], position[1], position[2], lookAt[0], lookAt[1], lookAt[2], up[0], up[1], up[2]);
        camera.setPerspective(fov, aspect, near, far);
        camera.name = name;
        camera.type = type;
        this.cameras[name] = camera;
    }
    useCamera(name) {
        this.camera = this.cameras[name];
        if (!(this.camera instanceof webgl.Camera))
            xs.redAlert(`can't find camera ${name}`);
    }
    addBuffer(param) {
        let { name, verticeData, pointNum } = param;
        this.buffers[name] = webgl.createVertexBuf(webgl.gl, param);
    }
    addIndice(param) {
        let { name, indiceData } = param;
        this.buffers[name] = webgl.createIndiceBuf(webgl.gl, param);
    }
    addTexBuffer(param) {
        let { name, img, texParam } = param;
        this.textures[name] = webgl.createTextureBuffer(webgl.gl, param);
    }
    addImgs(imgs) {
        this.imgs = imgs;
    }
    addPrograms(programs) {
        this.programs = programs;
    }
    addBuffers(resArr) {
        for (let i = 0; i < resArr.length; i++) {
            const res = resArr[i];

            if (res.verticeData != undefined)
                this.addBuffer(res);
            else if (res.indiceData != undefined)
                this.addIndice(res);
            else if (res.img != undefined && res.texParam != undefined) {
                this.addTexBuffer(res);
            }
        }

    }

    cleanObj(obj) {
        obj.name = null;
        obj.program = null;
        obj.primitiveType = null;
        obj.uniform = null;
        obj.attributes = null;
        obj.indice = null;
        obj.useTextures = null;
        obj.useLights = null;
        obj.init = null;
        obj.initData = null;
        obj.update = null;
        obj.ontop = null;

    }
    createObj(param) {
        let {
            name,
            program,
            primitiveType,
            attributes,
            indice,
            uniforms,
            useLights,
            useTextures,
            ontop,
            init,
            initData,
            update,
            selected
        } = param;
        let obj = new webgl.Obj();
        obj.name = name;


        obj.program = program;
        if (obj.program == undefined)
            xs.redAlert("specified  program is  not found ");

        obj.primitiveType = primitiveType;

        obj.attributes = attributes;
        this.attachBuffer(obj.attributes);
        webgl.getAttribLocation(webgl.gl, obj.program, obj.attributes);

        obj.indice = indice;
        if (obj.indice == undefined) {
            if (obj.first == undefined) obj.first = 0;
            if (obj.count == undefined) obj.count = obj.attributes[0].buffer.num;
        }
        else {
            obj.indice.buffer = this.buffers[obj.indice.bufferName];
            if (obj.offset == undefined) obj.offset = 0;
            if (obj.count == undefined) obj.count = obj.indice.buffer.num;
            if (obj.indiceDataType == undefined) obj.indiceDataType = webgl.gl.UNSIGNED_BYTE;
        }

        obj.uniforms = uniforms;
        webgl.getUniformLocation(webgl.gl, obj.program, obj.uniforms);


        obj.useLights = useLights;
        if (obj.useLights != undefined)
            webgl.getLightLocation(webgl.gl, obj.program, obj.useLights);


        obj.useTextures = useTextures;
        if (obj.useTextures != undefined)
            webgl.getTextureLocation(webgl.gl, obj.program, obj.useTextures);

        obj.ontop = ontop;
        obj.init = init;
        obj.initData = initData;
        obj.update = update;

        if (selected != undefined) {
            obj.pick = {};
            obj.pick.program = this.programs["pickObj-pick"];
            obj.pick.attributes = [];
            let a_positon = this.findAttribute(obj, 'a_Position');
            obj.pick.attributes.push(a_positon);
            webgl.getAttribLocation(webgl.gl, obj.pick.program, obj.pick.attributes);
            obj.pick.uniforms = [

                {
                    name: "u_MVPMatrix",
                    fun: webgl.mvpGeneralFun
                },

                {
                    name: "u_PickColor",
                    fun: webgl.pickcolorGeneralFun,

                }
            ];
            webgl.getUniformLocation(webgl.gl, obj.pick.program, obj.pick.uniforms);
            obj.pick.color = webgl.getPickColor();
            obj.isSelected = false;
            obj.selected = selected;
            this.attachBuffer(obj.selected.attributes);
            webgl.getAttribLocation(webgl.gl, obj.selected.program, obj.selected.attributes);
            webgl.getUniformLocation(webgl.gl, obj.selected.program, obj.selected.uniforms);
        }
        return obj;
    }
    attachBuffer(attributes) {
        for (let i = 0; i < attributes.length; i++) {
            const attribute = attributes[i];
            attribute.buffer = this.buffers[attribute.bufferName];
        }
    }
    findAttribute(obj, name) {
        for (let i = 0; i < obj.attributes.length; i++) {
            const attribute = obj.attributes[i];
            if (attribute.name === name)
                return attribute;
        }
        xs.redAlert(`can't find attribute ${name}`);
    }
    addObj(param) {
        let obj = this.createObj(param);

        this.addChild(obj);

    }

    getObj(name) {
        let result = webgl.iterateChild(this, 'objs', function (param) {
            let { obj, name } = param;
            if (obj.name === name) {
                return obj;
            }
            return null;
        }, { name: name });
        // let result = webgl.searchObjTree(this, name);
        if (result == null)
            xs.redAlert(`can't find obj ${name}`);
        return result;
    }
    addChild(obj) {
        webgl.addChild(this, obj);
    }
    addLight(param) {
        let { type, name, color, direct, position } = param;
        let light = new webgl.Light();
        light.name = name;
        light.type = type;
        light.color = new cuon.Vector3(color);
        if (type === "directLight") {
            light.direct = new cuon.Vector3(direct);
            light.direct.normalize();
        } else if (type === "pointLight") {
            light.position = new cuon.Vector3(position);
        }
        this.lights[light.name] = light;
    }

    clear() {
        let gl = webgl.gl;
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);   // Clear <canvas>
        // gl.enable(gl.POLYGON_OFFSET_FILL);
        //                 gl.enable(gl.POLYGON_OFFSET_LINE);
    }
    setBackGroundColor(param) {
        let [r, g, b] = param;
        this.backColor = param;
        webgl.gl.clearColor(r, g, b, 1.0);

    }

    render(elapsed) {
        this.parentMatrix.setIdentity();
        webgl.iterateChild(this, 'objs', webgl.render, { elapsed: elapsed });

        this.parentMatrix.setIdentity();
        webgl.iterateChild(this, 'ontop', webgl.renderOntop, { elapsed: elapsed });

    }

    renderPickColor(elapsed) {
        let stage = webgl.stage;
        let backupColor = stage.backColor.slice();
        stage.setBackGroundColor([0.5, 0.5, 0.5]);
        stage.clear();

        this.parentMatrix.setIdentity();
        webgl.iterateChild(this, 'objs', webgl.renderEffect, { effectName: 'pick', elapsed: elapsed });


        stage.setBackGroundColor(backupColor);
    }


};
webgl.renderOntop = function (param) {
    let gl = webgl.gl;
    gl.clear(gl.DEPTH_BUFFER_BIT);
    webgl.renderEffect(param);
};
webgl.renderEffect = function (param) {
    let { effectName, obj, elapsed } = param;
    let gl = webgl.gl;
    let collection;
    if (effectName == undefined)
        collection = obj;
    else
        collection = obj[effectName];
    if (collection == undefined) return;
    gl.useProgram(collection.program);

    obj.transformMatrix.setIdentity();
    if (obj.update != undefined) obj.update(elapsed);

    webgl.connectAttributes(gl, collection);
    webgl.connectIndice(gl, obj);
    webgl.calculateMatrix(obj);
    webgl.connectUniforms(gl, collection, obj);
    webgl.connectTexture(gl, collection);
    webgl.connectLight(gl, collection);
    webgl.draw(gl, obj);

};
// webgl.renderSelected = function (param) {
//     let { obj, elapsed } = param;
//     let gl = webgl.gl;
//     if (obj.selected == undefined) return;
//     gl.useProgram(obj.selected.program);

//     obj.transformMatrix.setIdentity();
//     if (obj.update != undefined) obj.update(elapsed);


//     webgl.connectAttributes(gl, obj.selected);
//     webgl.connectIndice(gl, obj);
//     webgl.calculateMatrix(obj);
//     webgl.connectUniforms(gl, obj.selected, obj);
//     webgl.connectTexture(gl, obj.selected);
//     webgl.connectLight(gl, obj.selected);

//     webgl.draw(gl, obj);
// };
// webgl.renderRegular = function (param) {
//     let { obj, elapsed } = param;
//     let gl = webgl.gl;
//     gl.useProgram(obj.program);

//     obj.transformMatrix.setIdentity();
//     if (obj.update != undefined) obj.update(elapsed);


//     webgl.connectAttributes(gl, obj);
//     webgl.connectIndice(gl, obj);
//     webgl.calculateMatrix(obj);
//     webgl.connectUniforms(gl, obj, obj);
//     webgl.connectTexture(gl, obj);
//     webgl.connectLight(gl, obj);

//     webgl.draw(gl, obj);
// };
webgl.render = function (param) {
    let { obj } = param;
    if (obj.isSelected == true) {
        param.effectName = 'selected';
        webgl.renderEffect(param);
        param.effectName = undefined;
    }
    else
        webgl.renderEffect(param);


};

// webgl.searchObjTree = function (root, name) {
//     let result = null;
//     for (let i = 0; i < root.objs.length; i++) {
//         const child = root.objs[i];
//         if (child.name === name)
//             return child;
//         else
//             result = new webgl.searchObjTree(child, name);
//     }
//     return result;
// };
webgl.iterateChild = function (obj, arrName, fun, param) {
    let result;
    if (obj[arrName] != undefined) {
        for (let j = 0; j < obj[arrName].length; j++) {
            const child = obj[arrName][j];
            if (param == undefined) param = {};
            param.obj = child;
            result = fun(param);
            if (result != null)
                return result;
            else {
                result = webgl.iterateChild(child, arrName, fun, param);
                if (result != null)
                    return result;
            }
        }
    }

};

webgl.calculateMatrix = function (obj) {
    obj.parentMatrix.setIdentity().multiply(obj.parent.parentMatrix).multiply(obj.transformMatrix).multiply(obj.operateMatrix);
    obj.modelMatrix.setIdentity().multiply(obj.parentMatrix).multiply(obj.matrix);
};
webgl.mvpGeneralFun = function mvpGeneralFun(gl, obj) {
    let stage = webgl.stage;
    stage.mvpMatrix.set(stage.camera.matrix).multiply(obj.modelMatrix);
    gl.uniformMatrix4fv(this.location, false, stage.mvpMatrix.elements);
};

webgl.modelGeneralFun = function modelGeneralFun(gl, obj) {
    gl.uniformMatrix4fv(this.location, false, obj.modelMatrix.elements);
};
webgl.normalGeneralFun = function normalGeneralFun(gl, obj) {

    obj.normalMatrix.setInverseOf(obj.modelMatrix);
    obj.normalMatrix.transpose();
    gl.uniformMatrix4fv(this.location, false, obj.normalMatrix.elements);
};

webgl.pickcolorGeneralFun = function colorGeneralFun(gl, obj) {
    let color = obj.pick.color;
    gl.uniform4f(this.location, color[0] / 255, color[1] / 255, color[2] / 255, 1);

};
webgl.selectedGeneralFun = function sendSelectedColorsToShader(gl, obj) {
    let color = [1, 0, 0];
    gl.uniform4f(this.location, color[0], color[1], color[2], 1);
};

webgl.draw = function (gl, obj) {

    if (obj.indice == undefined) {
        gl.drawArrays(obj.primitiveType, obj.first, obj.count); //POINTS//TRIANGLES//TRIANGLE_STRIP
    } else {
        gl.drawElements(obj.primitiveType, obj.count, obj.indiceDataType, obj.offset);
    }
};



webgl.addChild = function (parent, child) {
    child.parent = parent;
    if (child.ontop != undefined) {
        let insertIndex = parent.ontop.length;
        for (let i = 0; i < parent.ontop.length; i++) {
            const o = parent.ontop[i];
            if (child.ontop < o.ontop)
                insertIndex = i - 1;
        }
        parent.ontop.splice(insertIndex, 0, child);
    }
    else
        parent.objs.push(child);
    if (child.init != undefined) {
        child.matrix.setIdentity();
        child.init(child.initData);
    }


};

webgl.getPickColor = function () {
    let pickColors = webgl.stage.pickColors;
    let index = Math.floor(Math.random() * pickColors.length);
    let color = pickColors[index];
    pickColors.splice(index, 1);
    return color;
};
xs.Timer = class {
    constructor(param) {
        let {
            fun,
            parent,
            interval
        } = param;
        if (interval == undefined)
            interval = 1000;
        let id = 0;
        this.counter = 0;
        parent.root.timers.push(this);
        let root = xs.getRoot();
        root.scheduleTimer.push(this);

    }
    begin() {
        id = setInterval(function () {
            fun(this);
        }, interval);
    }
    stop() {
        clearInterval(id);
        this.reset();
        id = 0;
    }
    reset() {
        this.counter = 0;
    }
    run() {
        this.counter += interval;
    }
    getTimeCount() {
        return this.counter;
    }
    isStopped() {
        if (id == 0)
            return true;
        else return false;
    }
};


