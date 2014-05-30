var path = require('path');
var rootPath = path.join(__dirname, '..', '..', '..');
var blockKeeps = require('../../../plugins/block-keeps');
var sets = require(rootPath);

module.exports = function (config) {
    var maker = sets.create('sets', config);
    var docs = sets.use(blockKeeps, maker);
    var levels = getLevels(config);

    docs.build({
        destPath: 'docs.sets',
        levels: levels,
        suffixes: ['md']
    });

    config.nodes('*sets/*', function (nodeConfig) {
        nodeConfig.addTechs([
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
