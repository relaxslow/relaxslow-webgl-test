
const assert = require('assert');
const http = require('http');
const URLlib = require('url');
const path = require('path');
const fs = require('fs');
const user = require('./user.js');
const db = require('./db.js');
const config = require('./config.js');
const view = require('./view.js');
db.init();
user.init();
var server = http.createServer(function (req, res) {

    const { headers, method, url } = req;
    console.log(` ${method} ${url}`);

    const parsedUrl = URLlib.parse(url, true);
    req.parsedPath = decodeURI(parsedUrl.pathname);
    req.parsedUrl = parsedUrl;

    if (isFile(req.parsedPath))
        handleFile(req, res);
    else
        handleRoutine(req, res);

});
const port = process.env.PORT || 1337;
server.listen(port);
console.log(`Server running at  ${port}`);

//file handle-----------------------------------
function isFile(filePathStr) {
    if (filePathStr.indexOf('.') == -1)
        return false;
    return true;
}
function getFileData(file, req, res, fun) {
    if (!fs.existsSync(file)) {
        res.statusCode = 404;
        res.end(`Error: File ${file} not found!`);

    }
    fs.readFile(file, function (err, data) {
        if (err) {
            res.statusCode = 500;
            res.end(`Error: can't read the file: ${err}.`);

        } else {
            fun(data);
        }


    });
}
function handleFile(req, res) {
    let fileFullPath = `.${req.parsedPath}`;

    getFileData(fileFullPath, req, res, function (data) {
        if (data == null)
            return;
        const mimeType = {
            '.ico': 'image/x-icon',
            '.html': 'text/html',
            '.js': 'text/javascript',
            '.json': 'application/json',
            '.css': 'text/css',
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.wav': 'audio/wav',
            '.mp3': 'audio/mpeg',
            '.svg': 'image/svg+xml',
            '.pdf': 'application/pdf',
            '.doc': 'application/msword',
            '.eot': 'appliaction/vnd.ms-fontobject',
            '.ttf': 'aplication/font-sfnt'
        };
        const ext = path.parse(fileFullPath).ext;
        res.setHeader('Content-type', mimeType[ext] || 'text/plain');
        res.end(data);
    });
}

