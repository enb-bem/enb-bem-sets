var path = require('path');
var bemdeclByKeeps = require('../techs/bemdecl-by-keeps');

module.exports = function (maker, resolve, options) {
    var pattern = path.join(options.destPath, '*');

    maker._config.nodes(pattern, function (nodeConfig) {
        nodeConfig.addTech(bemdeclByKeeps);
        nodeConfig.addTarget('?.bemdecl.js');
    });

    maker.build(resolve, options);

    return maker._deferred.promise();
};
