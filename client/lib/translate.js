defineLib('xs');
//translate
xs.changeLanguage = (language) => {
    if (document.status === "loading")
        return;
    document.status = "loading";

    xs.sendRequest({
        url: `/changeLanguage/:${language}`,
        method: "POST",
        jsonObj: JSON.stringify({ id: localStorage.getItem('id') }),
        fun: function (userData) {
            let parsedUserData=JSON.parse(userData);
            localStorage.setItem('language', parsedUserData.language);
            localStorage.setItem('currentView',parsedUserData.currentView);
            xs.loadNewPage({
                msg: "changeLanguage",
                socketElement: document.body,
                file: parsedUserData.currentView,
                styles: ["Main"],
              
            });
        }
    });
};
xs.collectTranslateNode = (element) => {
    let allTranlateNode = [];
    findAllTranslateNode(element);
    for (let i = 0; i < allTranlateNode.length; i++) {
        const text = allTranlateNode[i];
        document.body.translateNode.push(text);
    }
    function findAllTranslateNode(element) {
        for (let i = 0; i < element.childNodes.length; i++) {
            const child = element.childNodes[i];
            if (isTranslateNode(child))
                allTranlateNode.push(child);
            if (child.childNodes.length != 0)
                new findAllTranslateNode(child);
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
xs.translateAll = (currentlanguage) => {
    xs.initStep({
        msg: "translateAll",
        num: document.body.translateNode.length
    });

    for (let index = 0; index < document.body.translateNode.length; index++) {
        const text = document.body.translateNode[index];

        translate(text);
    }
    
    function translate(text) {
        let txt = text.innerHTML;
        if (text.dataset.translate === "UI") {
            getUIText(txt, changeText, currentlanguage);
        } else if (text.dataset.translate === "content") {
            getContentText(txt, changeText, currentlanguage);
        } else if (text.dataset.translate === "invert") {
            getInvertTranslateText(txt, changeText, currentlanguage);
        }
        function changeText(translated) {

            text.innerHTML = translated;
            xs.finishStep(`translate ${text.innerHTML}`);
        }
    }
    function getUIText(text, fun) {

        xs.sendRequest({
            url: `/getUIText/:${encodeURI(text)}/${currentlanguage}`, fun: function (translated) {
                let decoded = decodeURI(translated);
                fun(decoded);
            }
        });

    }

    function getContentText(contentIndex, fun) {
        xs.sendRequest({
            url: `/getContentText/:${encodeURI(contentIndex)}/${currentlanguage}`, fun: function (text) {
                // console.log(`decode ${text} ...`);
                let f = xs.b64DecodeUnicode(text);
                fun(f);
            }
        });
    }
    function getInvertTranslateText(text, fun, currentlanguage) {
        xs.sendRequest({
            url: `/getInvertTranslateText/:${encodeURI(text)}/${currentlanguage}`, fun: function (translated) {
                let decoded = decodeURI(translated);
                fun(decoded);
            }
        });
    }

};



