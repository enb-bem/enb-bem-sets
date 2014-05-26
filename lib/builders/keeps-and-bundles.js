var path = require('path');

function oneKeep(file) {
    var name = file.name.split('.')[0];

    return path.join(name, name + '.keep');
}

function oneBundle(file, scope) {
    var filename = file.name;
    var bundle = filename.split('.')[0];

    if (filename === 'blocks') {
        filename = '.blocks';
        bundle = '';
    } else if (file.suffix === 'blocks') {
        filename = 'blocks';
    }

    return {
        targetPath: path.join(scope, scope + '.bundles', bundle, filename),
        sourcePath: file.fullname
    };
}

module.exports = function (options) {
    options || (options = {});

    var bundleSuffixes = options.bundleSuffixes || [];
    var fileSuffixes = options.fileSuffixes || [];

    return function (file) {
        if (~fileSuffixes.indexOf(file.suffix)) {
            return oneKeep(file);
        }

        if (file.isDirectory && ~bundleSuffixes.indexOf(file.suffix)) {
            var files = file.files;
            var scope = file.name.split('.')[0];

            return files && files.length && files.map(function (file) {
                return oneBundle(file, scope);
            }).filter(function (file) {
                return file;
            });
        }

        return false;
    };
};
