var path = require('path');
var vow = require('vow');
var pseudo = require('enb-pseudo-levels');

var SetsMaker = function (taskName, config) {
    this._taskName = taskName;
    this._config = config;
    this._buildPromises = [];
    this._deferred = vow.defer();

    this._configureTask();
};

SetsMaker.prototype._configureTask = function () {
    var _this = this;

    this._config.task(this._taskName, function (task) {
        var args = [].slice.call(arguments, 1);
        var makePlatform = task.getMakePlatform();
        var cdir = makePlatform.getDir();

        return vow.all(_this._buildPromises)
            .then(function (targetsList) {
                var nodeHash = {};
                var nodes = [];
                var targets = [];

                Array.prototype.concat.apply([], targetsList).forEach(function (target) {
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
                }

                makePlatform.loadCache();

                return makePlatform.init(cdir)
                    .then(function () {
                        return makePlatform.buildTargets(targets);
                    })
                    .then(function () {
                        _this._deferred.resolve(targets);

                        return targets;
                    })
                    .fail(function (err) {
                        _this._deferred.reject(err);

                        throw err;
                    });
            });
    });
};

SetsMaker.prototype.build = function (resolve, options) {
    options || (options = {});

    var promise = pseudo(options.levels || [])
        .addBuilder(options.destPath || 'sets', resolve)
        .build();

    this._buildPromises.push(promise);

    return promise;
};

module.exports = SetsMaker;
