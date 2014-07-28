#!/usr/bin/env node
var coa = require('coa');
var cdir = process.cwd();
var Server = require('../lib/server/server');
var vow = require('vow');

coa.Cmd()
    .name('server')
    .title('Run development server')
    .helpful()
    .opt()
        .name('port')
        .title('Socket port [8080]')
        .short('p')
        .long('port')
        .def(8080)
        .end()
    .opt()
        .name('host')
        .title('Socket host [0.0.0.0]')
        .long('host')
        .def('0.0.0.0')
        .end()
    .opt()
        .name('socket')
        .title('Unix socket path')
        .short('s')
        .long('host')
        .end()
    .act(function (opts) {
        var server = new Server();

        vow.when(server.init(cdir, opts))
            .then(function () {
                return server.run();
            })
            .fail(function (err) {
                console.error(err.stack);
                process.exit(1);
            });
    })
    .run(process.argv.slice(2));
