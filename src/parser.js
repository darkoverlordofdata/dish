/**
 * parse.js
 * 
 * Recursive Descent Parser for D`ish
 * Parses the statements and builds linkage infrastructure 
 * expression parsing is handed off to parseExp.
 * 
 * - Blit Twiddlefast
 */
'use strict'

module.exports = {
    parse: parse
}

class Symbol {
    constructor(name, type, func, init, array, immutable) {
        this.name = name
        this.type = type
        this.func = func || false
        this.init = init || ''
        this.array = array || false
        this.immutable = immutable || false
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

function isFloat(n)         { return n === +n && n !== (n|0); }
function isInteger(n)       { return n === +n && n === (n|0); }

/**
 * Parse tokens from the input lexer
 * 
 * @param input lexer
 * @returns parsed document and flags
 */
function parse(input, mangle) {
    const expression = require('./expression')
    const factory = require('./factory')
    const codegen = require('escodegen')
    const esprima = require('esprima')
    const Token = require('./Token')
    const jsep = require('jsep')
    const ast = { type: 'Program', body: [] }
    const symtbl = { global: {} }
    const exporting = {}

    let block = [] // current output block
    let currentScope = ''
    let priorScope = ''
    let injectInit = false
    let float = false
    let malloc = false
    let heapi8 = false
    let heapu8 = false
    let heapi16 = false
    let heapu16 = false
    let heapi32 = false
    let heapu32 = false
    let heapf32 = false
    let heapf64 = false

    try {

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
            malloc: malloc,     //  use heap?
            heapi8: heapi8,     //  heap views:
            heapu8: heapu8,
            heapi16: heapi16,
            heapu16: heapu16,
            heapi32: heapi32,
            heapu32: heapu32,
            heapf32: heapf32,
            heapf64: heapf64,
            exports: exporting  //  exported API
        }
        
    } catch (ex) {
        console.log(ex.message)
        console.log(ex.stack)
        process.exit(0)
    }


    /**
     * test if the token is a delimiter  
     */
    function match(ch) {
        const tok = input.peek()
        return tok.type === Token.Delimiter && tok.value === ch
    }

    /**
     * test if the token is a keyword  
     */
    function matchKeyword(kw) {
        const tok = input.peek()
        return tok.type === Token.Keyword && tok.value === kw
    }

    /**
     * Token MUST match the delimiter
     */
    function expect(ch) {
        if (match(ch)) input.next()
        else input.raise(`Expecting delimiter: [${ch}]`)
    }

    /**
     * Token MUST match the keyword
     */
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
        if (matchKeyword('const'))  return parseConst()
        if (matchKeyword('double')) return parseDouble()
        if (matchKeyword('export')) return parseExport()
        if (matchKeyword('float'))  return parseFloat32()
        if (matchKeyword('import')) return parseImport()
        if (matchKeyword('int'))    return parseInt32()
        //=================================
        input.raise('Unexpected token: ')
    }


    /**
     * Parse Procedure Scope
     * 
     * Everything except import, export, function can be
     * defined in procedure scope. 
     */
    function parseStatement(body) {
        if (matchKeyword('const'))  return parseConst(currentScope)
        if (matchKeyword('double')) return parseDouble(currentScope)
        if (matchKeyword('float'))  return parseFloat32(currentScope)
        if (matchKeyword('int'))    return parseInt32(currentScope)
        if (currentScope !== priorScope) {
            expression.reset()
            priorScope = currentScope
            for (let name in symtbl[currentScope]) {
                let sym = symtbl[currentScope][name]
                if (sym.init) {
                    if (sym.array) {
                        malloc = true
                        const tokens = tokens2Array(sym.init)
                        body.push(factory.New(name, sym.size, { "type": "Literal", "value": tokens.length }))
                        for (let t in tokens) {
                            let sname = `${sym.heap}[(${name}+${t})<<2>>2]`
                            let value = parseExp(''+tokens[t])
                            body.push(factory.AssignmentStatement(sname, value))
                        }
                    } else {
                        body.push(factory.AssignmentStatement(sym.name, parseExp(sym.init.join(' '))))
                    }
                }
            }
        }
        //=================================
        if (matchKeyword('break'))      return parseBreak()
        if (matchKeyword('continue'))   return parseContinue()
        if (matchKeyword('do'))         return parseDo()
        if (matchKeyword('for'))        return parseFor()
        if (matchKeyword('if'))         return parseIf()
        if (matchKeyword('print'))      return parsePrint()
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
    }    

