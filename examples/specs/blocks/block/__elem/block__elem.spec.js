modules.define('spec', function(provide) {

    describe('block', function() {
        it('Один умножить на один должно равняться одному', function() {
            (1*1).should.to.equal(1);
        });
    });

    provide();

});
