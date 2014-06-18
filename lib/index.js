var SetsPlatform = require('./sets-platform');

exports.create = function (taskName, config) {
    return new SetsPlatform(taskName, config);
};

exports.use = function (plugin, platform) {
    return plugin(platform);
};
