###
 * parse.js
 * 
###
"use strict"

parse = module.exports = (input) ->
    PRECEDENCE = 
        "=": 1
        "||": 2
        "&&": 3
        "<": 7, ">": 7, "<=": 7, ">=": 7, "==": 7, "!=": 7
        "+": 10, "-": 10
        "*": 20, "/": 20, "%": 20


    is_punc = (ch) ->
        tok = input.peek()
        tok && tok.type is "punc" && (!ch || tok.value is ch) && tok

    is_kw = (kw) ->
        tok = input.peek()
        tok && tok.type is "kw" && (!kw || tok.value is kw) && tok

    is_op = (op) ->
        tok = input.peek()
        tok && tok.type is "op" && (!op || tok.value is op) && tok

    skip_punc = (ch) ->
        if (is_punc(ch)) input.next()
        else input.croak("Expecting punctuation: \"" + ch + "\"")

    skip_kw = (kw) ->
        if (is_kw(kw)) input.next()
        else input.croak("Expecting keyword: \"" + kw + "\"")

    skip_op = (op) ->
        if (is_op(op)) input.next()
        else input.croak("Expecting operator: \"" + op + "\"")

    unexpected = () ->
        input.croak("Unexpected token: " + JSON.stringify(input.peek()))

    maybe_binary = (left, my_prec) ->
        tok = is_op()
        if (tok) 
            his_prec = PRECEDENCE[tok.value]
            if his_prec > my_prec
                input.next()
                return maybe_binary({
                    type     : tok.value is "=" ? "assign" : "binary"
                    operator : tok.value
                    left     : left
                    right    : maybe_binary(parse_atom(), his_prec)
                }, my_prec)
            
        
        left

    delimited = (start, stop, separator, parser) ->
        a = []
        first = true
        skip_punc(start)
        while !input.eof() 
            if is_punc(stop) then break
            if first then first = false else skip_punc(separator)
            if is_punc(stop) then break
            a.push(parser())
        
        skip_punc(stop)
        a

    parse_call = (func) ->
        {
            type: "call"
            func: func
            args: delimited("(", ")", ",", parse_expression)
        }

    parse_varname = () ->
        name = input.next()
        if (name.type isnt "var") then input.croak("Expecting variable name")
        name.value

    parse_vardef = () ->
        def = null
        name = parse_varname()
        if is_op("=")
            input.next()
            def = parse_expression()
        { 
            name: name
            def: def 
        }


    parse_if = () ->
        skip_kw("if")
        cond = parse_expression()
        if (!is_punc("{")) then skip_kw("then")
        _then = parse_expression()
        ret = {
            type: "if"
            cond: cond
            then: _then
        }
        if is_kw("else")
            input.next()
            ret.else = parse_expression()
        
        ret

    parse_import = () ->
        skip_kw("import")
        name = input.next()
        {
            type: 'import'
            value: name.value
        }

    parse_export = () ->

    parse_return = () ->

    parse_int = () ->

    parse_double = () ->

    parse_float = () ->

    parse_while = () ->

    parse_for = () ->

    parse_break = () ->

    parse_continue = () ->


    parse_bool = () ->
        {
            type  : "bool"
            value : input.next().value is "true"
        }


    maybe_call = (expr) ->
        expr = expr()
        if is_punc("(") then parse_call(expr) else expr

    parse_atom = () ->
        return maybe_call () ->
            if is_punc("(")
                input.next()
                exp = parse_expression()
                skip_punc(")")
                return exp
            
            if (is_punc("{")) then return parse_prog()
            if (is_op("!")) 
                input.next()
                return {
                    type: "not"
                    body: parse_expression()
                }
            
            if (is_kw("if")) then return parse_if()
            if (is_kw("true") || is_kw("false")) then return parse_bool()
            ##=================================
            if (is_kw('import')) then return parse_import()
            if (is_kw('export')) then return parse_export()
            if (is_kw('return')) then return parse_return()
            if (is_kw('int')) then return parse_int()
            if (is_kw('double')) then return parse_double()
            if (is_kw('float')) then return parse_float()
            if (is_kw('while')) then return parse_while()
            if (is_kw('for')) then return parse_for()
            if (is_kw('break')) then return parse_break()
            if (is_kw('continue')) then return parse_continue()
            ##=================================
            tok = input.next()
            if tok.type is "var" || tok.type is "num" || tok.type is "str"
                return tok
            unexpected()
        

    parse_prog = () ->
        prog = delimited("{", "}", "", parse_expression)
        if (prog.length == 0) then return FALSE
        if (prog.length == 1) then return prog[0]
        { 
            type: "prog"
            prog: prog 
        }

    parse_expression = () ->
        maybe_call -> maybe_binary(parse_atom(), 0)


    parse_toplevel = () ->
        prog = []
        while !input.eof()
            prog.push(parse_expression())
            if (!input.eof()) then skip_punc("")
        
        { 
            type: "prog"
            prog: prog 
        }

    parse_toplevel()
