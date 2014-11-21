/* global chai, describe, it, before */
/* global require, console */
describe('Watch', function() {
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

    function doBiShengWatch(data, properties, task, expected, done) {
        function doit(changes) {
            expect(changes).to.deep.equal(expected)
            BiSheng.unwatch(data)
            done()
        }
        if (properties) BiSheng.watch(data, properties, doit)
        else BiSheng.watch(data, doit)
        task()
    }

    it('BiSheng.watch(data, fn(changes))', function(done) {
        var data = {}
        var task = function() {
            data.foo = 123
        }
        var expected = [{
            type: 'add',
            path: ['foo'],
            value: 123
        }]
        doBiShengWatch(data, undefined, task, expected, done)
    })

    it('BiSheng.watch(data, property, fn(change))', function(done) {
        var data = {}
        var task = function() {
            data.foo = 123
        }
        var expected = {
            type: 'add',
            path: ['foo'],
            value: 123
        }
        doBiShengWatch(data, 'foo', task, expected, done)
    })

    it('BiSheng.watch(data, properties, fn(change))', function(done) {
        var data = {}
        var task = function() {
            data.foo = 123
        }
        var expected = {
            type: 'add',
            path: ['foo'],
            value: 123
        }
        doBiShengWatch(data, ['foo'], task, expected, done)
    })

    it('BiSheng.watch(data, property, fn(change)), nested', function(done) {
        var data = {
            foo: {}
        }
        var task = function() {
            data.foo.bar = 123
        }
        var expected = {
            type: 'add',
            path: ['foo', 'bar'],
            value: 123
        }
        doBiShengWatch(data, 'foo', task, expected, done)
    })

    /*
        var data = {}
        BiSheng.watch(data, ['a', 'b', 'c'], function(change) {
            console.json(change)
        })
        BiSheng.watch(data, function(change) {
            console.json(change)
        })
    */
})

describe('Unwatch', function() {
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

    function doBiShengUnwatch(expected) {
        var data = {}
        var noop = function() {}

        BiSheng.watch(data, 'foo', noop) // 1
        BiSheng.watch(data, ['foo'], noop) // 2
        BiSheng.watch(data, ['foo', 'bar'], noop) // 3
        BiSheng.watch(data, noop) // 4
        expect(BiSheng.Loop.tasks).to.have.length(4) // 共计 4 个监听函数

        expected(data, noop)
    }


    it('BiSheng.unwatch(data, properties, fn)', function(done) {
        doBiShengUnwatch(function(data, fn) {
            BiSheng.unwatch(data, 'foo', fn) // 移除第 1、2 个监听函数
            expect(BiSheng.Loop.tasks).to.have.length(2)

            BiSheng.unwatch(data, 'bar', fn) // 移除第 3 个监听函数
            expect(BiSheng.Loop.tasks).to.have.length(1)

            BiSheng.unwatch(data, fn) // 移除第 4 个监听函数
            expect(BiSheng.Loop.tasks).to.have.length(0)

            done()
        })
    })
    it('BiSheng.unwatch(data, properties)', function(done) {
        doBiShengUnwatch(function(data, fn) {
            BiSheng.unwatch(data, 'bar') // 移除第 3 个监听函数
            expect(BiSheng.Loop.tasks).to.have.length(4)

            BiSheng.unwatch(data, 'foo') // 移除第 1、2、3 个监听函数
            expect(BiSheng.Loop.tasks).to.have.length(1)

            BiSheng.unwatch(data, fn) // 移除第 4 个监听函数
            expect(BiSheng.Loop.tasks).to.have.length(0)

            done()
        })
    })
    it('BiSheng.unwatch(data, fn)', function(done) {
        doBiShengUnwatch(function(data, fn) {
            BiSheng.unwatch(data, fn) // 移除所有监听函数
            expect(BiSheng.Loop.tasks).to.have.length(0)
            done()
        })
    })
    it('BiSheng.unwatch(data)', function(done) {
        doBiShengUnwatch(function(data /*, fn*/ ) {
            BiSheng.unwatch(data) // 移除所有监听函数
            expect(BiSheng.Loop.tasks).to.have.length(0)
            done()
        })
    })
    it('BiSheng.unwatch(fn)', function(done) {
        /* jshint unused: true */
        doBiShengUnwatch(function(data, fn) {
            BiSheng.unwatch(fn) // 移除所有监听函数
            expect(BiSheng.Loop.tasks).to.have.length(0)
            done()
        })
    })

})