//router--------------------------------------------
function getUserViewAndMenu(userData, direct) {
    let routeArr = splitRoute(userData.currentUrl);
    if (direct == true)
        userData.currentView = view.directMap[routeArr[1]];
    else
        userData.currentView = view.map[routeArr[1]];
    userData.currentMenu = routeArr[2];
}
function correctLanguage(userData) {
    if (userData.language === "undefined")
        userData.language = "USA";
}
let systemRoutine = {
    "identify": function (req, res) {
        getBody(req, function (userData) {
            getUserViewAndMenu(userData);
            correctLanguage(userData);
            if (userData.id == null) {
                user.createNew(userData, function (newUser) {
                    returnData(res, user.packageData(newUser));
                });
            } else {
                user.getById({
                    id: userData.id,
                    okfun: function (findUser) {
                        user.update(findUser, userData, function (updatedUser) {
                            returnData(res, user.packageData(updatedUser));
                        });
                    },
                    failfun: function () {
                        user.createNew(userData, function (newUser) {
                            returnData(res, user.packageData(newUser));
                        });
                    }
                });
            }

        });


    },
    "directToUrl": function (req, res) {
        getBody(req, function (userData) {
            user.getById({
                id: userData.id,
                okfun: function (findUser) {
                    userData.currentUrl = new Buffer(req.b_Id, 'base64').toString('ascii');
                    getUserViewAndMenu(userData, true);
                    user.updateUrlAndHistory(findUser, userData, function (updatedUser) {
                        console.log('update url and history');
                        returnData(res, user.packageData(updatedUser));
                    });
                }

            });
        });

    },

    "changeLanguage": function (req, res) {
        getBody(req, function (userData) {
            user.getById({
                id: userData.id,
                okfun: function (findUser) {
                    newlanguage = req.b_Id;
                    getUserViewAndMenu(findUser);
                    user.updateLanguage(findUser, newlanguage, function (updatedUser) {
                        console.log('language setting has been saved!');
                        returnData(res, user.packageData(updatedUser));
                    });
                },

            });
        });


    },
    "getUIText": function (req, res) {
        // console.log("getUIText--" + res.b_Id);
        let language = req.routeArr[3];
        let txt = decodeURI(req.b_Id);
        db.UI.findOne({ "USA": txt }, function (err, text) {
            assert(err == null, err);
            // console.log(text.CHN) ;
            let encoded;
            if (text == null) {
                encoded = encodeURI(txt);
            }
            else {
                encoded = encodeURI(text[language]);
            }
            res.setHeader('Content-type', "text/plain;charset=utf-8");
            res.end(encoded);//"no define in db(ui)"
        });

    },
    "getContentText": function (req, res) {
        let language = req.routeArr[3];
        let txt = decodeURI(req.b_Id);
        db.Content.findOne({ "contentName": txt }, function (err, text) {
            assert(err == null, err);
            res.setHeader('Content-type', "text/plain;charset=utf-8");
            if (text == null) {
                let send = Buffer.from(`${req.b_Id} no define in db`).toString('base64');
                res.end(send);
            } else {
                res.end(text[language]);
            }
        });

    },
    "getInvertTranslateText": function (req, res) {
        let language = req.routeArr[3];
        let txt = decodeURI(req.b_Id);
        db.UI.findOne({ "USA": txt }, function (err, text) {
            assert(err == null, err);
            // console.log(text.CHN) ;
            let encoded;
            if (text == null) {
                encoded = encodeURI(txt);
            }
            else {
                if (language === "USA")
                    encoded = encodeURI(text.CHN);
                else if (language === "CHN")
                    encoded = encodeURI(text.USA);

            }
            res.setHeader('Content-type', "text/plain;charset=utf-8");
            res.end(encoded);//"no define in db(ui)"
        });

    },
    "fileExist": function (req, res) {
        let filepath = req.parsedPath.slice(req.parsedPath.indexOf("fileExist") + "fileExist".length, req.parsedPath.lastIndexOf("/"));
        let filetype = req.parsedPath.slice(req.parsedPath.lastIndexOf("/") + 1);
        let fileFullName = `.${filepath}.${filetype}`;
        res.setHeader('Content-type', "text/plain;charset=utf-8");
        if (fs.existsSync(fileFullName)) {
            res.end("yes");
        }
        else {
            res.end("no");
        }
    },
    "readHtmlFile": function (req, res) {
        let filepath = req.parsedPath.slice(req.parsedPath.indexOf("readHtmlFile") + "readHtmlFile".length);
        let fileFullName = `.${filepath}.html`;
        fs.readFile(fileFullName, function (err, data) {
            if (err) {
                res.statusCode = 500;
                res.end(`Error: can't read the file: ${err}.`);
                return null;
            } else {
                res.setHeader('Content-type', 'text/html');
                res.end(data);
            }
        });
    },
    "getShader": (req, res) => {
        let filePath = new Buffer(req.b_Id, 'base64').toString('ascii');
        fs.readFile(`.${filePath}`, function (err, data) {
            if (err) {
                res.statusCode = 500;
                res.end(`Error: can't read the file: ${err}.`);
                return null;
            } else {
                res.setHeader('Content-type', 'text/plain;charset=utf-8');
                res.end(data);
            }
        });
    },

};
let subRoutine = {
    "": function (req, res) {
        renderHtml(res);
    },
    "getMainMenu": function (req, res) {
        let mainMenu = config.mainMenu;
        res.setHeader('Content-type', "text/plain;charset=utf-8");
        res.end(JSON.stringify(mainMenu));
    },
    "detail": function (req, res) {
        renderHtml(res);

    },
    // "getCurrentMenu": function (req, res) {
    //     user.getByIp({

    //         ip: req.connection.remoteAddress,
    //         okfun: function (findUser) {
    //             res.setHeader('Content-type', "text/plain;charset=utf-8");
    //             res.end(JSON.stringify(findUser.currentMenu));

    //         },
    //         info: "getCurrentMenu",
    //     });


    // },
    "getMenuPath": function (req, res) {
        let currentMenu = req.routeArr[2];
        let mainMenu = config.mainMenu;
        let menuPath = searchMenuTree(currentMenu, mainMenu);
        res.setHeader('Content-type', "text/plain;charset=utf-8");
        res.end(JSON.stringify(menuPath));

    }
};
function splitRoute(parsedPath) {
    let routeArr = parsedPath.split("/");
    if (routeArr[routeArr.length - 1] != "")
        routeArr.push("");
    return routeArr;
}
function handleRoutine(req, res) {
    let { parsedPath, method } = req;
    let routeArr = splitRoute(parsedPath);
    routeArr.push(req.method);
    req.b_name = routeArr[1];
    if (routeArr[1] !== "") {
        routeArr[1] = "b";
    }

    if (routeArr.length > 2) {
        let index = routeArr[2].indexOf(":");
        if (index != -1) {
            req.b_Id = routeArr[2].slice(index + 1);
            routeArr[2] = ":";

        }
    }

    req.routeArr = routeArr;

    if (systemRoutine[req.b_name] != undefined) {
        systemRoutine[req.b_name](req, res);
    }
    else if (subRoutine[req.b_name] != undefined) {
        subRoutine[req.b_name](req, res);
    }
    else {
        res.end("routine" + req.b_Name + "undefined");
    }
}

