({
    block : 'page',
    head : [
        { elem : 'css', url : '_testbundle.css', ie : false },
        { elem : 'js', url : '_testbundle.spec.js' }
    ],
    content : [
        { block : 'spec' },
        { block : 'header' },
        { block : 'content' },
        { block : 'footer' }
    ]
})
