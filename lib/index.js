var TaskConfigurator = require('./task-configurator');
var META_TASK_NAME = '__sets__';

var SetsPlatform = function (config) {
    this._config = config;
    this._configurators = {};

    this._configureMetaTask();
};

SetsPlatform.prototype.createConfigurator = function (taskName) {
    var configurator = new TaskConfigurator(taskName, this._config);

    this._configurators[taskName] = configurator;

    return configurator;
};

SetsPlatform.prototype._configureMetaTask = function () {
    var configurators = this._configurators;

    this._config.task(META_TASK_NAME, function (task) {
        var args = [].slice.call(arguments, 1);
        var makePlatform = task.getMakePlatform();

        return Object.keys(configurators).map(function (taskName) {
            makePlatform.buildTask(taskName, args);
        });
    });
};

module.exports = function (config) {
    config.registerModule('enb-bem-sets', new SetsPlatform(config));
};
