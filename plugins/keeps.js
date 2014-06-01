var path = require('path');
var builder = require('./builders/keeps');
var bemdeclByKeeps = require('./techs/bemdecl-by-keeps');

module.exports = function (maker) {
    return {
        build: function (options) {
            var pattern = path.join(options.destPath, '*');
            var resolve = builder(options);

            maker._config.nodes(pattern, function (nodeConfig) {
                nodeConfig.addTech(bemdeclByKeeps);
                nodeConfig.addTarget('?.bemdecl.js');
            });

            return maker.build(resolve, options);
        }
    };
};
