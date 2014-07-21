var path = require('path');

var PrebuildConfig = function () {
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

    if (basename.charAt(0) !== '.') {
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

    if (basename.charAt(0) !== '.') {
        this._targets[target] = true;
    }
};

module.exports = PrebuildConfig;
