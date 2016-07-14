###
 * parse
 * 
 * @param input token stream
 * @returns ast 
 * 
###
"use strict"

module.exports = (input) ->
    PRECEDENCE = 
        "=": 1
        "||": 2
        "&&": 3
        "<": 7, ">": 7, "<=": 7, ">=": 7, "==": 7, "!=": 7
        "+": 10, "-": 10
        "*": 20, "/": 20, "%": 20

    isPunc = (ch) ->
        tok = input.peek()
        tok and tok.type is "punc" and (not ch or tok.value is ch) 

    isKw = (kw) ->
        tok = input.peek()
        tok and tok.type is "kw" and (not kw or tok.value is kw)

    isOp = (op) ->
        tok = input.peek()
        tok and tok.type is "op" and (not op or tok.value is op)

    skipPunc = (ch) ->
        if isPunc(ch) then input.next()
        else input.raise("Expecting punctuation: \"#{ch}\"")

    skipKw = (kw) ->
        if isKw(kw) then input.next()
        else input.raise("Expecting keyword: \"#{kw}\"")

    skipOp = (op) ->
        if isOp(op) then input.next()
        else input.raise("Expecting operator: \"#{op}\"")

    unexpected = () ->
        input.raise("Unexpected token: " + JSON.stringify(input.peek()))

    maybeBinary = (left, my_prec) ->
        tok = isOp()
        if (tok) 
            his_prec = PRECEDENCE[tok.value]
            if his_prec > my_prec
                input.next()
                return maybeBinary({
                    type     : if tok.value is "=" then "assign" else "binary"
                    operator : tok.value
                    left     : left
                    right    : maybeBinary(parse_atom(), his_prec)
                }, my_prec)
        left

    parseExpression = () -> 
        maybeCall -> maybeBinary(parse_atom(), 0)

    delimited = (start, stop, separator, parser) ->
        args = []
        first = true
        skipPunc(start)
        while !input.eof() 
            if isPunc(stop) then break
            if first then first = false else skipPunc(separator)
            if isPunc(stop) then break
            args.push(parser())
        
        skipPunc(stop)
        args

    parse_call = (func) ->
        {
            type: "call"
            func: func
            args: delimited("(", ")", ",", parseExpression)
        }

    parse_varname = () ->
        name = input.next()
        if name.type isnt "var" then input.raise("Expecting variable name")
        name.value

    parse_vardef = () ->
        def = null
        name = parse_varname()
        if isOp("=")
            input.next()
            def = parseExpression()
        { 
            name: name
            def: def 
        }


    parse_if = () ->
        skipKw("if")
        cond = parseExpression()
        if !isPunc("{") then skipKw("then")
        block = parseExpression()
        ret = {
            type: "if"
            cond: cond
            then: block
        }
        if isKw("else")
            input.next()
            ret.else = parseExpression()
        
        ret

    parse_import = () ->
        skipKw("import")
        name = input.next()
        {
            type: 'import'
            value: name.value
        }

    parse_export = () ->

    parse_return = () ->

    parse_int = () ->
        skipKw("int")
        name = input.next()
        console.log("INT", input.peek())
        {
            type: 'int'
            value: name.value
        }

    parse_double = () ->
        skipKw("double")
        name = input.next()
        if isPunc('(')
            console.log('START FUNCTION DEF')
            params = delimited("(", ")", "", parseExpression) 
            block = delimited("{", "}", "", parseExpression)
            {
                type: 'double'
                value: name.value
            }
        else
            console.log("DOUBLE", input.peek())
            {
                type: 'double'
                value: name.value
            }

    parse_float = () ->
        skipKw("float")
        name = input.next()
        console.log("FLOAT", input.peek())
        {
            type: 'float'
            value: name.value
        }

    parse_while = () ->

    parse_for = () ->

    parse_break = () ->

    parse_continue = () ->


    parse_bool = () ->
        {
            type  : "bool"
            value : input.next().value is "true"
        }


    maybeCall = (expr) ->
        expr = expr()
        if isPunc("(") then parse_call(expr) else expr

    parse_atom = () ->
        return maybeCall () ->
            if isPunc("(")
                input.next()
                exp = parseExpression()
                skipPunc(")")
                return exp
            
            if isPunc("{") then return parse_prog()
            if isOp("!") 
                input.next()
                return {
                    type: "not"
                    body: parseExpression()
                }
            ##
            ## KeyWords
            ##
            ##=================================
            if isKw("if") then return parse_if()
            if isKw("true") or isKw("false") then return parse_bool()
            if isKw('import') then return parse_import()
            if isKw('export') then return parse_export()
            if isKw('return') then return parse_return()
            if isKw('int') then return parse_int()
            if isKw('double') then return parse_double()
            if isKw('float') then return parse_float()
            if isKw('while') then return parse_while()
            if isKw('for') then return parse_for()
            if isKw('break') then return parse_break()
            if isKw('continue') then return parse_continue()
            ##=================================
            unexpected()
        

    parse_prog = () ->
        prog = delimited("{", "}", "", parseExpression)
        if prog.length is 0 then return FALSE
        if prog.length is 1 then return prog[0]
        { 
            type: "prog"
            prog: prog 
        }

    parse_toplevel = () ->
        prog = []
        while !input.eof()
            prog.push(parseExpression())
            if (!input.eof()) then skipPunc("")
        
        { 
            type: "prog"
            prog: prog 
        }

    return {
        parse: parse_toplevel
    }
