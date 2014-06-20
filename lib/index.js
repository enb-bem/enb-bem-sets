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
        Object.keys(tasks).forEach(function(key) {

            if (!tasks[key].length) {
                step.push(key);
                delete tasks[key];
            }
        });

        Object.keys(tasks).forEach(function(key) {
            var deps = [];
            tasks[key].map(function(elem) {
                if (step.indexOf(elem) === -1) deps.push(elem);
            });

            tasks[key] = deps;
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