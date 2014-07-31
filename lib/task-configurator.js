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

        return _this._prebuild(args)
            .spread(function (nodes, targets) {
                var toBuild = [].concat(nodes, targets);

                // Ничего не делаем, если нет нод и таргетов для сборки
                if (args.length && toBuild.length === 0) {
                    return vow.resolve([]);
                }

                return _this._buildTargets(makePlatform, toBuild);
            });
    });
};

TaskConfigurator.prototype._prebuild = function (args) {
    var configs = [];

    return vow.all(this._callbacks.map(function (callback) {
            var config = new PrebuildConfig(args);

            configs.push(config);

            return callback(config);
        }))
        .then(function () {
            var nodes = {};
            var targets = {};

            configs.forEach(function (config) {
                Object.keys(config._nodes).forEach(function (node) {
                    nodes[node] = true;
                });

                Object.keys(config._targets).forEach(function (target) {
                    targets[target] = true;
                });
            });

            return [Object.keys(nodes), Object.keys(targets)];
        });
};

TaskConfigurator.prototype._buildTargets = function (makePlatform, targets) {
    var _this = this;
    var cdir = makePlatform.getDir();

    return makePlatform.init(cdir)
        .then(function () {
            makePlatform.loadCache();

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
