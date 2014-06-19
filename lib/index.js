var TaskConfigurator = require('./task-configurator');
var META_TASK_NAME = '__sets__';

var SetsPlatform = function (config) {
    this._config = config;
    this._configurators = {};
    this._deps = {};
    this._taskList = [];

    this._configureMetaTask();
};

SetsPlatform.prototype.createConfigurator = function (taskName, deps) {
    var configurator = new TaskConfigurator(taskName, this._config);

    if (deps && deps.length && this._isLoop(taskName, deps)) {
        throw new Error('is loop');
    }

    this._deps[taskName] = deps || [];
    this._configurators[taskName] = configurator;

    this._orderTask();

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

SetsPlatform.prototype._orderTask() = function() {
    var tasks = this._deps;
    var res = [];

    while (Object.keys(tasks).length) {
        var step = [];
        var del = [];
        Object.keys(tasks).forEach(function(key) {

            if (!tasks[key].length && del.indexOf(key) === -1) {
                var tmpKey = key;
                step.push(tmpKey);
                delete tasks[key];

                Object.keys(tasks).forEach(function(key) {
                    var deps = [],
                        flag = 0;
                    tasks[key].map(function(elem) {
                        flag = 1;
                        if (elem !== tmpKey) deps.push(elem);
                    });

                    tasks[key] = deps;
                    (!deps.length && flag) && (del.push(key));
                });
            }
        });
        res.push(step);
    }

    this._taskList = res;
}



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