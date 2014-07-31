var path = require('path');

var PrebuildConfig = function (args) {
    this._args = args ? args.map(function (arg) {
        return arg.replace(/\/$/, '');
    }) : [];
    this._nodes = {};
    this._targets = {};
};

PrebuildConfig.prototype.hasNode = function (node) {
    return this._nodes[node];
};

PrebuildConfig.prototype.getNodes = function () {
    var nodesFromTargets = {};

    Object.keys(this._targets).forEach(function (target) {
        nodesFromTargets[path.dirname(target)] = true;
    });

    return [].concat(Object.keys(this._nodes), Object.keys(nodesFromTargets));
};

PrebuildConfig.prototype.addNodes = function (nodes) {
    var _this = this;

    Object.keys(nodes).forEach(function (node) {
        _this.addNode(node);
    });
};

PrebuildConfig.prototype.addNode = function (node) {
    node = node.replace(/\/$/, '');

    if (this.needNode(node)) {
        this._nodes[node] = true;
    }
};

PrebuildConfig.prototype.hasTarget = function (target) {
    return this._targets[target];
};

PrebuildConfig.prototype.getTargets = function () {
    return Object.keys(this._targets);
};

PrebuildConfig.prototype.addTargets = function (targets) {
    var _this = this;

    Object.keys(targets).forEach(function (target) {
        _this.addTarget(target);
    });
};

PrebuildConfig.prototype.addTarget = function (target) {
    target = target.replace(/\/$/, '');

    var node = path.dirname(target);

    if (!this.hasNode(node) && this.needTarget(target)) {
        this._targets[target] = true;
    }
};

PrebuildConfig.prototype.needNode = function (node) {
    return this.needTarget(node);
};

PrebuildConfig.prototype.needTarget = function (target) {
    var basename = path.basename(target);
    var args = this._args;
    var need = false;

    if (basename.charAt(0) === '.') {
        return false;
    }

    if (!args || !args.length) {
        return true;
    }

    args.forEach(function (arg) {
        var splitedTarget = target.split(path.sep);
        var splitedArg = arg.split(path.sep);

        if ((splitedArg.length === splitedTarget.length && target === arg) ||
            (splitedArg.length < splitedTarget.length &&
                (arg === splitedTarget.splice(0, splitedArg.length).join(path.sep))
                )
            ) {
            need = true;
        }
    });

    return need;
};

module.exports = PrebuildConfig;
