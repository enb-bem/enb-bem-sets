var fs = require('fs');
var inherit = require('inherit');
var connect = require('connect');
var middleware = require('./server-middleware');

module.exports = inherit(require('enb/lib/server/server'), {

    run: function () {
        var _this = this;
        var app = connect();
        var socket;

        app.use(function (req, res, next) {
            if (req.method === 'GET' && req.url === '/') {
                _this._indexPage(req, res);
            } else {
                next();
            }
        });
        app.use(middleware.createMiddleware(_this._options));
        app.use(connect.static(_this._options.cdir));

        process.on('uncaughtException', function (err) {
            console.log(err.stack);
        });

        function serverStarted() {
            console.log('Server started at ' + socket);
        }

        if (_this._socket) {
            try {
                fs.unlinkSync(_this._socket);
            } catch (e) {}
            socket = _this._socket;
            app.listen(_this._socket, function () {
                fs.chmod(_this._socket, '0777');
                serverStarted();
            });
        } else {
            socket = _this._host + ':' + _this._port;
            app.listen(_this._port, _this._host, serverStarted);
        }
    }
});
