var path = require('path');
var vow = require('vow');
var pseudo = require('enb-pseudo-levels');

var SetsMaker = function (taskName, config) {
    this._taskName = taskName;
    this._config = config;
    this._pseudoLevels = [];
    this._preprocess = [];
    this._deferred = vow.defer();

    this._configureTask();
};

SetsMaker.prototype._configureTask = function () {
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
                        arg = arg.replace(/\/$/, '');

                        var splitedArg = arg.split(path.sep);

                        nodes.forEach(function (node) {
                            var splitedNode = node.split(path.sep);

                            if (splitedArg.length === splitedNode.length && node === arg) {
                                targets.push(node);
                            } else if (splitedArg.length < splitedNode.length) {
                                if (arg === splitedNode.splice(0, splitedArg.length).join(path.sep)){
                                    targets.push(node);
                                }
                            }
                        });
                    });

                    if (targets.length === 0) {
                        targets = undefined;
                    }
                } else if (targets.length === 0) {
                    targets = nodes;
                }

                makePlatform.loadCache();

                return makePlatform.init(cdir)
                    .then(function () {
                        return targets ? makePlatform.buildTargets(targets) : [];
                    })
                    .then(function () {
                        _this._deferred.resolve(targets || []);

                        return targets;
                    })
                    .fail(function (err) {
                        _this._deferred.reject(err);

                        throw err;
                    });
            });
    });
};

module.exports = SetsMaker;
