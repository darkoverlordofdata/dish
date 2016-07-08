/**
 * parse.js
 * 
 */
'use strict'

module.exports = {parse:parse}
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

    parseMain()
    console.log(symtbl)
    return ast

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

    function delimited(start, stop, separator, parser) {
        const a = [] 
        let first = true
        expect(start)
        while (!input.eof()) {
            if (match(stop)) break
            if (first) first = false 
            else expect(separator)
            if (match(stop)) break
            a.push(parser())
        }
        expect(stop)
        return a
    }

    function parseMain() {
        while (!input.eof()) {
            ast.body.push(parseGlobal())
            if (!input.eof()) expect(';')
        }
    }


    /**
     * 
     */
    function parseGlobal() {
        if (matchKeyword('import')) return parseImport()
        if (matchKeyword('export')) return parseExport()
        if (matchKeyword('int')) return parseInt()
        if (matchKeyword('double')) return parseDouble()
        if (matchKeyword('float')) return parseFloat()
        unexpected()
        process.exit(0)
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

    function parseFunction(scope, type, name) {
        if (symtbl[name.value] == null) {
            symtbl[name.value] = {}
        } else {
            throw new Exception(`Function ${name.value} already defined.`)
        }
        
        const args = []
        const body = []

        expect('(')
        while (!match(')')) {
            args.push({ type: input.next(), name: input.next()})
            if (match(',')) input.next()
        }
        expect(')')
        expect('{')
        while (!match('}')) {
            body.push(parseExpression())
        }
        expect('}')
        return factory.FunctionDeclaration(name, args, body)
    }


    
    function parseExpression() {
        if (match('(')) {
            input.next()
            const exp = parseExpression()
            expect(')')
            return exp
        }
        //=================================
        if (matchKeyword('return')) return parseReturn()
        if (matchKeyword('int')) return parseInt()
        if (matchKeyword('double')) return parseDouble()
        if (matchKeyword('float')) return parseFloat()
        if (matchKeyword('while')) return parseWhile()
        if (matchKeyword('for')) return parseFor()
        if (matchKeyword('break')) return parseBreak()
        if (matchKeyword('continue')) return parseContinue()
        //=================================
        unexpected()
        process.exit(0)
    }

    


    function parseIf() {
        expectKeyword('if')
        const cond = parseExpression()
        if (!match('{')) expectKeyword('then')
        const then = parseExpression()
    }
    function parseExport() {
    }
    function parseReturn() {
        expectKeyword('return')
        expect(';')
        return factory.Return()
    }
    function parseFloat() {
    }
    function parseWhile() {
    }
    function parseFor() {
    }
    function parseBreak() {
    }
    function parseContinue() {
    }

    function parse_bool() {
    }

    
}
