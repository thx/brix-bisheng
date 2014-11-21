/* global chai, describe, it, before */
/* global require, console */
describe('Form', function() {
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

    function heredoc(fn) {
        // 1. 移除起始的 function(){ /*!
        // 2. 移除末尾的 */ }
        // 3. 移除起始和末尾的空格
        return fn.toString()
            .replace(/^[^\/]+\/\*!?/, '')
            .replace(/\*\/[^\/]+$/, '')
            .replace(/^[\s\xA0]+/, '').replace(/[\s\xA0]+$/, '') // .trim()
    }

    it('input, data => value', function(done) {
        var tpl = heredoc(function() {
            /*
<p><input class="form-control" value="{{first}}"></p>
<p>{{first}}</p>
        */
        })
        var data = {
            first: 'first'
        }
        var task = function() {
            data.first = 123
        }
        var expected = function(container) {
            expect(container.find('input').val()).to.equal('123')
            expect(container.find('p:eq(1)').text()).to.equal('123')
        }
        var before = function(container) {
            expect(container.find('input').val()).to.equal('first')
            expect(container.find('p:eq(1)').text()).to.equal('first')
        }
        bindThenCheck(data, tpl, task, expected, done, before)
    })

    it('input, value => data', function(done) {
        var tpl = heredoc(function() {
            /*
<p><input class="form-control" value="{{first}}"></p>
<p>{{first}}</p>
        */
        })
        var data = {
            first: 'first'
        }
        var task = function(container) {
            container.find('input').val(123).trigger('change')
        }
        var expected = function( /*container*/ ) {
            expect(data.first).to.equal('123')
        }
        var before = function(container) {
            expect(container.find('input').val()).to.equal('first')
            expect(container.find('p:eq(1)').text()).to.equal('first')
        }
        bindThenCheck(data, tpl, task, expected, done, before)
    })

    it('select, data => value', function(done) {
        var tpl = heredoc(function() {
            /*
<p> 
    <select class="form-control" value="{{role}}"">
        <option>Admin</option>
        <option>User</option>
    </select>
</p>
<p>{{role}}</p>
        */
        })
        var data = {
            role: 'role'
        }
        var task = function() {
            data.role = 'User'
        }
        var expected = function(container) {
            expect(container.find('select').val()).to.equal('User')
            expect(container.find('p:eq(1)').text()).to.equal('User')
        }
        var before = function(container) {
            expect(container.find('select').val()).to.equal('Admin')
            expect(container.find('p:eq(1)').text()).to.equal('role')
        }
        bindThenCheck(data, tpl, task, expected, done, before)
    })

    it('select, value => data', function(done) {
        var tpl = heredoc(function() {
            /*
<p> 
    <select class="form-control" value="{{role}}"">
        <option>Admin</option>
        <option>User</option>
    </select>
</p>
<p>{{role}}</p>
        */
        })
        var data = {
            role: 'role'
        }
        var task = function(container) {
            container.find('select').val('User').trigger('change') // 必须 trigger 吗？
        }
        var expected = function( /*container*/ ) {
            expect(data.role).to.equal('User')
        }
        var before = function(container) {
            expect(container.find('select').val()).to.equal('Admin')
            expect(container.find('p:eq(1)').text()).to.equal('role')
        }
        bindThenCheck(data, tpl, task, expected, done, before)
    })

    it('textarea, data => dom', function(done) {
        var tpl = heredoc(function() {
            /*
<p><textarea class="form-control" rows="3" value="{{description}}">{{description}}</textarea></p>
<p>{{description}}</p>
        */
        })
        var data = {
            description: 'description'
        }
        var task = function() {
            data.description = 123
        }
        var expected = function(container) {
            expect(container.find('textarea').val()).to.equal('123')
            expect(container.find('p:eq(1)').text()).equal('123')
        }
        var before = function(container) {
            expect(container.find('textarea').val()).to.equal('description')
            expect(container.find('p:eq(1)').text()).equal('description')
        }
        bindThenCheck(data, tpl, task, expected, done, before)
    })

    it('textarea, dom => data', function(done) {
        var tpl = heredoc(function() {
            /*
<p><textarea class="form-control" rows="3" value="{{description}}">{{description}}</textarea></p>
<p>{{description}}</p>
        */
        })
        var data = {
            description: 'description'
        }
        var task = function(container) {
            container.find('textarea').val(123).trigger('change')
        }
        var expected = function( /*container*/ ) {
            expect(data.description).to.equal('123')
        }
        var before = function(container) {
            expect(container.find('textarea').val()).to.equal('description')
            expect(container.find('p:eq(1)').text()).equal('description')
        }
        bindThenCheck(data, tpl, task, expected, done, before)
    })

    it('checkbox, checked, data => dom, false => true', function(done) {
        var tpl = heredoc(function() {
            /*
<label>
    <input type="checkbox" checked="{{checkboxChecked}}">
    Option one is this and that&mdash;be sure to include why it's great
</label>
<p>
    {{#if checkboxChecked}}
        Ok.
    {{else}}
        Your must agree it!
    {{/if}}
</p>
        */
        })
        var data = {
            checkboxChecked: false
        }
        var task = function( /*container*/ ) {
            data.checkboxChecked = true
        }
        var expected = function(container) {
            expect(container.find('input').prop('checked')).to.be.true()
            expect($.trim(container.find('p').text())).to.equal('Ok.')
        }
        var before = function(container) {
            expect(container.find('input').prop('checked')).to.be.false()
            expect($.trim(container.find('p').text())).to.equal('Your must agree it!')
        }
        bindThenCheck(data, tpl, task, expected, done, before)
    })

    it('checkbox, checked, data => dom, true => false', function(done) {
        var tpl = heredoc(function() {
            /*
<label>
    <input type="checkbox" checked="{{checkboxChecked}}">
    Option one is this and that&mdash;be sure to include why it's great
</label>
<p>
    {{#if checkboxChecked}}
        Ok.
    {{else}}
        Your must agree it!
    {{/if}}
</p>
        */
        })
        var data = {
            checkboxChecked: 'checked'
        }
        var task = function( /*container*/ ) {
            data.checkboxChecked = false
        }
        var expected = function(container) {
            expect(container.find('input').prop('checked')).to.be.false()
            expect($.trim(container.find('p').text())).to.equal('Your must agree it!')
        }
        var before = function(container) {
            expect(container.find('input').prop('checked')).to.be.true()
            expect($.trim(container.find('p').text())).to.equal('Ok.')
        }
        bindThenCheck(data, tpl, task, expected, done, before)
    })

    it('checkbox, checked, dom => data, false => true', function(done) {
        var tpl = heredoc(function() {
            /*
<label>
    <input type="checkbox" checked="{{checkboxChecked}}">
    Option one is this and that&mdash;be sure to include why it's great
</label>
<p>
    {{#if checkboxChecked}}
        Ok.
    {{else}}
        Your must agree it!
    {{/if}}
</p>
        */
        })
        var data = {
            checkboxChecked: false
        }
        var task = function(container) {
            container.find('input').prop('checked', true).trigger('change')
        }
        var expected = function(container) {
            expect(container.find('input').prop('checked')).to.be.true()
            expect($.trim(container.find('p').text())).to.equal('Ok.')
        }
        var before = function(container) {
            expect(container.find('input').prop('checked')).to.be.false()
            expect($.trim(container.find('p').text())).to.equal('Your must agree it!')
        }
        bindThenCheck(data, tpl, task, expected, done, before)
    })

    it('checkbox, checked, dom => data, true > false', function(done) {
        var tpl = heredoc(function() {
            /*
<label>
    <input type="checkbox" checked="{{checkboxChecked}}">
    Option one is this and that&mdash;be sure to include why it's great
</label>
<p>
    {{#if checkboxChecked}}
        Ok.
    {{else}}
        Your must agree it!
    {{/if}}
</p>
        */
        })
        var data = {
            checkboxChecked: true
        }
        var task = function(container) {
            container.find('input').prop('checked', false).trigger('change')
        }
        var expected = function(container) {
            expect(container.find('input').prop('checked')).to.be.false()
            expect($.trim(container.find('p').text())).to.equal('Your must agree it!')
        }
        var before = function(container) {
            expect(container.find('input').prop('checked')).to.be.true()
            expect($.trim(container.find('p').text())).to.equal('Ok.')
        }
        bindThenCheck(data, tpl, task, expected, done, before)
    })

    // TODO radio

    it('radio, checked, data => dom', function(done) {
        var tpl = heredoc(function() {
            /*
<form>
<div class="radio">
    <label>
        <input type="radio" name="optionsRadios" value="{{radioValue1}}" checked="{{radioChecked1}}">
        Option one is this and that&mdash;be sure to include why it's great
    </label>
</div>
<div class="radio">
    <label>
        <input type="radio" name="optionsRadios" value="{{radioValue2}}" checked="{{radioChecked2}}">
        Option two can be something else and selecting it will deselect option one
    </label>
</div>
<p>
    {{optionsRadios}}
</p>
</form>
        */
        })
        var data = {
            radioChecked1: true,
            radioChecked2: false
        }
        var task = function( /*container*/ ) {
            data.radioChecked1 = false
            data.radioChecked2 = true
        }
        var expected = function(container) {
            expect(container.find('input:eq(0)').prop('checked')).to.be.false()
            expect(container.find('input:eq(1)').prop('checked')).to.be.true()
        }
        var before = function(container) {
            expect(container.find('input:eq(0)').prop('checked')).to.be.true()
            expect(container.find('input:eq(1)').prop('checked')).to.be.false()
        }
        bindThenCheck(data, tpl, task, expected, done, before)
    })

    it('radio, checked, dom => data', function(done) {
        var tpl = heredoc(function() {
            /*
<form>
<div class="radio">
    <label>
        <input type="radio" name="optionsRadios" value="{{radioValue1}}" checked="{{radioChecked1}}">
        Option one is this and that&mdash;be sure to include why it's great
    </label>
</div>
<div class="radio">
    <label>
        <input type="radio" name="optionsRadios" value="{{radioValue2}}" checked="{{radioChecked2}}">
        Option two can be something else and selecting it will deselect option one
    </label>
</div>
<p>
    {{optionsRadios}}
</p>
</form>
        */
        })
        var data = {
            optionsRadios: 'optionsRadios',
            radioValue1: 'radioValue1',
            radioValue2: 'radioValue2',
            radioChecked1: true,
            radioChecked2: false
        }
        var task = function(container) {
            container.find('input:eq(0)').prop('checked', false).trigger('change')
            container.find('input:eq(1)').prop('checked', true).trigger('change')
        }
        var expected = function(container) {
            expect(container.find('input:eq(0)').prop('checked')).to.be.false()
            expect(container.find('input:eq(1)').prop('checked')).to.be.true()
            expect($.trim(container.find('p').text())).to.equal('radioValue2')
        }
        var before = function(container) {
            expect(container.find('input:eq(0)').prop('checked')).to.be.true()
            expect(container.find('input:eq(1)').prop('checked')).to.be.false()
            expect($.trim(container.find('p').text())).to.equal('optionsRadios')
        }
        bindThenCheck(data, tpl, task, expected, done, before)
    })

})