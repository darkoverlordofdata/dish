/**
 * parse.js
 * 
 */
'use strict'

module.exports = {parse:parse}
function parse(input) {
    const es = false // estree output
    const Token = require('./Token')
    const PRECEDENCE = {
        '=': 1,
        '||': 2,
        '&&': 3,
        '<': 7, '>': 7, '<=': 7, '>=': 7, '==': 7, '!=': 7,
        '+': 10, '-': 10,
        '*': 20, '/': 20, '%': 20,
    }

    return parseStart()

    function isDelimiter(ch) {
        const tok = input.peek()
        return tok.type === Token.Delimiter && tok.value === ch
    }
    function isKeyword(kw) {
        const tok = input.peek()
        return tok.type === Token.Keyword && tok.value === kw
    }
    function isOperator(op) {
        const tok = input.peek()
        return tok.type === Token.Operator && tok.value === op
    }
    function skipDelimiter(ch) {
        if (isDelimiter(ch)) input.next()
        else input.raise(`Expecting punctuation: ${ch}`)
    }
    function skipKeyword(kw) {
        if (isKeyword(kw)) input.next()
        else input.raise(`Expecting keyword: ${kw}`)
    }
    function skipOperator(op) {
        if (isOperator(op)) input.next()
        else input.raise(`Expecting operator: ${op}`)
    }
    function unexpected() {
        input.raise('Unexpected token: ')
    }
    function maybe_binary(left, my_prec) {
        const tok = isOperator()
        if (tok) {
            const his_prec = PRECEDENCE[tok.value]
            if (his_prec > my_prec) {
                tok = input.next()
                return maybe_binary({
                    type     : tok.value == '=' ? 'assign' : 'binary',
                    operator : tok.value,
                    left     : left,
                    right    : maybe_binary(parse_atom(), his_prec)
                }, my_prec)
            }
        }
        return left
    }
    function delimited(start, stop, separator, parser) {
        const a = [] 
        let first = true
        skipDelimiter(start)
        while (!input.eof()) {
            if (isDelimiter(stop)) break
            if (first) first = false 
            else skipDelimiter(separator)
            if (isDelimiter(stop)) break
            a.push(parser())
        }
        skipDelimiter(stop)
        return a
    }
    function parse_call(func) {
        return {
            type: 'call',
            func: func,
            args: delimited('(', ')', ',', parseExpression)
        }
    }
    function parse_varname() {
        const name = input.next()
        if (name.type != Token.Variable) input.raise('Expecting variable name')
        return name.value
    }
    function parse_vardef() {
        const name = parse_varname()
        let def
        if (isOperator('=')) {
            input.next()
            def = parseExpression()
        }
        return { name: name, def: def }
    }

    function parse_if() {
        skipKeyword('if')
        const cond = parseExpression()
        if (!isDelimiter('{')) skipKeyword('then')
        const then = parseExpression()
        const ret = {
            type: 'if',
            cond: cond,
            then: then,
        }
        if (isKeyword('else')) {
            input.next()
            ret.else = parseExpression()
        }
        return ret
    }
    /**
     * import func from lib
     */
    function parse_import() {
        skipKeyword('import')
        const name = input.next()
        skipKeyword('from')
        const source = input.next()
        const libname = source.value === 'Math' ? 'stdlib' : 'foreign'
        return {
            "type": "VariableDeclaration",
            "declarations": [
                {
                    "type": "VariableDeclarator",
                    "id": {
                        "type": "Identifier",
                        "name": name.value
                    },
                    "init": {
                        "type": "MemberExpression",
                        "computed": false,
                        "object": {
                            "type": "MemberExpression",
                            "computed": false,
                            "object": {
                                "type": "Identifier",
                                "name": libname
                            },
                            "property": {
                                "type": "Identifier",
                                "name": source.value
                            }
                        },
                        "property": {
                            "type": "Identifier",
                            "name": name.value
                        }
                    }
                }
            ],
            "kind": "var"
        }
    }
    function parse_export() {
    }
    function parse_return() {
    }
    function parseFunction() {
        const name = input.peek();
        input.next();
        if (input.peek().value === ")") {
            console.log('parseFunction2')
            input.next();
            return {
                "type": "FunctionDeclaration",
                "id": {
                    "type": "Identifier",
                    "name": name.value
                },
                "params": [],
                "defaults": [],
                "body": parseBlock(),
                "generator": false,
                "expression": false
            }
        }
    }
    function parse_int() {
        skipKeyword('int')
        const name = input.next()
        if (input.peek().value === '(') {
            input.putBack()
            return parseFunction()
        } else return {
            "type": "VariableDeclaration",
            "declarations": [
                {
                    "type": "VariableDeclarator",
                    "id": {
                        "type": "Identifier",
                        "name": name.value
                    },
                    "init": {
                        "type": "Literal",
                        "value": 0,
                        "raw": "0"
                    }
                }
            ],
            "kind": "var"
        }
    }
    function parse_double() {
        skipKeyword('double')
        const name = input.next()
        if (input.peek() === '(') return {
            "type": "FunctionDeclaration",
            "id": {
                "type": "Identifier",
                "name": name.value
            },
            "params": [],
            "defaults": [],
            "body": parseBlock(),
            "generator": false,
            "expression": false
        }

        else return {
            "type": "VariableDeclaration",
            "declarations": [
                {
                    "type": "VariableDeclarator",
                    "id": {
                        "type": "Identifier",
                        "name": name.value
                    },
                    "init": {
                        "type": "Literal",
                        "value": 0,
                        "raw": "0.0",
                        "verbatim": "'0.0'"
                    }
                }
            ],
            "kind": "var"
        }
    }
    function parse_float() {
    }
    function parse_while() {
    }
    function parse_for() {
    }
    function parse_break() {
    }
    function parse_continue() {
    }

    function parse_bool() {
        return {
            type  : 'bool',
            value : input.next().value == 'true'
        }
    }

    function maybe_call(expr) {
        expr = expr()
        return isDelimiter('(') ? parse_call(expr) : expr
    }
    function parse_atom() {
        return maybe_call(function(){
            console.log(input.peek())
            if (isDelimiter('(')) {
                input.next()
                const exp = parseExpression()
                skipDelimiter(')')
                return exp
            }
            if (isDelimiter('{')) return parseBlock()
            if (isOperator('!')) {
                input.next()
                return {
                    type: 'not',
                    body: parseExpression()
                }
            }
            if (isKeyword('if')) return parse_if()
            if (isKeyword('true') || isKeyword('false')) return parse_bool()
            //=================================
            if (isKeyword('import')) return parse_import()
            if (isKeyword('export')) return parse_export()
            if (isKeyword('return')) return parse_return()
            if (isKeyword('int')) return parse_int()
            if (isKeyword('double')) return parse_double()
            if (isKeyword('float')) return parse_float()
            if (isKeyword('while')) return parse_while()
            if (isKeyword('for')) return parse_for()
            if (isKeyword('break')) return parse_break()
            if (isKeyword('continue')) return parse_continue()
            //=================================
            unexpected()
        })
    }
    function parseStart() {
        const body = []
        while (!input.eof()) {
            body.push(parseExpression())
            if (!input.eof()) skipDelimiter(';')
        }
        return { type: 'Program', body: body }
    }
    function parseBlock() {
        const prog = delimited('{', '}', ';', parseExpression)
        const body = {
            "type": "BlockStatement",
            "body": []
        }
        console.log('parseBlock', body)
        while (!input.eof()) {
            body.body.push(parseExpression())
            console.log(body)
            if (!input.eof()) skipDelimiter(';')
        }
        return body;
    }
    function parseExpression() {
        return maybe_call(function(){
            return maybe_binary(parse_atom(), 0)
        })
    }
    
}
