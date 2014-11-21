/* global chai, describe, it, before */
/* global require, console */
describe('Loop', function() {
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

    function doit(data, task, expected, done) {
        BiSheng.Loop.watch(data, function(changes) {
            expect(changes).to.deep.equal(expected)
            BiSheng.Loop.unwatch(data)
            done()
        })
        task()
    }

    it('object add', function(done) {
        var data = {}
        var task = function() {
            data.foo = 123
        }
        var expected = [{
            type: 'add',
            path: ['foo'],
            value: 123
        }]
        doit(data, task, expected, done)
    })

    it('object delete', function(done) {
        var data = {
            foo: 123
        }
        var task = function() {
            delete data.foo
        }
        var expected = [{
            type: 'delete',
            path: ['foo'],
            value: undefined,
            oldValue: 123
        }]
        doit(data, task, expected, done)
    })

    it('object update', function(done) {
        var data = {
            foo: 123
        }
        var task = function() {
            data.foo = 456
        }
        var expected = [{
            type: 'update',
            path: ['foo'],
            value: 456,
            oldValue: 123
        }]
        doit(data, task, expected, done)
    })

    it('nested object add', function(done) {
        var data = {
            a: {
                b: {
                    c: {}
                }
            }
        }
        var task = function() {
            data.a.b.c.d = 123
        }
        var expected = [{
            type: 'add',
            path: ['a', 'b', 'c', 'd'],
            value: 123
        }]
        doit(data, task, expected, done)
    })

    it('nested object delete', function(done) {
        var data = {
            a: {
                b: {
                    c: {
                        d: 123
                    }
                }
            }
        }
        var task = function() {
            delete data.a.b.c.d
        }
        var expected = [{
            type: 'delete',
            path: ['a', 'b', 'c', 'd'],
            value: undefined,
            oldValue: 123
        }]
        doit(data, task, expected, done)
    })

    it('nested object update', function(done) {
        var data = {
            a: {
                b: {
                    c: {
                        d: 123
                    }
                }
            }
        }
        var task = function() {
            data.a.b.c.d = 456
        }
        var expected = [{
            type: 'update',
            path: ['a', 'b', 'c', 'd'],
            value: 456,
            oldValue: 123
        }]
        doit(data, task, expected, done)
    })

    it('array add', function(done) {
        var data = []
        var task = function() {
            data.push(123)
        }
        var expected = [{
            type: 'add',
            path: ['0'],
            value: 123
        }]
        doit(data, task, expected, done)
    })

    it('array delete', function(done) {
        var data = [123]
        var task = function() {
            data.pop()
        }
        var expected = [{
            type: 'delete',
            path: ['0'],
            value: undefined,
            oldValue: 123
        }]
        doit(data, task, expected, done)
    })

    it('array update', function(done) {
        var data = [123]
        var task = function() {
            data[0] = 456
        }
        var expected = [{
            type: 'update',
            path: ['0'],
            value: 456,
            oldValue: 123
        }]
        doit(data, task, expected, done)
    })

    it('nested array add', function(done) {
        var data = [
            []
        ]
        var task = function() {
            data[0].push(123)
        }
        var expected = [{
            type: 'add',
            path: ['0', '0'],
            value: 123
        }]
        doit(data, task, expected, done)
    })

    it('nested array delete', function(done) {
        var data = [
            [123]
        ]
        var task = function() {
            data[0].pop()
        }
        var expected = [{
            type: 'delete',
            path: ['0', '0'],
            value: undefined,
            oldValue: 123
        }]
        doit(data, task, expected, done)
    })

    it('nested array update', function(done) {
        var data = [
            [123]
        ]
        var task = function() {
            data[0][0] = 456
        }
        var expected = [{
            type: 'update',
            path: ['0', '0'],
            value: 456,
            oldValue: 123
        }]
        doit(data, task, expected, done)
    })
})