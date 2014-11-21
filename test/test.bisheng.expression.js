/* global chai, describe, it, before */
/* global require, console */
describe('Expression', function() {
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

    function bindThenCheck(data, tpl, task, expected, done, before) {
        var container = $('div.container')
        BiSheng.bind(data, tpl, function(content) {
            container.append(content)
            _.each(container, function(item /*, index*/ ) {
                if (before) before($(item))
            })
        })
        BiSheng.Loop.watch(data, function( /*changes*/ ) {
            _.each(container, function(item /*, index*/ ) {
                expected($(item))
            })
            container.empty()
            BiSheng.unbind(data)
            done()
        })
        task(container)
    }

    it('placeholder', function(done) {
        var tpl = '{{foo}}'
        var data = {
            foo: 123
        }
        var task = function() {
            data.foo = 456
        }
        var expected = function(container) {
            expect(container.text()).to.equal('456')
        }
        bindThenCheck(data, tpl, task, expected, done)
    })

    it('escape', function(done) {
        var tpl = '{{{foo}}}'
        var data = {
            foo: 123
        }
        var task = function() {
            data.foo = 456
        }
        var expected = function(container) {
            expect(container.text()).to.equal('456')
        }
        bindThenCheck(data, tpl, task, expected, done)
    })

    it('multi-placeholder', function(done) {

        var tpl = '{{foo}} {{foo}} {{bar}} {{bar}}'
        var data = {
            foo: 1,
            bar: 2
        }
        var task = function() {
            data.foo = 3
            data.bar = 4
        }
        var expected = function(container) {
            /*
                IE 3344
                其他 3 3 4 4
            */
            expect(container.text()).to.match(/3\s?3\s?4\s?4/)
        }
        bindThenCheck(data, tpl, task, expected, done)
    })

    it('placeholder + wrapper', function(done) {
        var tpl = '<span>{{foo}}</span>'
        var data = {
            foo: 123
        }
        var task = function() {
            data.foo = 456
        }
        var expected = function(container) {
            expect(container.text()).to.equal('456')
        }
        bindThenCheck(data, tpl, task, expected, done)
    })

    it('multi-placeholder + multi-wrapper', function(done) {
        var tpl = '<span>{{foo}}</span> <span>{{foo}}</span> <span>{{bar}}</span> <span>{{bar}}</span>'
        var data = {
            foo: 1,
            bar: 2
        }
        var task = function() {
            data.foo = 3
            data.bar = 4
        }
        var expected = function(container) {
            expect(container.text()).to.equal('3 3 4 4')
        }
        bindThenCheck(data, tpl, task, expected, done)
    })

    it('dot', function(done) {
        var tpl = '<span>{{article.title}}</span>'
        var data = {
            article: {
                title: 123
            }
        }
        var task = function() {
            data.article.title = 456
        }
        var expected = function(container) {
            expect(container.text()).to.equal('456')
        }
        bindThenCheck(data, tpl, task, expected, done)
    })

    it('slash', function(done) {
        var tpl = '<span>{{article/title}}</span>'
        var data = {
            article: {
                title: 123
            }
        }
        var task = function() {
            data.article.title = 456
        }
        var expected = function(container) {
            expect(container.text()).to.equal('456')
        }
        bindThenCheck(data, tpl, task, expected, done)
    })
})