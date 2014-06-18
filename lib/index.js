var TaskConfigurator = require('./task-configurator');
var META_TASK_NAME = '__sets__';

var SetsPlatform = function (config) {
    this._config = config;
    this._tasks = {};
    this._taskList = [];

    this._configureMetaTask();
};

SetsPlatform.prototype.createConfigurator = function (taskName, deps) {
    var configurator = new TaskConfigurator(taskName, this._config);

    if (this._isLoop(taskName, deps)) {
        throw new Error('is loop');
    }

    this._tasks[taskName] = {
        configurator: configurator,
        deps: deps || []
    };

    this._sortTaskList();

    return configurator;
};

SetsPlatform.prototype._isLoop = function (task, deps) {
    for (var i = 0; i < deps.length; ++i) {
        var dep = this._tasks[deps[i]];
        var depDeps = dep && dep.deps || [];

        for (var j = 0; j < depDeps.length; ++j) {
            if (task === depDeps[j]) {
                return true;
            }
        }
    }

    return false;
};

SetsPlatform.prototype._sortTaskList = function () {
    var taskList = [].concat(Object.keys(this._tasks));
    var index = 0;

    while (taskList.length !== 0) {
        var name = taskList[index];
        var deps = this._tasks[name].deps;
        var has = false;

        for (var i = 0; i < deps.length; ++i) {
            var depName = deps[i];
            var depIndex = taskList.indexOf(depName);

            if (depIndex !== -1) {
                index = depIndex;
                has = true;
                break;
            }
        }

        if (has) {
            continue;
        }

        this._taskList.push(name);
        taskList.slice(index, 1);
        index = 0;
    }
};

SetsPlatform.prototype._configureMetaTask = function () {
    var tasks = this._taskList;

    this._config.task(META_TASK_NAME, function (task) {
        var args = [].slice.call(arguments, 1);
        var makePlatform = task.getMakePlatform();

        return Object.keys(tasks).map(function (taskName) {
            makePlatform.buildTask(taskName, args);
        });
    });
};

module.exports = function (config) {
    config.registerModule('enb-bem-sets', new SetsPlatform(config));
};
