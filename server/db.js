var mongoose = require('mongoose');

exports.init=function(){
    exports.connect(process.env.MONGODB_URI||"mongodb://127.0.0.1/webgl");
};
exports.connect = function (url) {
    mongoose.connect(url);
    console.log("Connected successfully to database");
    var UISchema = new mongoose.Schema({
        USA: String,
        CHN: String
    });
    exports.UI = mongoose.model("UI", UISchema, "ui");

    var ContentSchema = new mongoose.Schema({
        contentName: String,
        USA: String,
        CHN: String
    });
    exports.Content = mongoose.model("Content", ContentSchema, "content");

    var USERSchema = new mongoose.Schema({
        name: String,
        language: String,
        currentView: String,
        currentMenu: String,
        currentUrl: String,
        history: []
    });
    exports.User = mongoose.model("User", USERSchema, "user");
};