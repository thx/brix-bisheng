/* global chai, describe, it, before */
/* global require, console */
describe('Helper', function() {
    this.timeout(1000)

    var expect = chai.expect
    var $, _, Handlebars, BiSheng
    before(function(done) {
        require(['jquery', 'underscore', 'handlebars', 'brix/bisheng'], function() {
            $ = arguments[0]
            _ = arguments[1]
            Handlebars = arguments[2]
            BiSheng = arguments[3]
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

    it('helper expression', function(done) {
        Handlebars.registerHelper('color', function(foo) {
            return foo < 30 && 'red' || foo < 70 && 'yellow' || 'green'
        })
        var tpl = '{{color foo}}'
        var data = {
            foo: 80
        }
        var task = function() {
            data.foo = 60
        }
        var expected = function(container) {
            expect(container.text()).to.equal('yellow')
        }
        bindThenCheck(data, tpl, task, expected, done)
    })

    it('helper attribute', function(done) {
        Handlebars.registerHelper('color', function(foo) {
            return foo < 30 && 'red' || foo < 70 && 'yellow' || 'green'
        })
        var tpl = '<div class="{{color foo}}" style="background-color: {{color foo}};">{{color foo}}</div>'
        var data = {
            foo: 80
        }
        var task = function() {
            data.foo = 60
        }
        var expected = function(container) {
            expect(container.find('div').css('background-color')).to.equal('rgb(255, 255, 0)')
            expect(container.find('div').hasClass('yellow')).to.be.true()
            expect(container.text()).to.equal('yellow')
        }
        bindThenCheck(data, tpl, task, expected, done)
    })

})