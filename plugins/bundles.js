var builder = require('./builders/bundles');

module.exports = function (maker) {
    return {
        build: function (options) {
            return maker.build(builder(options), options);
        }
    };
};
