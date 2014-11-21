/* global chai, describe, it, before */
/* global require, console */
describe('Block', function() {
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

    it('if-helper missing, interpret as with-helper, delete', function(done) {
        var tpl = heredoc(function() {
            /*
<div class="entry">
  <h1>{{title}}</h1>
  <div class="body">
    {{#noop}}{{body}}{{/noop}}
  </div>
</div>
        */
        })
        var data = {
            title: 'title',
            noop: {
                body: 'body'
            }
        }
        var task = function() {
            delete data.noop
        }
        var expected = function(container) {
            expect($.trim(container.find('.body').text())).to.equal('')
        }
        var before = function(container) {
            expect($.trim(container.find('.body').text())).to.equal('body')
        }
        bindThenCheck(data, tpl, task, expected, done, before)
    })

    it('if-helper missing, interpret as with-helper, update', function(done) {
        var tpl = heredoc(function() {
            /*
<div class="entry">
  <h1>{{title}}</h1>
  <div class="body">
    {{#noop}}{{body}}{{/noop}}
  </div>
</div>
        */
        })
        var data = {
            title: 'title',
            noop: {
                body: 'body'
            }
        }
        var task = function() {
            data.noop = {
                body: '123'
            }
        }
        var expected = function(container) {
            expect($.trim(container.find('.body').text())).to.equal('123')
        }
        var before = function(container) {
            expect($.trim(container.find('.body').text())).to.equal('body')
        }
        bindThenCheck(data, tpl, task, expected, done, before)
    })

    it('if-helper missing, interpret as if-helper, update', function(done) {
        var tpl = heredoc(function() {
            /*
<div class="entry">
  <h1>{{title}}</h1>
  <div class="body">
    {{#noop}}{{body}}{{/noop}}
  </div>
</div>
        */
        })
        var data = {
            title: 'title',
            body: 'body',
            noop: false
        }
        var task = function() {
            data.noop = true
            data.body = 123
        }
        var expected = function(container) {
            expect($.trim(container.find('.body').text())).to.equal('123')
        }
        var before = function(container) {
            expect($.trim(container.find('.body').text())).to.equal('')
        }
        bindThenCheck(data, tpl, task, expected, done, before)
    })

    it('with-helper, {} > undefined', function(done) {
        var tpl = heredoc(function() {
            /*
<div class="entry">
  <h1>{{title}}</h1>
  {{#with story}}
    <div class="intro">intro: {{{intro}}}</div>
    <div class="body">body: {{{body}}}</div>
  {{/with}}
</div>
        */
        })
        var data = {
            title: 'title',
            story: {
                intro: 'intro',
                body: 'body'
            }
        }
        var task = function() {
            data.title = 123
            data.story = undefined
        }
        var expected = function(container) {
            expect($.trim(container.find('h1').text())).to.equal('123')
            expect(container.find('.intro')).to.have.length(0)
            expect(container.find('.body')).to.have.length(0)
        }
        var before = function(container) {
            expect($.trim(container.find('h1').text())).to.equal('title')
            expect(container.find('.intro')).to.have.length(1)
            expect(container.find('.body')).to.have.length(1)
        }
        bindThenCheck(data, tpl, task, expected, done, before)
    })

    it('with-helper, {} > {}', function(done) {
        var tpl = heredoc(function() {
            /*
<div class="entry">
  <h1>{{title}}</h1>
  {{#with story}}
    <div class="intro">intro: {{{intro}}}</div>
    <div class="body">body: {{{body}}}</div>
  {{/with}}
</div>
        */
        })
        var data = {
            title: 'title',
            story: {
                intro: 'intro',
                body: 'body'
            }
        }
        var task = function() {
            data.title = 123
            data.story = {
                intro: 456,
                body: 789
            }
        }
        var expected = function(container) {
            expect($.trim(container.find('h1').text())).to.equal('123')
            expect(container.find('.intro').text()).to.match(/intro:\s?456/)
            expect(container.find('.body').text()).to.match(/body:\s?789/)
        }
        var before = function(container) {
            expect($.trim(container.find('h1').text())).to.equal('title')
            expect(container.find('.intro').text()).to.match(/intro:\s?intro/)
            expect(container.find('.body').text()).to.match(/body:\s?body/)
        }
        bindThenCheck(data, tpl, task, expected, done, before)
    })

    it('each-helper, add', function(done) {
        var tpl = heredoc(function() {
            /*
<div class="comments">
  {{#each comments}}
    <div class="comment">
      <h2>{{subject}}</h2>
      <span>{{{body}}}</span>
    </div>
  {{/each}}
  {{#unless comments}}
    <h3 class="warning">WARNING: This entry does not have any records!</h3>
  {{/unless}}
</div>
        */
        })
        var data = {
            comments: [{
                subject: 'subject' + Math.random(),
                body: 'body' + Math.random()
            }, {
                subject: 'subject' + Math.random(),
                body: 'body' + Math.random()
            }, {
                subject: 'subject' + Math.random(),
                body: 'body' + Math.random()
            }]
        }
        var task = function() {
            data.comments.push({
                subject: 'subject' + Math.random(),
                body: 'body' + Math.random()
            })
        }
        var expected = function(container) {
            expect(container.find('div.comment')).to.have.length(4)
            expect(container.find('div.comment:eq(3) h2').text()).to.equal(data.comments[3].subject)
            expect(container.find('div.comment:eq(3) span').text()).to.equal(data.comments[3].body)
            expect(container.find('h3')).to.have.length(0)
        }
        var before = function(container) {
            expect(container.find('div.comment')).to.have.length(3)
            expect(container.find('h3')).to.have.length(0)
        }
        bindThenCheck(data, tpl, task, expected, done, before)
    })

    it('each-helper, delete', function(done) {
        var tpl = heredoc(function() {
            /*
<div class="comments">
  {{#each comments}}
    <div class="comment">
      <h2>{{subject}}</h2>
      <span>{{{body}}}</span>
    </div>
  {{/each}}
  {{#unless comments}}
    <h3 class="warning">WARNING: This entry does not have any records!</h3>
  {{/unless}}
</div>
        */
        })
        var data = {
            comments: [{
                subject: 'subject' + Math.random(),
                body: 'body' + Math.random()
            }, {
                subject: 'subject' + Math.random(),
                body: 'body' + Math.random()
            }, {
                subject: 'subject' + Math.random(),
                body: 'body' + Math.random()
            }]
        }
        var task = function() {
            data.comments.pop()
        }
        var expected = function(container) {
            expect(container.find('div.comment')).to.have.length(2)
            expect(container.find('h3')).to.have.length(0)
        }
        var before = function(container) {
            expect(container.find('div.comment')).to.have.length(3)
            expect(container.find('h3')).to.have.length(0)
        }
        bindThenCheck(data, tpl, task, expected, done, before)
    })

    it('each-helper, empty', function(done) {
        var tpl = heredoc(function() {
            /*
<div class="comments">
  {{#each comments}}
    <div class="comment">
      <h2>{{subject}}</h2>
      <span>{{{body}}}</span>
    </div>
  {{/each}}
  {{#unless comments}}
    <h3 class="warning">WARNING: This entry does not have any records!</h3>
  {{/unless}}
</div>
        */
        })
        var data = {
            comments: [{
                subject: 'subject' + Math.random(),
                body: 'body' + Math.random()
            }, {
                subject: 'subject' + Math.random(),
                body: 'body' + Math.random()
            }, {
                subject: 'subject' + Math.random(),
                body: 'body' + Math.random()
            }]
        }
        var task = function() {
            data.comments = []
        }
        var expected = function(container) {
            expect(container.find('div.comment')).to.have.length(0)
            expect(container.find('h3')).to.have.length(1)
        }
        var before = function(container) {
            expect(container.find('div.comment')).to.have.length(3)
            expect(container.find('h3')).to.have.length(0)
        }
        bindThenCheck(data, tpl, task, expected, done, before)
    })

})