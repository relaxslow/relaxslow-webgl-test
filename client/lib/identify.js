defineLib('xs');
//identify
xs.identifyUser = () => {
    xs.initStep({ msg: "identify user", num: 1 });
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
            xs.finishStep("identify user");
            addListenerToBackAndForward();
            initDocumentDataContainer();
            replaceUrl(parsedUserInfo.currentUrl);
            xs.loadNewPage({
                msg: "loading new page",
                socketElement: document.body,
                file: parsedUserInfo.currentView,
                styles: ["Main"],

            });
            xs.identifyUser = null;

        }
    });
    function initDocumentDataContainer() {
        document.body.root = document.body;
        document.body.childRoot = [];
        document.body.cssComponents = [];
        document.body.jsComponents = [];


        document.body.translateNode = [];
        document.body.scheduleTimer = [];
        document.body.refreshFrame = [];
        document.body.scheduledAnimations = [];
    }
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
xs.identifyUser();