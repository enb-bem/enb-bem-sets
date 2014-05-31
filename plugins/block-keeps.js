var builder = require('./builders/block-keeps');
var buildKeeps = require('./lib/build-keeps');

module.exports = function (maker) {
    return {
        build: function (options) {
            var resolve = builder(options);

            return buildKeeps(maker, resolve, options);
        }
    };
};