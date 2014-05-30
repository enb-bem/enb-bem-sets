var path = require('path');
var rootPath = path.join(__dirname, '..', '..', '..');
var bundles = require('../../../plugins/bundles');
var sets = require(rootPath);

module.exports = function (config) {
    var maker = sets.create('sets', config);
    var examples = sets.use(bundles, maker);

    examples.build({
        destPath: 'examples.sets',
        levels: getLevels(config),
        suffixes: ['examples']
    });

    config.nodes('examples.sets/*/*', function () {});
};

function getLevels(config) {
    return [
        'blocks'
    ].map(function (level) {
        return config.resolvePath(level);
    });
}
