const assert = require('assert');
const db = require('./db.js');

exports.init = function () {
    exports.number = 0;
};
exports.getById = function (param) {
    let { id, okfun, failfun, debugInfo } = param;
    db.User.findOne({ _id: id }, function (err, findUser) {
        assert(err == null, err);
        if (findUser == null) {
            console.log("user not exist!! info:" + debugInfo);
            if (failfun != undefined)
                failfun();
        } else {
            if (okfun != undefined)
                okfun(findUser);
        }
    });
};
//packageData send to client
exports.packageData = function (userData) {
    return {
        id: userData.id,
        name: userData.name,
        language: userData.language,
        currentView: userData.currentView,
        currentMenu: userData.currentMenu,
        currentUrl: userData.currentUrl,
    };

};
exports.updateLanguage = function (findUser, language, fun) {
    findUser.language = language;
    findUser.save(function (err, updatedUser) {
        assert(err == null, err);
        fun(updatedUser);
    });
};
function pushHistory(historyArr, historyRec) {
    historyArr.push(historyRec);
    if (historyArr.length > 20)
        historyArr.shift();
}
exports.updateUrlAndHistory = function (findUser, userData, fun) {
    findUser.currentUrl = userData.currentUrl;
    findUser.currentView = userData.currentView;
    findUser.currentMenu = userData.currentMenu;
    pushHistory(findUser.history, userData.history);
    findUser.save(function (err, updatedUser) {
        assert(err == null, err);
        fun(updatedUser);
    });
};
exports.update = function (findUser, userData, fun) {
    findUser.name = userData.name;
    findUser.language = userData.language;
    findUser.currentUrl = userData.currentUrl;
    findUser.currentView = userData.currentView;
    findUser.currentMenu = userData.currentMenu;
    pushHistory(findUser.history, userData.history);
    findUser.save(function (err, updatedUser) {
        assert(err == null, err);
        console.log(" user updated!");
        fun(updatedUser);
    });

};

function getUserNumber() {
    exports.number++;
    return exports.number;
}
exports.createNew = function (userData, fun) {
    let history = [];
    history.push(userData.history);
    var newUser = new db.User({
        name: "guest" + getUserNumber(),
        language: "USA",
        currentView: userData.currentView,
        currentMenu: userData.currentMenu,
        currentUrl: userData.currentUrl,
        history: history

    });
    newUser.save(function (err, updatedUser) {
        assert(err == null, err);
        console.log("new user created!");
        fun(updatedUser);

    });
};

