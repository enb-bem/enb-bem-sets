var path = require('path');
var vow = require('vow');
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var pseudo = require('enb-pseudo-levels');

var SetsPlatform = function (taskName, config) {
    this._taskName = taskName;
    this._config = config;
    this._pseudoLevels = [];
    this._preprocess = [];

    this._configureTask();
};

util.inherits(SetsPlatform, EventEmitter);

SetsPlatform.prototype._configureTask = function () {
    var _this = this;

    this._config.task(this._taskName, function (task) {
        var args = [].slice.call(arguments, 1);
        var makePlatform = task.getMakePlatform();
        var cdir = makePlatform.getDir();

        return vow.all(_this._preprocess.map(function (f) {
                return f.apply(_this);
            }))
            .then(function (pretargets) {
                    return vow.all(_this._pseudoLevels.map(function (levelOptions) {
                        return pseudo(levelOptions.levels)
                            .addBuilder(levelOptions.destPath, levelOptions.resolve)
                            .build();
                    }))
                    .then(function (pseudotargets) {
                        return Array.prototype.concat.apply([], pseudotargets, pretargets);
                    });
            })
            .then(function (targetsList) {
                var nodeHash = {};
                var nodes = [];
                var targets = [];

                targetsList.forEach(function (target) {
                    var suffix = target.split('.').pop();
                    var node = path.dirname(target);

                    if (target.charAt(0) !== '.' && suffix !== 'blocks') {
                        nodeHash[node] = true;
                    }
                });

                Object.keys(nodeHash).forEach(function (node) {
                    nodes.push(node);
                });

                if (args.length) {
                    args.forEach(function (arg) {
                        nodes.forEach(function (node) {
                            if (node.indexOf(arg) === 0) {
                                targets.push(node);
                            }
                        });
                    });
                } else if (targets.length === 0) {
                    targets = nodes;
                }

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
            });
    });
};

SetsPlatform.prototype.getTaskName = function() {
    return this._taskName;
};

SetsPlatform.prototype.getConfig = function() {
    return this._config;
};

module.exports = SetsPlatform;
