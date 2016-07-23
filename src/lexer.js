/*
 * Lexer
 * 
 * @param source text
 * @returns lexer interface to the source
 *
 */
'use strict'

const Token = require('./Token')

module.exports = function(source) {

    /**
     * load all the tokens into an array for simple put-back
     */
    let tokens = []
    let index = 0;
    let input = Tokenizer(source)
    while (!input.eof()) tokens.push(input.next())

    function eof() { return index >= tokens.length; }
    function peek() { return tokens[index]; }
    function next() { return tokens[index++]; }
    function putBack() {index--; }
    function raise(msg) {
        let t = tokens[index];
        console.log(`${msg} found ${Token[t.type]} '${t.value}' at line ${t.line}, col ${t.col}`)
    }

    return {
        next: next,
        peek: peek,
        eof: eof,
        putBack: putBack,
        raise: raise
    }

}

/**
 * break the input stream up into tokens
 * skip over comments
 */
function Tokenizer(source) {

    const input = InputStream(source)
    let current = null
    
    return {
        next: next,
        peek: peek,
        eof: eof,
    }


    function isWhitespace(ch) { return /\s/.test(ch) }
    function isDigit(ch)      { return /[0-9]/.test(ch) }
    function isHex(ch)        { return /[0-9a-fA-FxX]/.test(ch) }
    function isIdStart(ch)    { return /[a-z_]/i.test(ch) }
    function isId(ch)         { return /[a-z_0-9]/i.test(ch) }
    function isDelim(ch)      { return /[.,;(){}[\]:]/.test(ch) }
    function isOperator(ch)   { return /[+\-*\/%=&|<>!^]/.test(ch) }
    function isKeyword(wd)    {
        return /break|case|continue|do|double|else|export|float|for|from|if|import|int|module|new|return|switch|while/.test(wd);
    }


    /*
    * next Token
    *
    * @returns the next new token from the source
    */
    function nextToken() {
        let ch = ''

        readWhile(isWhitespace);
        if (input.eof()) {
            return null
        }
        if (input.peek(2) === "//") {
            skipTo('\n')
            return nextToken()
        }
        if (input.peek(3) === "/**") {
            skipTo("*/")
            return nextToken()
        }
        if (input.peek(2) === "/*") {
            skipTo("*/")
            return nextToken()
        }
        ch = input.peek()
        if (ch === '"') {
            return new Token(Token.String, readEscaped('"'), input.getLine(), input.getCol())
        }
        if (ch === "'") {
            return new Token(Token.String, readEscaped("'"), input.getLine(), input.getCol())
        }
        if (isDigit(ch)) {
            return new Token(Token.Number, readNumber(), input.getLine(), input.getCol())
        }
        if (isIdStart(ch)) {
            return (function(id) {
            return new Token((isKeyword(id) ? Token.Keyword : Token.Variable), id, input.getLine(), input.getCol())
            })(readWhile(isId))
        }
        if (isDelim(ch)) {
            return new Token(Token.Delimiter, input.next(), input.getLine(), input.getCol())
        }
        if (isOperator(ch)) {
            // return new Token(Token.Operator, readWhile(isOperator), input.getLine(), input.getCol())
            return new Token(Token.Delimiter, readWhile(isOperator), input.getLine(), input.getCol())
        }

        throw new Error(`Can't handle character:  ${ch}`)
    }

    /*
    * read Number
    *
    * @returns the next number from the source stream
    */
    function readNumber() {
        let has_dot = false
        let is_hex = false

        let input = readWhile(function(ch) {
            if (ch === '.') {
                if (has_dot) {
                    return false
                }
                has_dot = true
                return true
            }
            if (ch === 'x') {
                if (is_hex) {
                    return false
                }
                is_hex = true
            }
            if (is_hex)
                return isHex(ch)
            else
                return isDigit(ch)
        })
        if (is_hex) {
            return parseInt(input, 16)
        }
        else {
            if (has_dot) {
                return parseFloat(input)
            } 
            else {
                return parseInt(input, 10)
            }
        }
    }

    /*
    * read Escaped
    *
    * @returns the next escaped string until end
    */
    function readEscaped(end) {
        let ch = ''
        let escaped = false
        let str = ''

        input.next()
        while (!input.eof()) {
            ch = input.next()
            if (escaped) {
                str += ch
                escaped = false
            } else if (ch === '\\') {
                escaped = true
            } else if (ch === end) {
                break
            } else {
                str += ch
            }
        }
        return str
    }

    /*
    * read While
    *
    * @param predicate function to call to test
    * @returns the next token until predicate
    */
    function readWhile(predicate) {
        let str = ''

        while (!input.eof() && predicate(input.peek())) {
            str += input.next()
        }
        return str
    }

    /*
    * skip to end
    *
    * skip to the end string
    */
    function skipTo(end) {
        let len = end.length

        while (!input.eof() && input.peek(len) !== end) {
            input.next()
        }
        while (!input.eof() && len) {
            input.next()
            len--
        }
    }
    function eof() { return peek() === null }
    function peek() { return current || (current = nextToken()) }
    function next() {
        let token = current

        current = null
        return token || nextToken()
    }
}


/*
 * InputStream
 * 
 * peek/get next char from input
 * track line/col number  for error reporting
 *
 * @param str string to wrap
 * @returns stream
 *
 */
function InputStream(str) {
    let pos = 0
    let line = 1
    let col = 0

    return {
        next: next,
        peek: peek,
        eof: eof,
        getLine: function() { return line; },
        getCol: function() { return col; }
    }

    function peek(len) {
        return len == null ? str.charAt(pos) : str.substr(pos, len)
    }
    function eof() {
        return peek() === ''
    }
    function next() {
        let ch

        ch = str.charAt(pos++)
        if (ch === '\n') {
            line++
            col = 0
        } else {
            col++
        }
    return ch
    }
}
