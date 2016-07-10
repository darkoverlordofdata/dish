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
    const jsep = require('jsep')
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

    let currentFunction = ''

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
    // console.log('------------------')
    // console.log(symtbl)
    // console.log('------------------')
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
        exports: {logSum: "logSum"},
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
            if (!input.eof()) if (match(';')) expect(';')
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
        currentFunction = name.value
        
        const args = []
        expect('(')
        while (!match(')')) {
            args.push({ type: input.next(), name: input.next()})
            if (match(',')) input.next()
        }
        expect(')')

        const body = []
        expect('{')
        for (let i=0; i<args.length; i++) {
            switch(args[i].type.value) {
                case 'int':
                    body.push(factory.IntParameter(args[i].name))
                    break
                case 'float':
                    body.push(factory.FloatParameter(args[i].name))
                    break
                case 'double':
                    body.push(factory.DoubleParameter(args[i].name))
                    break
            }
        }
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
        if (matchKeyword('double'))     return parseDouble(currentFunction)
        if (matchKeyword('else'))       return parseElse()
        if (matchKeyword('float'))      return parseFloat(currentFunction)
        if (matchKeyword('for'))        return parseFor()
        if (matchKeyword('if'))         return parsIf()
        if (matchKeyword('int'))        return parseInt(currentFunction)
        if (matchKeyword('return'))     return parseReturn()
        if (matchKeyword('switch'))     return parseSwitch()
        if (matchKeyword('while'))      return parseWhile()

        if (input.peek().type === Token.Variable) {
            input.next()
            switch (input.peek().value) {
                case '(':
                    input.putBack()
                    return parseCall()
                    break
                case '=':
                    input.putBack()
                    return parseAssignment()
                    break
            }
        }
        //=================================
        unexpected()
        process.exit(0)
    }    

    function parseCall() {
        let name = input.next();
        const arg = []
        let pos = 0
        expect('(')
        while (!match(')')) {
            if (match(',')) {
                expect(',')
                pos++
            } else {
                if (!arg[pos]) arg[pos] = []
                arg[pos].push(input.next().value)
            }

        }
        expect(')')
        const params = []
        for (let i=0; i<arg.length; i++) {
            params.push(jsep(arg[i].join('')))
        }
        return factory.CallExpression(name, params)
    }

    function parseAssignment() {
        let name = input.next();
        expect('=')
        let tokens = []
        while (!match(';')) {
            tokens.push(input.next().value)
        }
        return factory.AssignmentStatement(name, jsep(tokens.join(' ')))
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
            let tokens = []
            while (!match(';')) {
                tokens.push(input.next().value)
            }

            let castExpression = ''
            switch(symtbl.global[currentFunction].type) {
                case 'int':
                    castExpression = '(('+tokens.join(' ')+')|0)'
                    break
                case 'double':
                    castExpression = '+('+tokens.join(' ')+')'
                    break
                case 'float':
                    castExpression = 'fround('+tokens.join(' ')+')'
                    break
            }
            value = factory.Return(jsep(castExpression))
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
