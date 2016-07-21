/**
 * parse.js
 * 
 * - Blit Twiddlefast
 * 
 * Parses the statements and builds infrastructure requirements
 * expression parsing is handed off to jsep.
 */
'use strict'

module.exports = {
    parse: parse
}

function parse(input) {
    const expression = require('./expression')
    const factory = require('./factory')
    const codegen = require('escodegen')
    const esprima = require('esprima')
    const Token = require('./Token')
    const jsep0 = require('jsep')
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
    const exporting = {}

    let currentScope = ''
    let priorScope = ''
    let injectInit = false


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
        float: float,       //  floats?
        heapi8: heapi8,     //  heap useage flags
        heapu8: heapu8,
        heapi16: heapi16,
        heapu16: heapu16,
        heapi32: heapi32,
        heapu32: heapu32,
        heapf32: heapf32,
        heapf64: heapf64,
        exports: exporting
    }

    /**
     * Process an expression
     * @param tokens the expression as an array of tokens
     * @param conditional bool hint conditional or arithmetic
     * @returns esprima schema ast
     */

    /**
     * todo:
     * 
     *   skip processing inside of [...]
     * 
     */
    function jsep(tokens, conditional) {
        if (Array.isArray(tokens)) {
            if (conditional) {
                // coerce each term individually
                let scope = currentScope === '' ? 'global' : currentScope
                let temp = []
                for (let i=0; i<tokens.length; i++) {
                    let token = tokens[i]
                    if (token.type == Token.Variable) {
                        if (!symtbl[scope][token.value])  {
                            temp.push(token)
                            continue // todo: finish this
                        }
                        switch(symtbl[scope][token.value].type) {
                            case 'int':    
                                temp.push(new Token(Token.Delimiter, '('))
                                temp.push(token)
                                temp.push(new Token(Token.Delimiter, '|'))
                                temp.push(new Token(Token.Number, '0'))
                                temp.push(new Token(Token.Delimiter, ')'))
                                break
                            case 'double':  
                                temp.push(new Token(Token.Delimiter, '('))
                                temp.push(new Token(Token.Delimiter, '+'))
                                temp.push(token)
                                temp.push(new Token(Token.Delimiter, ')'))
                                break
                            case 'float':   
                                temp.push(new Token(Token.Variable, 'fround'))
                                temp.push(new Token(Token.Delimiter, '('))
                                temp.push(token)
                                temp.push(new Token(Token.Delimiter, ')'))
                                break
                        }
                    } else {
                        temp.push(token)
                    }
                }
                let str = []
                for (let i=0; i<temp.length; i++) {
                    str.push(temp[i].value)
                }
                return jsep0(str.join(' '))
            } else if (tokens.length === 2 && tokens[0].type === Token.Variable && tokens[1].value === '++')  {
                let temp = []
                console.log('do I get here?')
                temp.push(tokens[0])
                temp.push(new Token(Token.Delimiter, '='))
                temp.push(new Token(Token.Delimiter, '('))
                temp.push(tokens[0])
                temp.push(new Token(Token.Delimiter, '+'))
                temp.push(new Token(Token.Number, '1'))
                temp.push(new Token(Token.Delimiter, ')'))
                temp.push(new Token(Token.Delimiter, '|'))
                temp.push(new Token(Token.Number, '0'))
                let str = []
                for (let i=0; i<temp.length; i++) {
                    str.push(temp[i].value)
                }
                return jsep0(str.join(' '))


            }
            else {
                let str = []
                for (let i=0; i<tokens.length; i++) {
                    str.push(tokens[i].value)
                }
                return jsep0(str.join(' '))
            }
        } else {
            return jsep0(tokens)
        }
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
        if (matchKeyword('int'))    return parseInteger()
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
        currentScope = name.value
        
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
            symtbl[name.value][args[i].name.value] = { name:args[i].name.value, type:args[i].type.value, func:false }

            switch(args[i].type.value) {
                case 'int':     body.push(factory.IntParameter(args[i].name)); break
                case 'float':   body.push(factory.FloatParameter(args[i].name)); break
                case 'double':  body.push(factory.DoubleParameter(args[i].name)); break
            }
        }
        body.push(body.vars = factory.IntDeclaration('$00'))


        while (!match('}')) {
            
            body.push(parseStatement(body))
            if (!input.eof()) if (match(';')) expect(';')

        }
        expect('}')
        
        return factory.FunctionDeclaration(name, args, body)
    }

    /**
     * Everything except import, export, function
     */
    function parseStatement(body) {
        if (body) { /** only in top level of function */
            if (matchKeyword('double')) return parseDouble(currentScope)
            if (matchKeyword('float'))  return parseFloat(currentScope)
            if (matchKeyword('int'))    return parseInteger(currentScope)
            if (currentScope !== priorScope) {
                expression.reset()
                priorScope = currentScope
                for (let name in symtbl[currentScope]) {
                    let sym = symtbl[currentScope][name]
                    if (sym.init) {
                        body.push(factory.AssignmentStatement(sym.name, jsep(sym.init)))
                    }
                }
            }
        }
        //=================================
        if (matchKeyword('break'))      return parseBreak()
        if (matchKeyword('continue'))   return parseContinue()
        if (matchKeyword('do'))         return parseDo()
        if (matchKeyword('for'))        return parseFor()
        if (matchKeyword('if'))         return parsIf()
        if (matchKeyword('return'))     return parseReturn()
        if (matchKeyword('switch'))     return parseSwitch()
        if (matchKeyword('while'))      return parseWhile()
        //=================================
        if (input.peek().type === Token.Variable) {
            input.next()
            switch (input.peek().value) {
                case '(':
                    input.putBack()
                    return parseCall()
                case '=':  
                    input.putBack()
                    return parseMultiAssignment(body)
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
                arg[pos].push(input.next())
            }

        }
        expect(')')
        const params = []
        for (let i=0; i<arg.length; i++) {
            params.push(jsep(arg[i]))
        }
        return factory.CallExpression(name, params)
    }

    /**
     * parse complex assignment statements
     * 
     * @param body     
     */
    function parseMultiAssignment(body) {
        let name = ''
        let tokens = []
        while (!match(';')) {
            if (name === '') { /* next token MUST be the lhs, therefore it's the name */
                if (input.peek().type === Token.Variable) {
                    name = input.next().value
                    tokens = []
                } else {
                    input.raise('Expecting lhs variable')
                }
            } else if (match('=')) { /** eat the equal operator */
                expect('=')
            } else if (match('++')) { /** expand the ++ operator */
                expect('++') 
                tokens.push('(')
                tokens.push(name)
                tokens.push('+')
                tokens.push('1')
                tokens.push(')')
                tokens.push('|')
                tokens.push('0')
            } else { /** just copy the token to the output stack */
                tokens.push(input.next().value)
            }
        }
        let ast = jsep(tokens.join(' '))
        if (ast.type === 'BinaryExpression') {
            let lines = expression.transpile(ast)
            let names = Object.keys(lines)
            for (let index in names) {
                if (parseInt(index, 10) === names.length-1) {
                    createTemp(body, name, 'int', 0)
                    return factory.AssignmentStatement(name, jsep(lines[names[index]]))
                } else {
                    createTemp(body, names[index], 'int', 0)
                    body.push(factory.AssignmentStatement(names[index], jsep(lines[names[index]])))
                }
            }
        } else {
            return factory.AssignmentStatement(name, ast)
        }
    }

    function createTemp(body, name, type, value) {
        if (!symtbl[currentScope][name]) {
            symtbl[currentScope][name] = { name:name, type:type, func:false, init:'' }
            body.vars.declarations.push({
                "type": "VariableDeclarator",
                "id": {
                    "type": "Identifier",
                    "name": name
                },
                "init": {
                    "type": "Literal",
                    "value": value,
                    "raw": "0"
                }
            })
        }
    }
    /**
     * returns a sequence of AssignmentExpressions - for loop header
     * 
     */
    function parseAssignment() {
        const names = []
        const inits = []
        let name = ''
        let tokens = []
        while (!match(';') && !match(')')) {
            if (name === '') { /* next token MUST be the lhs, therefore it's the name */
                if (input.peek().type === Token.Variable) {
                    name = input.next().value
                    tokens = []
                } else {
                    input.raise('Expecting lhs variable')
                }
            } else if (match('=')) { /** eat the equal operator */
                expect('=')
            } else if (match('++')) { /** expand the ++ operator */
                expect('++') 
                tokens.push('(')
                tokens.push(name)
                tokens.push('+')
                tokens.push('1')
                tokens.push(')')
                tokens.push('|')
                tokens.push('0')
            } else if (match(',')) { /** a sequence of assignments */
                expect(',')
                names.push(name)
                inits.push(jsep(tokens.join(' ')))
                name = ''
            } else { /** just copy the token to the output stack */
                tokens.push(input.next().value)
            }
        }
        names.push(name)
        inits.push(jsep(tokens.join(' ')))
        if (names.length === 1) {
            return factory.AssignmentStatement(names[0], jsep(tokens.join(' ')))
        } else {
            return factory.AssignmentStatement(names, inits)
        }
        
    }


    function parseBreak() {
        expectKeyword('break')
        factory.BreakStatement()
    }
    function parseContinue() {
        expectKeyword('continue')
        factory.ContinueStatement()
    }
    function parseDo() {
        expectKeyword('do')
    }
    function parseDouble(scope) {
        scope = scope || 'global'
        expectKeyword('double')
        const name = input.next()
        if (input.peek().value === '(') {
            symtbl[scope][name.value] = { name:name.value, type:'double', func:true, init:'' }
            return parseFunction(scope, 'double', name)

        } else if (match('=')) { /** initialization */
            expect('=')
            let tokens = []
            while (!match(';')) {
                tokens.push(input.next().value)
            }
            symtbl[scope][name.value] = { name:name.value, type:'int', func:false, init:tokens.join(' ') }
            return factory.DoubleDeclaration(name.value)

        } else {
            symtbl[scope][name.value] = { name:name.value, type:'double', func:false, init:'' }
            return factory.DoubleDeclaration(name.value)
        }
    }
    function parseExport() {
        expectKeyword('export')
        if (matchKeyword('int')) {
            expectKeyword('int')
            const name = input.peek()
            exporting[name.value] = name.value
            input.putBack()
            return parseInteger()
        }
        if (matchKeyword('double')) {
            expectKeyword('double')
            const name = input.peek()
            exporting[name.value] = name.value
            input.putBack()
            return parseDouble()
        }
        if (matchKeyword('float')) {
            expectKeyword('float')
            const name = input.peek()
            exporting[name.value] = name.value
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
            symtbl[scope][name.value] = { name:name.value, type:'float', func:true, init:'' }
            return parseFunction(scope, 'float', name)

        } else if (match('=')) { /** initialization */
            expect('=')
            let tokens = []
            while (!match(';')) {
                tokens.push(input.next().value)
            }
            symtbl[scope][name.value] = { name:name.value, type:'int', func:false, init:tokens.join(' ') }
            return factory.FloatDeclaration(name.value)

        } else {
            symtbl[scope][name.value] = { name:name.value, type:'float', func:false, init:'' }
            return factory.FloatDeclaration(name.value)
        }
    }
    function parseFor() {
        expectKeyword('for')
        let init = []
        let tokens = []
        let update = []
        let body = []
        expect('(')

        while (!match(';')) { // Initialize
            init.push(parseAssignment())
        }
        expect(';')
        while (!match(';')) { // Test
            tokens.push(input.next())
        }
        expect(';')
        while (!match(')')) { // Update
            update.push(parseAssignment())
        }
        expect(')')
        expect('{')
        while (!match('}')) { // Block
            body.push(parseStatement())
            if (!input.eof()) if (match(';')) expect(';')
        }
        expect('}')
        var f = factory.ForStatement(init, jsep(tokens, true), update, body)
        return f;
        
    }
    function parseInteger(scope) {
        scope = scope || 'global'
        expectKeyword('int')
        const name = input.next()
        if (input.peek().value === '(') { /** function definition */
            symtbl[scope][name.value] = { name:name.value, type:'int', func:true, init:'' }
            return parseFunction(scope, 'int', name)

        } else if (match('=')) { /** initialization */
            expect('=')
            let tokens = []
            while (!match(';')) {
                tokens.push(input.next().value)
            }
            symtbl[scope][name.value] = { name:name.value, type:'int', func:false, init:tokens.join(' ') }
            return factory.IntDeclaration(name.value)

        } else {
            symtbl[scope][name.value] = { name:name.value, type:'int', func:false, init:'' }
            return factory.IntDeclaration(name.value)
        }
    }
    function parseIf() {
        expectKeyword('if')
        expect('(')
        let tokens = []
        while (!match(')')) {
            tokens.push(input.next())
        }
        expect(')')
        const consequent = []
        expect('{')
        while (!match('}')) {
            consequent.push(parseStatement())
            if (!input.eof()) if (match(';')) expect(';')
        }
        expect('}')
        const alternate = []
        if (matchKeyword('else')) {
            expect('{')
            while (!match('}')) {
                alternate.push(parseStatement())
                if (!input.eof()) if (match(';')) expect(';')
            }
            expect('}')
        }
        return factory.IfStatement(jsep(tokens, true), consequent, alternate)
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
            switch(symtbl.global[currentScope].type) {
                case 'int':     castExpression = '(('+tokens.join(' ')+')|0)'; break
                case 'double':  castExpression = '+('+tokens.join(' ')+')'; break
                case 'float':   castExpression = 'fround('+tokens.join(' ')+')'; break
            }
            value = factory.Return(jsep(castExpression))
        }
        return value
    }

    function parseSwitch() {
        expectKeyword('switch')
        expect('(')
        let tokens = []
        let cases = []
        let this_case = null;
        while (!match(')')) {
            tokens.push(input.next())
        }
        expect(')')
        expect('{')
        while (!match('}')) {
            while (matchKeyword('case')) {
                expectKeyword('case')
                this_case = []
                cases.push(this_case)
                while (!matchKeyword('break')) {
                    this_case.push(parseStatement())
                    if (!input.eof()) if (match(';')) expect(';')
                }
                expectKeyword('break')
                this_case.push(factory.BreakStatement())
            }
        }
        expect('}')
        return factory.SwitchStatement(jsep(tokens), cases)
    }

    function parseWhile() {
        expectKeyword('while')
        expect('(')
        let tokens = []
        while (!match(')')) {
            tokens.push(input.next())
        }
        expect(')')
        const body = []
        expect('{')
        while (!match('}')) {
            body.push(parseStatement())
            if (!input.eof()) if (match(';')) expect(';')
        }
        expect('}')
        return factory.WhileStatement(jsep(tokens, true), body)
    }

    
}
