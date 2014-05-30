var path = require('path');
var rootPath = path.join(__dirname, '..', '..', '..');
var keepsAndBundles = require('../../../plugins/keeps-and-bundles');
var sets = require(rootPath);

module.exports = function (config) {
    var maker = sets.create('sets', config);
    var specs = sets.use(keepsAndBundles, maker);
    var levels = getLevels(config);

    specs.build({
        destPath: 'specs.sets',
        levels: levels,
        fileSuffixes: ['spec.js'],
        bundleSuffixes: ['specs']
    });

    config.nodes('specs.sets/*', function (nodeConfig) {
        nodeConfig.addTechs([
            [require('enb/techs/levels'), { levels: levels }],
            [require('enb/techs/files'), { depsTarget: '?.bemdecl.js' }],
            [require('enb/techs/js'), { target: '?.spec.js', sourceSuffixes: ['spec.js'] }]
        ]);

        nodeConfig.addTarget('?.spec.js');
    });

    config.nodes('specs.sets/*/*.bundles/*', function () {});
};

function getLevels(config) {
    return [
        'blocks'
    ].map(function (level) {
        return config.resolvePath(level);
    });
}
