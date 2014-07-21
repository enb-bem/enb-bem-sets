var vow = require('vow');
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var PrebuildConfig = require('./prebuild-config');

var TaskConfigurator = function (taskName, config) {
    this._taskName = taskName;
    this._config = config;
    this._callbacks = [];

    this._configureTask();
};

util.inherits(TaskConfigurator, EventEmitter);

TaskConfigurator.prototype._configureTask = function () {
    var _this = this;

    this._config.task(this._taskName, function (task) {
        var args = [].slice.call(arguments, 1);
        var makePlatform = task.getMakePlatform();

        return _this._prebuild()
            .spread(function (nodes, targets) {
                var toBuild = [];

                // Оставляем только те ноды и таргеты, которые указаны в `args`
                if (args.length) {
                    args.forEach(function (arg) {
                        arg = arg.replace(/\/$/, '');

                        nodes = nodes.filter(function (node) {
                            return node.indexOf(arg) === 0;
                        });

                        targets = targets.filter(function (target) {
                            return target.indexOf(arg) === 0;
                        });
                    });

                    if (nodes.length === 0 && targets.length === 0) {
                        return vow.resolve([]);
                    }
                }

                toBuild = toBuild.concat(nodes);

                // Убираем таргеты, если их ноды уже указаны
                targets.forEach(function (target) {
                    var belongNode = false;

                    nodes.forEach(function (node) {
                        if (target.indexOf(node) === 0) {
                            belongNode = true;
                        }
                    });

                    if (!belongNode) {
                        toBuild.push(target);
                    }
                });

                return _this._buildTargets(makePlatform, toBuild);
            });
    });
};

TaskConfigurator.prototype._prebuild = function () {
    var prebuildConfig = new PrebuildConfig();

    return vow.all(this._callbacks.map(function (callback) {
            return callback(prebuildConfig);
        }))
        .then(function () {
            return [prebuildConfig.getNodes(), prebuildConfig.getTargets()];
        });
};

TaskConfigurator.prototype._buildTargets = function (makePlatform, targets) {
    var _this = this;
    var cdir = makePlatform.getDir();

    makePlatform.loadCache();

    return makePlatform.init(cdir)
        .then(function () {
            return makePlatform.buildTargets(targets);
        })
        .then(function () {
            _this.emit('build', targets);

            return targets;
        })
        .fail(function (err) {
            _this.emit('error', err);

            throw err;
        });
};

TaskConfigurator.prototype.getTaskName = function () {
    return this._taskName;
};

TaskConfigurator.prototype.getConfig = function () {
    return this._config;
};

TaskConfigurator.prototype.prebuild = function (callback) {
    return this._callbacks.push(callback);
};

module.exports = TaskConfigurator;
