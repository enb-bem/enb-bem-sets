var builder = require('./builders/keeps-and-bundles');
var buildKeeps = require('./lib/build-keeps');

module.exports = function (maker) {
    return {
        build: function (options) {
            var resolve = builder(options);

            return buildKeeps(maker, resolve, options);
        }
    };
};
