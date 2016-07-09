/**
 * parse.js
 * 
 */
'use strict'

module.exports = {
    parse: parse
}
function parse(input) {
    const factory = require('./factory').factory()
    const Token = require('./Token')
    const PRECEDENCE = {
        ')': 0, ';': 0, ',': 0, '=': 0, ']': 0,
        '||': 1,
        '&&': 2,
        '|': 3,
        '^': 4,
        '&': 5,
        '==': 6, '!=': 6, '===': 6, '!==': 6,
        '<': 7, '>': 7, '<=': 7, '>=': 7,
        '<<': 8, '>>': 8, '>>>': 8,
        '+': 9, '-': 9,
        '*': 11, '/': 11, '%': 11
    }
    const block = [] // current output block
    const ast = { type: 'Program', body: [] }
    const symtbl = { global: {} }
    const exporting = []

    let float = false
    let heapi8 = false
    let heapu8 = false
    let heapi16 = false
    let heapu16 = false
    let heapi32 = false
    let heapu32 = false
    let heapf32 = false
    let heapf64 = false

    parseMain()
    return {
        ast: ast,           //  main code body ast
        float: float,       //  floats used?
        heapi8: heapi8,     //  heap used flags
        heapu8: heapu8,
        heapi16: heapi16,
        heapu16: heapu16,
        heapi32: heapi32,
        heapu32: heapu32,
        heapf32: heapf32,
        heapf64: heapf64,
        exporting: exportToString(),
    }

    function exportToString() {
        if (exporting.length === 0) return ''
        let str = 'return {'
        for (let i=0; i<exporting.length; i++) {
            let name = exporting[i]
            str += `${name}: ${name},`
        }
        str += '}'
        return str

    }
    function match(ch) {
        const tok = input.peek()
        return tok.type === Token.Delimiter && tok.value === ch
    }
    function matchKeyword(kw) {
        const tok = input.peek()
        return tok.type === Token.Keyword && tok.value === kw
    }

    function expect(ch) {
        if (match(ch)) input.next()
        else input.raise(`Expecting delimiter: [${ch}]`)
    }
    function expectKeyword(kw) {
        if (matchKeyword(kw)) input.next()
        else input.raise(`Expecting keyword: [${kw}]`)
    }

    function unexpected() {
        input.raise('Unexpected token: ')
    }

    function parseMain() {
        while (!input.eof()) {
            ast.body.push(parseGlobal())
            if (!input.eof()) expect(';')
        }
    }


    /**
     * No executable code in the global scope
     * Only declarative statements:
     * 
     * import
     * export
     * int
     * float
     * double
     */
    function parseGlobal() {
        //=================================
        if (matchKeyword('double')) return parseDouble()
        if (matchKeyword('export')) return parseExport()
        if (matchKeyword('float'))  return parseFloat()
        if (matchKeyword('import')) return parseImport()
        if (matchKeyword('int'))    return parseInt()
        //=================================
        unexpected()
        process.exit(0)
    }

    function parseFunction(scope, type, name) {
        if (symtbl[name.value] == null) {
            symtbl[name.value] = {}
        } else {
            throw new Exception(`Function ${name.value} already defined.`)
        }
        
        const args = []
        expect('(')
        while (!match(')')) {
            args.push({ type: input.next(), name: input.next()})
            if (match(',')) input.next()
        }
        expect(')')

        const body = []
        expect('{')
        while (!match('}')) {
            body.push(parseStatement())
            if (!input.eof()) expect(';')
        }
        expect('}')
        
        return factory.FunctionDeclaration(name, args, body)
    }

    /**
     * Everything except import, export, function
     */
    function parseStatement() {
        //=================================
        if (matchKeyword('break'))      return parseBreak()
        if (matchKeyword('case'))       return parseCase()
        if (matchKeyword('continue'))   return parseContinue()
        if (matchKeyword('do'))         return parseDo()
        if (matchKeyword('double'))     return parseDouble()
        if (matchKeyword('else'))       return parseElse()
        if (matchKeyword('float'))      return parseFloat()
        if (matchKeyword('for'))        return parseFor()
        if (matchKeyword('if'))         return parsIf()
        if (matchKeyword('int'))        return parseInt()
        if (matchKeyword('return'))     return parseReturn()
        if (matchKeyword('switch'))     return parseSwitch()
        if (matchKeyword('while'))      return parseWhile()

        const tok = input.peek()
        // if (tok.type === Token.Identifier) {
        //     input.next()
        //     expect('=')

        // }
        //=================================
        unexpected()
        process.exit(0)
    }    

    function parseExpression() {

    }

    function condition() {
        expression()
        if (match('==') || match('!=') || match('<=') || match('<') || match('>=') || match('<')) {
            input.next()
            expression()
        }
    }

    function expression() {
        if (match('+') || match('-')) {
            input.next()
        }
        term()
        while (match('+') || match('-')) {
            input.next()
            term()
        }
    }

    function term() {
        factor()
        while (match('*') || match('/')) {
            input.next()
            factor()
        }
    }

    function factor() {
        let tok = input.peek()
        if (tok.type === Token.Identifier) {

        } else if (tok.type === Token.Number) {

        } else if (match('(')'))
            expresion()
            expect(')')

    }


    function parseBreak() {
        expectKeyword('break')
    }
    function parseCase() {
        expectKeyword('case')
    }
    function parseContinue() {
        expectKeyword('continue')
    }
    function parseDo() {
        expectKeyword('do')
    }
    function parseDouble(scope) {
        scope = scope || 'global'
        expectKeyword('double')
        const name = input.next()
        if (input.peek().value === '(') {
            symtbl[scope][name.value] = { name:name.value, type:'double', func:true }
            return parseFunction(scope, 'double', name)
        } else {
            symtbl[scope][name.value] = { name:name.value, type:'double', func:false }
            return factory.DoubleDeclaration(name.value)
        }
    }
    function parseElse() {
        expectKeyword('else')
    }
    function parseExport() {
        expectKeyword('export')
        if (matchKeyword('int')) {
            expectKeyword('int')
            const name = input.peek()
            exporting.push(name.value)
            input.putBack()
            return parseInt()
        }
        if (matchKeyword('double')) {
            expectKeyword('double')
            const name = input.peek()
            exporting.push(name.value)
            input.putBack()
            return parseDouble()
        }
        if (matchKeyword('float')) {
            expectKeyword('float')
            const name = input.peek()
            exporting.push(name.value)
            input.putBack()
            return parseFloat()
        }
    }
    function parseFloat(scope) {
        scope = scope || 'global'
        expectKeyword('float')
        float = true
        const name = input.next()
        if (input.peek().value === '(') {
            symtbl[scope][name.value] = { name:name.value, type:'float', func:true }
            return parseFunction(scope, 'float', name)
        } else {
            symtbl[scope][name.value] = { name:name.value, type:'float', func:false }
            return factory.FloatDeclaration(name.value)
        }
    }
    function parseFor() {
        expectKeyword('for')
    }
    function parseInt(scope) {
        scope = scope || 'global'
        expectKeyword('int')
        const name = input.next()
        if (input.peek().value === '(') {
            symtbl[scope][name.value] = { name:name.value, type:'int', func:true }
            return parseFunction(scope, 'int', name)
        } else {
            symtbl[scope][name.value] = { name:name.value, type:'int', func:false }
            return factory.IntDeclaration(name.value)
        }
    }
    function parseIf() {
        expectKeyword('if')
        const cond = parseExpression()
        if (!match('{')) expectKeyword('then')
        const then = parseExpression()
    }
    /**
     * import func from lib
     */
    function parseImport() {
        expectKeyword('import')
        const name = input.next()
        expectKeyword('from')
        const source = input.next()
        const libname = source.value === 'Math' ? 'stdlib' : 'foreign'
        return factory.ImportDeclaration(libname, source.value, name.value);
    }
    function parseReturn() {
        let value
        expectKeyword('return')
        if (match(';')) {
            value = factory.Return()
        } else {
            value = factory.Return(parseExpression())
        }
        return value
    }
    function parseSwitch() {
        expectKeyword('switch')
    }
    function parseWhile() {
        expectKeyword('while')
    }


    
}
