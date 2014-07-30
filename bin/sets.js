#!/usr/bin/env node
var META_TASK_NAME = '__sets__';
var path = require('path');
var coa = require('coa');
var vow = require('vow');
var pkg = require('../package.json');
var MakePlatform = require('enb/lib/make');
var Server = require('../lib/server/server');
var makePlatform = new MakePlatform();
var cdir = process.cwd();

coa.Cmd()
    .name('sets')
    .title('BEM sets platform')
    .helpful()
    .opt()
        .name('version')
        .title('Version')
        .short('v')
        .long('version')
        .flag()
        .act(function () {
            return pkg.version;
        })
        .end()
    .cmd()
        .name('make')
        .title('build specified targets')
        .helpful()
        .opt()
            .name('noCache')
            .title('drop cache before running make')
            .short('n')
            .long('no-cache')
            .flag()
            .end()
        .opt()
            .name('dir')
            .title('custom project root')
            .short('d')
            .long('dir')
            .def(process.cwd())
            .end()
        .opt()
            .name('hideWarnings')
            .title('hides warnings')
            .long('hide-warnings')
            .flag()
            .end()
        .opt()
            .name('graph')
            .title('draws build graph')
            .long('graph')
            .flag()
            .end()
        .arg()
            .name('targets')
            .title('path targets to build')
            .req()
            .arr()
            .end()
        .act(function (opts, args) {
            return makePlatform.init(path.resolve(opts.dir))
                .then(function () {
                    if (opts.hideWarnings) {
                        makePlatform.getLogger().hideWarnings();
                    }

                    if (!opts.noCache) {
                        makePlatform.loadCache();
                    }

                    return makePlatform.buildTask(META_TASK_NAME, args.targets)
                        .then(function () {
                            if (opts.graph) {
                                console.log(makePlatform.getBuildGraph().render());
                            }

                            makePlatform.saveCache();
                            return makePlatform.destruct();
                        });
                })
                .fail(function (err) {
                    if (opts.graph) {
                        console.log(makePlatform.getBuildGraph().render());
                    }

                    console.error(err.stack);
                    process.exit(1);
                });
        })
        .end()
    .cmd()
        .name('server')
        .title('run development server')
        .helpful()
        .opt()
            .name('port')
            .title('socket port [8080]')
            .short('p')
            .long('port')
            .def(8080)
            .end()
        .opt()
            .name('host')
            .title('socket host [0.0.0.0]')
            .long('host')
            .def('0.0.0.0')
            .end()
        .opt()
            .name('socket')
            .title('unix socket path')
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
        .end()
    .run(process.argv.slice(2));
