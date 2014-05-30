var SetsMaker = require('./sets-maker');

exports.create = function (taskName, config) {
    return new SetsMaker(taskName, config);
};

exports.use = function (plugin, maker) {
    return plugin(maker);
};
