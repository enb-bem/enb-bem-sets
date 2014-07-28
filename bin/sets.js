#!/usr/bin/env node
var META_TASK_NAME = '__sets__';
var path = require('path');
var coa = require('coa');
var pkg = require('../package.json');
var version = pkg.version;
var MakePlatform = require('enb/lib/make');
var makePlatform = new MakePlatform();

coa.Cmd()
    .name('sets')
    .helpful()
    .opt()
        .name('version')
        .title('Version')
        .short('v')
        .long('version')
        .flag()
        .act(function () {
            return version;
        })
        .end()
    .opt()
        .name('noCache')
        .title('Drop cache before running make')
        .short('n')
        .long('no-cache')
        .flag()
        .end()
    .opt()
        .name('dir')
        .title('Custom project root')
        .short('d')
        .long('dir')
        .def(process.cwd())
        .end()
    .opt()
        .name('hideWarnings')
        .title('Hides warnings')
        .long('hide-warnings')
        .flag()
        .end()
    .opt()
        .name('graph')
        .title('Draws build graph')
        .long('graph')
        .flag()
        .end()
    .arg()
        .name('args')
        .title('Task or path/to/target')
        .arr()
        .end()
    .act(function (opts, args) {
        args = args.args || [];

        return makePlatform.init(path.resolve(opts.dir))
            .then(function () {
                var taskNames = Object.keys(makePlatform._projectConfig._tasks);

                if (opts.hideWarnings) {
                    makePlatform.getLogger().hideWarnings();
                }

                if (!opts.noCache) {
                    makePlatform.loadCache();
                }

                if (!args.length || args.length && taskNames.indexOf(args[0]) === -1) {
                    args.unshift(META_TASK_NAME);
                }

                return makePlatform.build(args)
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
    .run(process.argv.slice(2));
