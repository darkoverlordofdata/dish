/**
 * parse.js
 * 
 * - Blit Twiddlefast
 * 
 * Parses the statements and builds infrastructure requirements
 * expression parsing is handed off to parseExp.
 */
'use strict'

module.exports = {
    parse: parse
}

class Symbol {
    constructor(name, type, func, init, array) {
        this.name = name
        this.type = type
        this.func = func || false
        this.init = init || ''
        this.array = array || false
        switch(type) {
            case 'int': this.size = 2; break
            case 'float': this.size = 2; break
            case 'double': this.size = 3; break
        }
        switch(type) {
            case 'int': this.heap = 'HEAPI32'; break
            case 'float': this.heap = 'HEAPF32'; break
            case 'double': this.heap = 'HEAPF64'; break
        }
    }
}

function parse(input) {
    const expression = require('./expression')
    const factory = require('./factory')
    const codegen = require('escodegen')
    const esprima = require('esprima')
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
    const ast = { type: 'Program', body: [] }
    const symtbl = { global: {} }
    const exporting = {}

    let block = [] // current output block
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
    let malloc = false

    expectKeyword('module') //  first keyword is required
    const name = input.next().value
    expect(';')

    while (!input.eof()) {
        ast.body.push(parseGlobal())
        if (!input.eof()) if (match(';')) expect(';')
    }

    return {
        ast: ast,           //  main code body ast
        name: name,         //  module name
        float: float,       //  uses floats?
        malloc: malloc,     //  heap usage flags
        heapi8: heapi8,     
        heapu8: heapu8,
        heapi16: heapi16,
        heapu16: heapu16,
        heapi32: heapi32,
        heapu32: heapu32,
        heapf32: heapf32,
        heapf64: heapf64,
        exports: exporting  //  exported API
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

    /**
     * Parse Global Scope
     * 
     * No executable code in the global scope
     * Only declarative statements, imports and exports:
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
        input.raise('Unexpected token: ')
        process.exit(0)
    }


    /**
     * Parse Procedure Scope
     * 
     * Everything except import, export, function can be
     * defined in procedure scope. 
     */
    function parseStatement(body) {
        // if (body) { /** only in top level of function */
            if (matchKeyword('double')) return parseDouble(currentScope)
            if (matchKeyword('float'))  return parseFloat(currentScope)
            if (matchKeyword('int'))    return parseInteger(currentScope)
            if (currentScope !== priorScope) {
                expression.reset()
                priorScope = currentScope
                for (let name in symtbl[currentScope]) {
                    let sym = symtbl[currentScope][name]
                    if (sym.init) {
                        body.push(factory.AssignmentStatement(sym.name, parseExp(sym.init)))
                    }
                }
            }
        // }
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
                    return parseVarAssignment(body)
                case '[':
                    input.putBack()
                    return parseVarAssignment(body)
            }
        }
        //=================================
        input.raise('Unexpected token: ')
        process.exit(0)
    }    

    /**
     * Process an expression
     * @param tokens the expression as an array of tokens
     * @param conditional bool hint conditional or arithmetic
     * @returns esprima schema ast
     */
    function parseExp(tokens, conditional) {
        if ('string' === typeof tokens) {
            return jsep(tokens)
        } else {
            if (conditional) {
                // coerce each term individually
                const scope = currentScope === '' ? 'global' : currentScope
                const temp = []
                for (let i=0; i<tokens.length; i++) {
                    const token = tokens[i]
                    if (token.type === Token.Variable) {
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
                const str = []
                for (let i=0; i<temp.length; i++) {
                    str.push(temp[i].value)
                }
                return jsep(str.join(' '))
            } else if (tokens.length === 2 && tokens[0].type === Token.Variable && tokens[1].value === '++')  {
                const temp = []
                temp.push(tokens[0])
                temp.push(new Token(Token.Delimiter, '='))
                temp.push(new Token(Token.Delimiter, '('))
                temp.push(tokens[0])
                temp.push(new Token(Token.Delimiter, '+'))
                temp.push(new Token(Token.Number, '1'))
                temp.push(new Token(Token.Delimiter, ')'))
                temp.push(new Token(Token.Delimiter, '|'))
                temp.push(new Token(Token.Number, '0'))
                const str = []
                for (let i=0; i<temp.length; i++) {
                    str.push(temp[i].value)
                }
                return jsep(str.join(' '))


            }
            else {
                const str = []
                for (let i=0; i<tokens.length; i++) {
                    str.push(tokens[i].value)
                }
                return jsep(str.join(' '))
            }
        }
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

        const body = block = []
        expect('{')
        for (let i=0; i<args.length; i++) {
            const size = args[i].type.value === 'double' ? 3 : 2;
            symtbl[name.value][args[i].name.value] = new Symbol(args[i].name.value, args[i].type.value)

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
            params.push(parseExp(arg[i]))
        }
        return factory.CallExpression(name, params)
    }

    /**
     * parse complex assignment statements
     * 
     * @param body     
     */
    function parseVarAssignment(body) {
        let name = ''
        let tokens = []
        const index = []
        let lhs = true
        let indexer = false
        let heapname = ''

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
                lhs = false
            } else if (lhs && match('[')) {
                expect('[')
                indexer = true
            } else if (lhs && match(']')) {
                expect(']')
                indexer = false
            } else if (matchKeyword('new')) {
                expectKeyword('new') // = new int[N]
                let size = 0
                let tokens = []
                let token = null
                if (matchKeyword('int')) {
                    expectKeyword('int')
                    size = 2
                    heapu32 = true
                } else if (matchKeyword('float')) {
                    expectKeyword('float')
                    size = 2
                    heapf32 = true
                } else if (matchKeyword('double')) {
                    expectKeyword('double')
                    size = 3
                    heapf64 = true
                } else {
                    input.raise('Expecting type: [int|float|double]')
                }
                expect('[')
                while (!match(']')) {
                    //tokens.push(input.next().value)
                    token = input.next();
                }
                expect(']')
                malloc = true
                switch (token.type) {
                    case Token.Number:      return factory.New(name, token.value, size, "Literal")
                    case Token.Variable:    return factory.New(name, token.value, size, "Identifier")
                }
                input.raise('Expecting [Literal|Identifier]')

            } else { /** just copy the token to the output stack */
                if (indexer) 
                    index.push(input.next().value)
                else
                    tokens.push(input.next().value)
            }
        }

        const ast = parseExp(tokens.join(' '))
        if (ast.type === 'BinaryExpression' || index.length>0) {
            const sym = symtbl[currentScope][name]||symtbl['global'][name]
            const lhs = index.length===0?null:parseExp(index.join(' '))
            const lines = expression.transpile(ast, sym, lhs)
            for (let l in lines) {
                const line = lines[l]
                if (parseInt(l, 10) === lines.length-1) {
                    createTemp(body, line.name, 'int', 0)
                    return factory.AssignmentStatement(line.name, parseExp(line.code))
                } else {
                    createTemp(body, line.name, 'int', 0)
                    body.push(factory.AssignmentStatement(line.name, parseExp(line.code)))
                }

            }
        } else {
            return factory.AssignmentStatement(name, ast)
        }
    }

    function createTemp(body, name, type, value) {
        if (name[0] !== '$') return
        if (!symtbl[currentScope][name]) {
            symtbl[currentScope][name] = new Symbol(name, type)
            block.vars.declarations.push({
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
                inits.push(parseExp(tokens.join(' ')))
                name = ''
            } else { /** just copy the token to the output stack */
                tokens.push(input.next().value)
            }
        }
        names.push(name)
        inits.push(parseExp(tokens.join(' ')))
        if (names.length === 1) {
            return factory.AssignmentStatement(names[0], parseExp(tokens.join(' ')))
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
            symtbl[scope][name.value] = new Symbol(name.value, 'double', true)
            return parseFunction(scope, 'double', name)

        } else if (match('=')) { /** initialization */
            expect('=')
            let tokens = []
            while (!match(';')) {
                tokens.push(input.next().value)
            }
            symtbl[scope][name.value] = new Symbol(name.value, 'int', false, tokens.join(' '))
            return factory.DoubleDeclaration(name.value)

        } else {
            symtbl[scope][name.value] = new Symbol(name.value, 'double')
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
            symtbl[scope][name.value] = new Symbol(name.value, 'float', true)
            return parseFunction(scope, 'float', name)

        } else if (match('=')) { /** initialization */
            expect('=')
            let tokens = []
            while (!match(';')) {
                tokens.push(input.next().value)
            }
            symtbl[scope][name.value] = new Symbol(name.value, 'int', false, tokens.join(' '))
            return factory.FloatDeclaration(name.value)

        } else {
            symtbl[scope][name.value] = new Symbol(name.value, 'float')
            return factory.FloatDeclaration(name.value)
        }
    }
    function parseFor() {
        const init = []
        const tokens = []
        const update = []
        const body = []
        expectKeyword('for')
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
            body.push(parseStatement(body))
            if (!input.eof()) if (match(';')) expect(';')
        }
        expect('}')
        return factory.ForStatement(init, parseExp(tokens, true), update, body)
        
    }

    function parseInteger(scope) {
        scope = scope || 'global'
        let isArray = false
        expectKeyword('int')
        if (match('[')) {
            expect('[')
            expect(']')
            isArray = true
        }
        const name = input.next()
        if (input.peek().value === '(') { /** function definition */
            if (isArray) throw new Error('Syntax Error')
            symtbl[scope][name.value] = new Symbol(name.value, 'int', true)
            return parseFunction(scope, 'int', name)

        } else if (match('=')) { /** initialization */
            expect('=')
            let tokens = []
            while (!match(';')) {
                tokens.push(input.next().value)
            }
            //TODO:Double and Float, also 
            symtbl[scope][name.value] = new Symbol(name.value, 'int', false, tokens.join(' '), isArray)
            if (scope === 'global') {
                return factory.IntDeclaration(name.value, {
                    "type": "Literal",
                    "value": parseInt(tokens.join(''), 10),
                    "raw": parseInt(tokens.join(''), 10)
                })
            } else  {
                return factory.IntDeclaration(name.value) 
            }

        } else {
            symtbl[scope][name.value] = new Symbol(name.value, 'int', false, '', isArray)
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
        return factory.IfStatement(parseExp(tokens, true), consequent, alternate)
    }
    /**
     * import func from lib:
     * 
     * import method = lib.method;
     */
    function parseImport() {
        expectKeyword('import')
        const name = input.next()
        expect('=')
        const libname = input.next()
        const source = libname.value === 'Math' ? 'stdlib' : 'foreign'
        expect('.')
        const method = input.next()
        return factory.ImportDeclaration(source, libname.value, name.value)
    }

    function parseReturn() {
        let value
        expectKeyword('return')
        if (match(';')) {
            value = factory.Return()
        } else {
            const tokens = []
            while (!match(';')) {
                tokens.push(input.next().value)
            }

            let castExpression = ''
            switch(symtbl.global[currentScope].type) {
                case 'int':     castExpression = '(('+tokens.join(' ')+')|0)'; break
                case 'double':  castExpression = '+('+tokens.join(' ')+')'; break
                case 'float':   castExpression = 'fround('+tokens.join(' ')+')'; break
            }
            value = factory.Return(parseExp(castExpression))
        }
        return value
    }

    function parseSwitch() {
        expectKeyword('switch')
        expect('(')
        const tokens = []
        const cases = []
        const this_case = null;
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
        return factory.SwitchStatement(parseExp(tokens), cases)
    }

    function parseWhile() {
        expectKeyword('while')
        expect('(')
        const tokens = []
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
        return factory.WhileStatement(parseExp(tokens, true), body)
    }
}
