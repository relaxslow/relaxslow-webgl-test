xs.init = function () {
    let aaa = new xs.Task({
        msg: "taska",
        fun: param => {
            let { task } = param;
            let a = [];
            a.push(1, 2, 3, 4, 5);
            task.finish({ group: a });
        }
    });
    let bbb = new xs.Task({
        msg: "taskb",
        preTasks: [aaa],
        fun: param => {
            let { task, group } = param;
            console.log(group);
            task.finish();
        }
    });

};
