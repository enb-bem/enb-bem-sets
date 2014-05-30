var path = require('path');
var rootPath = path.join(__dirname, '..', '..', '..');

module.exports = function (config) {
    var sets = require(rootPath)('sets', config);
    var levels = getLevels(config);

    sets.blockKeeps('docs.sets', {
        levels: levels,
        suffixes: ['md']
    });

    config.nodes('*sets/*', function (nodeConfig) {
        nodeConfig.addTechs([
            [require('../../../techs/bemdecl-by-keeps')],
            [require('enb/techs/levels'), { levels: levels }],
            [require('enb/techs/files'), { depsTarget: '?.bemdecl.js' }],
            [require('./techs/md')]
        ]);

        nodeConfig.addTarget('?.md');
    });
};

function getLevels(config) {
    return [
        'blocks'
    ].map(function (level) {
        return config.resolvePath(level);
    });
}
