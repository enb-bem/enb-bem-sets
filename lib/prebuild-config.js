var path = require('path');

var PrebuildConfig = function (args) {
    this._args = args ? args.map(function (arg) {
        return arg.replace(/\/$/, '');
    }) : [];
    this._nodes = [];
    this._targets = [];
};

PrebuildConfig.prototype.getNodes = function () {
    return Object.keys(this._nodes);
};

PrebuildConfig.prototype.addNodes = function (nodes) {
    var _this = this;

    nodes.forEach(function (node) {
        _this.addNode(node);
    });
};

PrebuildConfig.prototype.addNode = function (node) {
    node = node.replace(/\/$/, '');

    var basename = path.basename(node);

    if (basename.charAt(0) !== '.' && this.needNode(node)) {
        this._nodes[node] = true;
    }
};

PrebuildConfig.prototype.getTargets = function () {
    return Object.keys(this._targets);
};

PrebuildConfig.prototype.addTargets = function (targets) {
    var _this = this;

    targets.forEach(function (target) {
        _this.addTarget(target);
    });
};

PrebuildConfig.prototype.addTarget = function (target) {
    target = target.replace(/\/$/, '');

    var basename = path.basename(target);

    if (basename.charAt(0) !== '.' && this.needTarget(target)) {
        this._targets[target] = true;
    }
};

PrebuildConfig.prototype.needNode = function (node) {
    var args = this._args;

    if (!args || !args.length) {
        return true;
    }

    var splitedNode = node.split(path.sep);
    var need = false;

    args.forEach(function (arg) {
        var splitedArg = arg.split(path.sep);

        if ((splitedArg.length === splitedNode.length && node === arg) ||
            (splitedArg.length < splitedNode.length &&
                (arg === splitedNode.splice(0, splitedArg.length).join(path.sep))
            ) ||
            (splitedArg.length > splitedNode.length &&
                (node === splitedArg.splice(0, splitedNode.length).join(path.sep))
            )
        ) {
            need = true;
        }
    });

    return need;
};

PrebuildConfig.prototype.needTarget = function (target) {
    var args = this._args;

    if (!args || !args.length) {
        return true;
    }

    var splitedTarget = target.split(path.sep);
    var need = false;

    args.forEach(function (arg) {
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
