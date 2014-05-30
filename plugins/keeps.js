var builder = require('./builders/keeps');
var buildKeeps = require('./lib/keep-build');

module.exports = function (maker) {
    return {
        build: function (options) {
            var resolve = builder(options);

            return buildKeeps(maker, resolve, options);
        }
    };
};
