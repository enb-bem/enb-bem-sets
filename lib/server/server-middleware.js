var META_TASK_NAME = '__sets__';
var MakePlatform = require('enb/lib/make');
var TargetNotFoundError = require('enb/lib/errors/target-not-found-error');
var Logger = require('enb/lib/logger');
var mime = require('mime');
var send = require('send');

module.exports.createMiddleware = function (options) {
    var builder = this.createBuilder(options);
    return function (req, res, next) {
        var dt = new Date();
        var pathname = req._parsedUrl.pathname;
        builder(pathname).then(function (filename) {
            try {
                var mimeType = mime.lookup(filename);
                var mimeCharset = mimeType === 'application/javascript' ?
                    'UTF-8' :
                    mime.charsets.lookup(mimeType, null);

                res.setHeader('Content-Type', mimeType + (mimeCharset ? '; charset=' + mimeCharset : ''));
                send(req, filename).pipe(res);
                console.log('----- ' + pathname + ' ' + (new Date() - dt) + 'ms');
            } catch (err) {
                next(err);
            }
        }, function (err) {
            if (err instanceof TargetNotFoundError) {
                next();
            } else {
                next(err);
            }
        });
    };
};

module.exports.createBuilder = function (options) {
    options = options || {};
    options.cdir = options.cdir || process.cwd();
    return function (path) {
        var makePlatform = new MakePlatform();
        var targetPath = path.replace(/^\/+|\/$/g, '');
        return makePlatform.init(options.cdir).then(function () {
            makePlatform.loadCache();
            var logger = new Logger(targetPath + ' - ');
            if (options.noLog) {
                logger.setEnabled(false);
            }
            makePlatform.setLogger(logger);
            return makePlatform.buildTask(META_TASK_NAME, [targetPath]).then(function () {
                makePlatform.saveCache();
                makePlatform.destruct();
                return options.cdir + '/' + targetPath;
            });
        });
    };
};