//data---
function getBody(req, fun) {
    let { method } = req;
    console.log(`receive ${method} body`);
    if (method == "POST" || method == "PUT") {
        let body = '';
        req.on('data', function (data) {
            body += data;
            console.log("Partial body: " + body);
        });
        req.on('end', function () {
            console.log("Body: " + body);
            assert(body != "", "post body is empty");
            fun(JSON.parse(body));
        });
    }
    if (method == "GET") {
        let body = req.parsedUrl.query.data;
        console.log("Body: " + body);
        assert(body != "" || body != "null", "post body is empty");
        fun(JSON.parse(body));
    }

}
function returnData(res, data) {
    res.setHeader('Content-type', "text/plain;charset=utf8");
    res.end(JSON.stringify(data));
    return;
}
function renderHtml(res) {
    res.setHeader('Content-type', "text/html;charset=utf8");
    var html = `<!DOCTYPE html>
<html>
<head>
<title>webgl</title>
<link rel="stylesheet" type="text/css" href="/client/style.css">
<script type="text/javascript" src="/client/lib/core.js"></script>
<script type="text/javascript" src="/client/lib/translate.js"></script>
<script type="text/javascript" src="/client/lib/animation.js"></script>
<script type="text/javascript" src="/client/lib/identify.js"></script>
</head>
<body>
</body>
</html>`;
    res.end(html);
}



// function addServerData(data) {
//     if (data == undefined)
//         return "";
//     let str = `<script>`;
//     str += `let serverData= ${JSON.stringify(data)};\n`;
//     str += `</script>`;
//     return str;
// }

function searchMenuTree(searchItem, mainMenu) {
    let level = 0;
    let find = false;
    let menuPath = new buildMenuPath(mainMenu);
    findDefaultPath(menuPath);
    return menuPath;

    function buildMenuPath(menuTree) {
        let branchPath;
        level++;
        for (let i = 0; i < menuTree.length; i++) {

            if (find == true)
                break;

            branchPath = [];

            const branch = menuTree[i];
            branchPath.push(branch);
            // if (branch.url != undefined) {
            //     let url = branch.url;
            //     let detailName = url.slice(url.indexOf("/detail/") + 8);
            if (branch.name === searchItem) {
                level--;
                find = true;
                return branchPath;

            }
            // }
            if (branch.subMenu != undefined) {
                let newBranch = new buildMenuPath(branch.subMenu);
                if (newBranch != null)
                    addArrToArr(newBranch, branchPath);
            }
        }
        level--;
        return branchPath;


    }
    function addArrToArr(arr1, arr2) {
        for (let i = 0; i < arr1.length; i++) {
            const e = arr1[i];
            arr2.push(e);
        }
    }
    function findDefaultPath(pathArr) {
        let last = pathArr[pathArr.length - 1];

        let subMenu = last;
        while (subMenu.subMenu != undefined) {
            subMenu = subMenu.subMenu[0];
            pathArr.push(subMenu);
        }

    }
}