/* global chai, describe, it, before */
/* global require, console */
describe('Attribute', function() {
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

    it('title', function(done) {
        var tpl = '<span title="{{title}}">{{title}}</span>'
        var data = {
            title: 123
        }
        var task = function() {
            data.title = 456
        }
        var expected = function(container) {
            expect(container.find('span').attr('title')).to.equal('456')
            expect(container.find('span').text()).to.equal('456')
        }
        bindThenCheck(data, tpl, task, expected, done)
    })

    it('class', function(done) {
        var tpl = '<span class="before {{title}} after">{{title}}</span>'
        var data = {
            title: 123
        }
        var task = function() {
            data.title = 456
        }
        var expected = function(container) {
            expect(container.find('span').hasClass('before')).to.be.true()
            expect(container.find('span').hasClass('after')).to.be.true()
            expect(container.find('span').hasClass('456')).to.be.true()
            expect(container.find('span').text()).to.equal('456')
        }
        bindThenCheck(data, tpl, task, expected, done)
    })

    /*
        IE 不支持非法的样式值（这里指插入了定位符），导致无法扫描到需监听的样式。
        在 BiSheng.js 内部，会先把 style 替换为 bs-style，待渲染、扫描之后，再改回 style。
    */
    it('style', function(done) {
        var tpl = '<div style="width: {{width}}px; height: {{height}}px; background-color: green;">{{width}}, {{height}}</div>'
        var data = {
            width: 100,
            height: 50
        }
        var task = function() {
            data.width = 200
            data.height = 100
        }
        var expected = function(container) {
            expect(container.find('div').css('width')).to.equal('200px')
            expect(container.find('div').css('height')).to.equal('100px')
            expect(container.find('div').text()).to.match(/200,\s?100/) // IE 会自动忽略前导空白符
            var color = container.find('div').css('backgroundColor')
            expect(color === 'rgb(0, 128, 0)' || color === 'green').to.be.true()
        }
        bindThenCheck(data, tpl, task, expected, done)
    })

    it('part', function(done) {
        var tpl = '<a href="/testcase/{{id}}">{{id}}</a>'
        var data = {
            id: 123
        }
        var task = function() {
            data.id = 456
        }
        var expected = function(container) {
            var href = container.find('a').attr('href')
            expect(href).to.match(/\/testcase\/456$/)
            expect(container.find('a').text()).to.equal('456')
        }
        bindThenCheck(data, tpl, task, expected, done)
    })

    it('block unless true > false', function(done) {
        var tpl = '<div class="before {{#if length}}show{{/if}} {{#unless length}}hide{{/unless}} after">{{length}}</div>'
        var data = {
            length: true
        }
        var task = function() {
            data.length = false
        }
        var expected = function(container) {
            expect(container.find('div').hasClass('before')).to.be.true()
            expect(container.find('div').hasClass('after')).to.be.true()
            expect(container.find('div').hasClass('show')).to.be.false()
            expect(container.find('div').hasClass('hide')).to.be.true()
            expect(container.find('div').text()).to.equal('false')
        }
        var before = function(container) {
            expect(container.find('div').hasClass('show')).to.be.true()
            expect(container.find('div').hasClass('hide')).to.be.false()
            expect(container.find('div').text()).to.equal('true')
        }
        bindThenCheck(data, tpl, task, expected, done, before)
    })

    it('block unless false > true', function(done) {
        var tpl = '<div class="before {{#if length}}show{{/if}} {{#unless length}}hide{{/unless}} after">{{length}}</div>'
        var data = {
            length: false
        }
        var task = function() {
            data.length = true
        }
        var expected = function(container) {
            expect(container.find('div').hasClass('before')).to.be.true()
            expect(container.find('div').hasClass('after')).to.be.true()
            expect(container.find('div').hasClass('show')).to.be.true()
            expect(container.find('div').hasClass('hide')).to.be.false()
            expect(container.find('div').text()).to.equal('true')
        }
        var before = function(container) {
            expect(container.find('div').hasClass('show')).to.be.false()
            expect(container.find('div').hasClass('hide')).to.be.true()
            expect(container.find('div').text()).to.equal('false')
        }
        bindThenCheck(data, tpl, task, expected, done, before)
    })

})