/* global chai, describe, it, before */
/* global require, console */
describe('AST', function() {
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

    it('object expression', function(done) {
        var tpl = '{{title}}'
        var ast = Handlebars.parse(tpl)
        BiSheng.AST.handle(ast)

        expect(ast.statements).to.have.length(5)
        done()
    })

    it('object block', function(done) {
        var tpl = '{{#if condition}}{{title}}{{/if}}'
        var ast = BiSheng.AST.handle(Handlebars.parse(tpl))
        var statements

        statements = ast.statements
        expect(statements).to.have.length(5)
        expect(statements).have.deep.property('[1].id.string')
            .that.equal('$lastest')

        statements = ast.statements[3].program.statements
        expect(statements).to.have.length(5)
        expect(statements).have.deep.property('[1].id.string')
            .that.equal('$lastest')

        done()
    })
})