    /**
     * Constant 
     */
    function parseConst(scope) {

        expectKeyword('const')
        if (matchKeyword('double'))     return parseDouble(scope)
        if (matchKeyword('float'))      return parseFloat32(scope)
        if (matchKeyword('int'))        return parseInt32(scope)
        input.raise('Unexpected token: ')
    }

    /**
     * Parse an expression
     * @param tokens the expression as string or as an array of tokens
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
                            continue // todo?: finish this
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
        if (scope !== 'global')  {
            input.raise('Unsupported: nested functions')
        }
        if (symtbl[name.value] == null) {
            symtbl[name.value] = {}
        } else {
            input.raise(`Function ${name.value} already defined.`)
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
        body.push(body.vars = factory.IntDeclaration(mangle ? '$00' : '__00__'))
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
     * parse complex assignment statement
     * including array indexing and new operator
     * 
     * @param body   
     * @returns ast node  
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
                    heapi32 = true
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
                    token = input.next();
                }
                expect(']')
                malloc = true
                switch (token.type) {
                    case Token.Variable:
                        return factory.New(name, size, { "type": 'Identifier', "name": token.value })
                    case Token.Number:
                        return factory.New(name, size, { "type": "Literal", "value": token.value }) //, "raw": ""+token.value })
                    default:
                        input.raise('Expecting [Literal|Identifier]')
                }

            } else { /** just copy the token to the output stack */
                if (indexer) 
                    index.push(input.next().value)
                else
                    tokens.push(input.next().value)
            }
        }

        for (let i in tokens) {
            switch(tokens[i]) {
                case 'to!double':
                    tokens[i] = '__double__'
                    break
                case 'to!int':
                    tokens[i] = '__int__'
                    break
                case 'to!float':
                    tokens[i] = 'fround'
                    fround = true
                    break
            }
        }
        const ast = parseExp(tokens.join(' '))
        if (ast.type === 'BinaryExpression' || ast.type === 'MemberExpression' || index.length>0) {
            const sym = symtbl[currentScope][name]||symtbl['global'][name]
            const lhsvalue = index.length===0?null:parseExp(index.join(' '))
            const lines = expression.transpile(ast, sym, lhsvalue, mangle)
            for (let l in lines) {
                const line = lines[l]
                if (parseInt(l, 10) === lines.length-1) {
                    createVar(body, line.name, 'int', 0)
                    return factory.AssignmentStatement(line.name, parseExp(line.code))
                } else {
                    createVar(body, line.name, 'int', 0)
                    body.push(factory.AssignmentStatement(line.name, parseExp(line.code)))
                }

            }
        } else { /**  passthru simple assignment */
            return factory.AssignmentStatement(name, ast)
        }
    }

    /**
     * Create Variable
     * 
     * @param body block to create variable in
     * @param name name of the variable
     * @param type type of the variable
     * @param value value of the variable
     */
    function createVar(body, name, type, value) {
        if (name.substr(0,1) !== '$' && name.substr(0,2) !== '__') return
        if (!symtbl[currentScope][name]) {
            symtbl[currentScope][name] = new Symbol(name, type)
            // if (!block.vars) {
            //     body.push(body.vars = factory.IntDeclaration('$00'))
            // }
            if ((name === '__01__' && block.vars.declarations[0].id.name === '__00__') 
            || (name === '$01' && block.vars.declarations[0].id.name === '$00')) {
                block.vars.declarations[0] = {
                    "type": "VariableDeclarator",
                    "id": {
                        "type": "Identifier",
                        "name": name
                    },
                    "init": {
                        "type": "Literal",
                        "value": value,
                        "raw": String(value)
                    }
                }
                return
            }
            block.vars.declarations.push({
                "type": "VariableDeclarator",
                "id": {
                    "type": "Identifier",
                    "name": name
                },
                "init": {
                    "type": "Literal",
                    "value": value,
                    "raw": String(value)
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

        const body = []
        expect('{')
        while (!match('}')) {
            body.push(parseStatement(body))
            if (!input.eof()) if (match(';')) expect(';')
        }
        expect('}')

        expectKeyword('while')
        expect('(')
        const tokens = []
        while (!match(')')) {
            tokens.push(input.next())
        }
        expect(')')

        return factory.DoWhileStatement(parseExp(tokens, true), body)
        
    }
    function parseDouble(scope) {
        scope = scope || 'global'
        let isArray = false
        expectKeyword('double')
        if (match('[')) {
            expect('[')
            expect(']')
            isArray = true
            malloc = true
            heapi32 = true
        }
        const name = input.next()
        if (input.peek().value === '(') { /** function definition */
            if (isArray) {
                input.raise('Syntax Error: array found')
            }
            symtbl[scope][name.value] = new Symbol(name.value, 'double', true)
            return parseFunction(scope, 'double', name)

        } else if (match('=')) { /** initialization */
            expect('=')
            let tokens = []
            while (!match(';')) {
                tokens.push(input.next().value)
            }
            //TODO:Double and Float, also 
            symtbl[scope][name.value] = new Symbol(name.value, 'double', false, tokens, isArray)
            if (scope === 'global') {
                return factory.DoubleDeclaration(name.value, {
                    "type":     "Literal",
                    "value":    parseFloat(tokens.join('')),
                    "raw":      parseFloat(tokens.join(''))
                })
            } else  {
                return factory.DoubleDeclaration(name.value) 
            }

        } else {
            symtbl[scope][name.value] = new Symbol(name.value, 'double', false, '', isArray)
            return factory.DoubleDeclaration(name.value)
        }
        // scope = scope || 'global'
        // expectKeyword('double')
        // const name = input.next()
        // if (input.peek().value === '(') {
        //     symtbl[scope][name.value] = new Symbol(name.value, 'double', true)
        //     return parseFunction(scope, 'double', name)

        // } else if (match('=')) { /** initialization */
        //     expect('=')
        //     let tokens = []
        //     while (!match(';')) {
        //         tokens.push(input.next().value)
        //     }
        //     symtbl[scope][name.value] = new Symbol(name.value, 'int', false, tokens.join(' '))
        //     return factory.DoubleDeclaration(name.value)

        // } else {
        //     symtbl[scope][name.value] = new Symbol(name.value, 'double')
        //     return factory.DoubleDeclaration(name.value)
        // }
    }

    function parseExport() {
        expectKeyword('export')
        if (matchKeyword('int')) {
            expectKeyword('int')
            const name = input.peek()
            exporting[name.value] = name.value
            input.putBack()
            return parseInt32()
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
            return parseFloat32()
        }
    }

    function parseFloat32(scope) {
        scope = scope || 'global'
        let isArray = false
        expectKeyword('float')
        if (match('[')) {
            expect('[')
            expect(']')
            isArray = true
            malloc = true
            heapi32 = true
        }
        const name = input.next()
        if (input.peek().value === '(') { /** function definition */
            if (isArray) {
                input.raise('Syntax Error: array found')
            }
            symtbl[scope][name.value] = new Symbol(name.value, 'float', true)
            return parseFunction(scope, 'float', name)

        } else if (match('=')) { /** initialization */
            expect('=')
            let tokens = []
            while (!match(';')) {
                tokens.push(input.next().value)
            }
            //TODO:Double and Float, also 
            symtbl[scope][name.value] = new Symbol(name.value, 'float', false, tokens, isArray)
            if (scope === 'global') {
                return factory.FloatDeclaration(name.value, {
                    "type":     "Literal",
                    "value":    parseFloat(tokens.join('')),
                    "raw":      parseFloat(tokens.join(''))
                })
            } else  {
                return factory.FloatDeclaration(name.value) 
            }

        } else {
            symtbl[scope][name.value] = new Symbol(name.value, 'float', false, '', isArray)
            return factory.FloatDeclaration(name.value)
        }
        // scope = scope || 'global'
        // expectKeyword('float')
        // float = true
        // const name = input.next()
        // if (input.peek().value === '(') {
        //     symtbl[scope][name.value] = new Symbol(name.value, 'float', true)
        //     return parseFunction(scope, 'float', name)

        // } else if (match('=')) { /** initialization */
        //     expect('=')
        //     let tokens = []
        //     while (!match(';')) {
        //         tokens.push(input.next().value)
        //     }
        //     symtbl[scope][name.value] = new Symbol(name.value, 'int', false, tokens.join(' '))
        //     return factory.FloatDeclaration(name.value)

        // } else {
        //     symtbl[scope][name.value] = new Symbol(name.value, 'float')
        //     return factory.FloatDeclaration(name.value)
        // }
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

        const _init = init.length>0?init[0].expression:null
        const _update = update.length>0?update[0].expression:null

        return factory.ForStatement(_init, parseExp(tokens, true), _update, body)
        
    }

    function parseInt32(scope) {
        scope = scope || 'global'
        let isArray = false
        expectKeyword('int')
        if (match('[')) {
            expect('[')
            expect(']')
            isArray = true
            malloc = true
            heapi32 = true
        }
        const name = input.next()
        if (input.peek().value === '(') { /** function definition */
            if (isArray) {
                input.raise('Syntax Error: array found')
            }
            symtbl[scope][name.value] = new Symbol(name.value, 'int', true)
            return parseFunction(scope, 'int', name)

        } else if (match('=')) { /** initialization */
            expect('=')
            let tokens = []
            while (!match(';')) {
                tokens.push(input.next().value)
            }
            //TODO:Double and Float, also 
            symtbl[scope][name.value] = new Symbol(name.value, 'int', false, tokens, isArray)
            if (scope === 'global') {
                return factory.IntDeclaration(name.value, {
                    "type":     "Literal",
                    "value":    parseInt(tokens.join(''), 10),
                    "raw":      parseInt(tokens.join(''), 10)
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
            consequent.push(parseStatement(consequent))
            if (!input.eof()) if (match(';')) expect(';')
        }
        expect('}')
        const alternate = []
        if (matchKeyword('else')) {
            expect('{')
            while (!match('}')) {
                alternate.push(parseStatement(alternate))
                if (!input.eof()) if (match(';')) expect(';')
            }
            expect('}')
        }

        const _then = consequent.length === 0 ? null :  { "type": "BlockStatement", "body": consequent }
        const _else = alternate.length === 0 ? null : { "type": "BlockStatement", "body": alternate }

        return factory.IfStatement(parseExp(tokens, true), _then, _else)
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

    /**
     * Print statement - wrapper for console.log
     * 
     * do not use in production:
     *this construct will disable aot compilation
     * 
     */
    function parsePrint() {
        const args = []
        expectKeyword('print')
        expect('(')
        while (!match(')')) {
            let arg = input.next()
            switch(arg.type) {
                case Token.String: /** this is the only place where strings are allowed. */
                case Token.Number:
                    args.push({ type: 'Literal', value: arg.value, raw: `"${arg.value}"` })
                    break
                case Token.Variable:
                    args.push({ type: 'Identifier', name: arg.value })
                    break
            }
        }
        expect(')')
        return factory.Print(args)
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
            body.push(parseStatement(body))
            if (!input.eof()) if (match(';')) expect(';')
        }
        expect('}')
        return factory.WhileStatement(parseExp(tokens, true), body)
    }

    function tokens2Array(tokens) {
        let out = []

        tokens = tokens.slice(1, tokens.length-1)
        for (let t in tokens) {
            if ((t & 1) !== 1) out.push(tokens[t])
        }
        return out
    }
}
