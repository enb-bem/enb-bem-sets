var path = require('path');
var rootPath = path.join(__dirname, '..', '..', '..');

module.exports = function (config) {
    var sets = require(rootPath)('sets',config);
    var levels = getLevels(config);

    sets.keepsAndBundles('specs.sets', {
        levels: levels,
        fileSuffixes: ['spec.js'],
        bundleSuffixes: ['specs']
    });

    config.nodes('*sets/*', function (nodeConfig) {
        nodeConfig.addTechs([
            [require('../../../techs/bemdecl-by-keeps')],
            [require('enb/techs/levels'), { levels: levels }],
            [require('enb/techs/files'), { depsTarget: '?.bemdecl.js' }],
            [require('enb/techs/js'), { target: '?.spec.js', sourceSuffixes: ['spec.js'] }]
        ]);

        nodeConfig.addTarget('?.spec.js');
    });

    config.nodes('*sets/*/*.bundles/*', function () {});
};

function getLevels(config) {
    return [
        'blocks'
    ].map(function (level) {
        return config.resolvePath(level);
    });
}
