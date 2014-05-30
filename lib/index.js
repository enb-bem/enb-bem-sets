var path = require('path');
var vow = require('vow');
var pseudo = require('enb-pseudo-levels');
var builders = require('./builders');

var SetsFlow = function (config) {
    this._config = config;
    this._buildPromises = [];
    this._runPromise;

    this._configureTask();
};

SetsFlow.prototype._configureTask = function () {
    var _this = this;

    this._config.task('sets', function (task) {
        var args = [].slice.call(arguments, 1);
        var makePlatform = task.getMakePlatform();
        var cdir = makePlatform.getDir();

        _this._runPromise = vow.all(_this._buildPromises)
            .then(function (targetsList) {
                var targets = (args.length && args) ||
                    Array.prototype.concat.apply([], targetsList)
                        .filter(function (target) {
                            var suffix = target.split('.').pop();

                            return target.charAt(0) !== '.' && suffix !== 'blocks';
                        })
                        .map(function (target) {
                            return path.dirname(target);
                        });

                makePlatform.loadCache();

                return makePlatform.init(cdir)
                    .then(function () {
                        return makePlatform.buildTargets(targets);
                    })
                    .then(function () {
                        return targets;
                    });
            });

        return _this._runPromise;
    });
};

SetsFlow.prototype.sets = function (destPath, resolve, options) {
    this._buildPromises.push(
        pseudo(options.levels)
            .addBuilder(destPath, resolve)
            .build()
    );

    return this;
};

SetsFlow.prototype.bundles = function (destPath, options) {
    return this.sets(destPath, builders.bundles(options), options);
};

SetsFlow.prototype.keeps = function (destPath, options) {
    return this.sets(destPath, builders.keeps(options), options);
};

SetsFlow.prototype.blockKeeps = function (destPath, options) {
    return this.sets(destPath, builders.blockKeeps(options), options);
};

SetsFlow.prototype.keepsAndBundles = function (destPath, options) {
    return this.sets(destPath, builders.keepsAndBundles(options), options);
};

module.exports = function (config) {
    return new SetsFlow(config);
};
