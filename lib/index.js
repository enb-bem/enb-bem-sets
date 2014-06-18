var TaskConfigurator = require('./task-configurator');

var SetsPlatform = function (config) {
    this._config = config;
    this._configurators = [];
};

SetsPlatform.prototype.create = function (taskName) {
    var configurator = new TaskConfigurator(taskName, this._config);

    this._configurators[taskName] = configurator;

    return configurator;
};

module.exports = function (config) {
    config.registerModule('enb-bem-sets', new SetsPlatform(config));
};
