var path = require('path');

var SetsPrebuildConfig = function () {
    this._nodes = [];
    this._targets = [];
};

SetsPrebuildConfig.prototype.getNodes = function () {
    return Object.keys(this._nodes);
};

SetsPrebuildConfig.prototype.addNodes = function (nodes) {
    var _this = this;

    nodes.forEach(function (node) {
        _this.addNode(node);
    });
};

SetsPrebuildConfig.prototype.addNode = function (node) {
    var basename = path.basename(node);

    if (basename.charAt(0) !== '.') {
        this._nodes[node] = true;
    }
};

SetsPrebuildConfig.prototype.getTargets = function () {
    return Object.keys(this._targets);
};

SetsPrebuildConfig.prototype.addTargets = function (targets) {
    var _this = this;

    targets.forEach(function (target) {
        _this.addTarget(target);
    });
};

SetsPrebuildConfig.prototype.addTarget = function (target) {
    var basename = path.basename(target);

    if (basename.charAt(0) !== '.') {
        this._targets[target] = true;
    }
};

module.exports = SetsPrebuildConfig;
