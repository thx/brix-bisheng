/* global chai, describe, it, before */
/* global require, console */
describe('Locator', function() {
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

    // 创建

    it('create script locator', function() {
        var ScriptLocator = BiSheng.Locator.ScriptLocator
        var locator = ScriptLocator.create({
            guid: 1,
            slot: "start"
        })
        var parsed = $('<div>' + locator + '</div>').contents()[0].nodeValue
        expect(parsed).to.equal('<script guid="1" slot="start"></script>')
    })

    it('create comment locator', function() {
        var JsonCommentLocator = BiSheng.Locator.JsonCommentLocator
        var locator = JsonCommentLocator.create({
            guid: 1,
            slot: "start"
        })
        var parsed = $('<div>' + locator + '</div>').contents()[0].nodeValue
        expect(parsed).to.equal('<!-- {"guid":1,"slot":"start"} -->')
    })

    // 匹配

    it('match script locator', function() {
        var ScriptLocator = BiSheng.Locator.ScriptLocator
        var locator = '<script guid="1" slot="start"></script>'
        var ma = ScriptLocator.getLocatorRegExp().exec(locator)
        expect(ma).to.be.an('array')
            .that.have.deep.property('[1]', locator)
    })

    it('match comment locator', function() {
        var JsonCommentLocator = BiSheng.Locator.JsonCommentLocator
        var locator = '<!-- {"guid":1,"slot":"start"} -->'
        var ma = JsonCommentLocator.getLocatorRegExp().exec(locator)
        expect(ma).to.be.an('array')
            .that.have.deep.property('[2]', '{"guid":1,"slot":"start"}')
    })

    // 查找

    it('find script locator', function() {
        var ScriptLocator = BiSheng.Locator.ScriptLocator
        var container = $('<div>')
            .append('<script guid="1" slot="start" type="todo"></script>')
            .append('<script guid="1" slot="end"   type="todo"></script>')
            .append('<script guid="2" slot="start" type="todo"></script>')
            .append('<script guid="2" slot="end"   type="todo"></script>')
        var locators = ScriptLocator.find({
            slot: 'start'
        }, container)
        expect(locators).to.have.length(2)
    })

    it('find json comment locator', function() {
        var JsonCommentLocator = BiSheng.Locator.JsonCommentLocator
        var container = $('<div>')
            .append('<!-- {guid:"1",slot:"start"} -->')
            .append('<!-- {guid:"1",slot:"end"} -->')
            .append('<!-- {guid:"2",slot:"start"} -->')
            .append('<!-- {guid:"2",slot:"end"} -->')
        var locators = JsonCommentLocator.find({
            slot: 'start'
        }, container)
        expect(locators).to.have.length(2)
    })

    // 解析

    it('parse script locator', function() {
        var ScriptLocator = BiSheng.Locator.ScriptLocator
        var container = $('<div>')
            .append('<script guid="1" slot="start" type="todo"></script>')
            .append('<script guid="1" slot="end"   type="todo"></script>')
            .append('<script guid="2" slot="start" type="todo"></script>')
            .append('<script guid="2" slot="end"   type="todo"></script>')

        var locators = ScriptLocator.find({
            slot: 'start'
        }, container)
        expect(locators).to.have.length(2)
        _.each(locators, function(locator) {
            expect(ScriptLocator.parse(locator, 'slot')).to.equal('start')
        })

        locators = ScriptLocator.find({
            guid: '1'
        }, container)
        expect(locators).to.have.length(2)
        _.each(locators, function(locator) {
            expect(ScriptLocator.parse(locator, 'guid')).to.equal('1')
        })
    })

    it('parse json comment locator', function() {
        var JsonCommentLocator = BiSheng.Locator.JsonCommentLocator
        var container = $('<div>')
            .append('<!-- {guid:"1",slot:"start"} -->')
            .append('<!-- {guid:"1",slot:"end"} -->')
            .append('<!-- {guid:"2",slot:"start"} -->')
            .append('<!-- {guid:"2",slot:"end"} -->')

        var locators = JsonCommentLocator.find({
            slot: 'start'
        }, container)
        expect(locators).to.have.length(2)
        _.each(locators, function(locator) {
            expect(JsonCommentLocator.parse(locator, 'slot')).to.equal('start')
        })

        locators = JsonCommentLocator.find({
            guid: '1'
        }, container)
        expect(locators).to.have.length(2)
        _.each(locators, function(locator) {
            expect(JsonCommentLocator.parse(locator, 'guid')).to.equal('1')
        })
    })

    // 更新

    it('update json comment locator', function() {
        var JsonCommentLocator = BiSheng.Locator.JsonCommentLocator
        var container = $('<div>')
            .append('<!-- {guid:"1",slot:"start"} -->')
            .append('<!-- {guid:"1",slot:"end"} -->')
            .append('<!-- {guid:"2",slot:"start"} -->')
            .append('<!-- {guid:"2",slot:"end"} -->')

        var locators = JsonCommentLocator.find({
            slot: 'start'
        }, container)
        expect(locators).to.have.length(2)
        _.each(locators, function(locator) {
            JsonCommentLocator.update(locator, {
                type: 'text',
                path: [1, 2, 3].join('.')
            })
        })

        locators = JsonCommentLocator.find({
            slot: 'start'
        }, container)
        expect(locators).to.have.length(2)
        _.each(locators, function(locator) {
            expect(JsonCommentLocator.parse(locator, 'type')).to.equal('text')
            expect(JsonCommentLocator.parse(locator, 'path')).to.equal('1.2.3')
        })
    })

    // 目标元素

    it('parse target', function() {
        var JsonCommentLocator = BiSheng.Locator.JsonCommentLocator
        var container = $('<div>')
            .append('<!-- {guid:"1",slot:"start"} -->')
            .append('<span>target1-1</span>')
            .append('<span>target1-2</span>')
            .append('<!-- {guid:"1",slot:"end"} -->')
            .append('<!-- {guid:"2",slot:"start"} -->')
            .append('<span>target2-1</span>')
            .append('<span>target2-2</span>')
            .append('<!-- {guid:"2",slot:"end"} -->')

        var locators = JsonCommentLocator.find({
            slot: 'start'
        }, container)
        expect(locators).to.have.length(2)
        _.each(locators, function(locator) {
            var target = JsonCommentLocator.parseTarget(locator)
            expect(target).to.have.length(2)
        })
    })
})