/* global chai, describe, it, before */
/* global require, console */
/*
    ## Run Mode

    * Manual & Synchronous

        BiSheng.auto(false)
        BiSheng.apply(function() {
            // data.foo = ...
        })

    * Automatic & Asynchronous

        BiSheng.auto(false)
        // data.foo = ...
*/
describe('Run Mode', function() {
    this.timeout(1000)

    var expect = chai.expect
    var $, _, BiSheng
    before(function(done) {
        require(['jquery', 'underscore', 'brix/bisheng'], function() {
            $ = arguments[0]
            _ = arguments[1]
            BiSheng = arguments[2]
            BiSheng.auto(true) // 自动检测
            done()
        }, function(error) {
            console.error(error)
        })
    })

    it('Manual & Synchronous', function() { // 
        var data = {}
        var task = function() {
            data.foo = 123
        }
        var expected = [{
            type: 'add',
            path: ['foo'],
            value: 123
        }]

        BiSheng
            .auto(false)
            .watch(data, function(changes) {
                expect(changes).to.deep.equal(expected)
            })
            .apply(function() {
                task()
            })
            .unwatch(data)
            .auto(true)

    })

    it('Automatic & Asynchronous', function(done) {
        var data = {}
        var task = function() {
            data.foo = 123
        }
        var expected = [{
            type: 'add',
            path: ['foo'],
            value: 123
        }]

        BiSheng.watch(data, function(changes) {
            expect(changes).to.deep.equal(expected)
            BiSheng.unwatch(data)
            done()
        })
        task()

    })
})