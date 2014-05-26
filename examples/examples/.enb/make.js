var path = require('path');
var rootPath = path.join(__dirname, '..', '..', '..');

module.exports = function (config) {
    var sets = require(rootPath)(config);

    sets.bundles('examples.sets', {
        levels: getLevels(config),
        suffixes: ['examples']
    });

    config.nodes('*sets/*/*', function () {});
};

function getLevels(config) {
    return [
        'blocks'
    ].map(function (level) {
        return config.resolvePath(level);
    });
}
