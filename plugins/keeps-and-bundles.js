var builder = require('./builders/keeps-and-bundles');

module.exports = function (maker) {
    return {
        build: function (options) {
            return maker.build(builder(options), options);
        }
    };
};
