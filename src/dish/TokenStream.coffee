###
 * TokenStream.js
 * 
###
"use strict"

TokenStream = module.exports = (input) ->
    current = null
    keywords = " import if then else true false "

    is_keyword      = (x) -> keywords.indexOf(" " + x + " ") >= 0
    is_digit        = (c) -> /[0-9]/i.test(c)
    is_id_start     = (c) -> /[a-zÎ»_]/i.test(c)
    is_id           = (c) -> is_id_start(c) || "?!-<:>=0123456789".indexOf(c) >= 0
    is_op_char      = (c) -> "+-*/%=&|<>!".indexOf(c) >= 0
    is_punc         = (c) -> ",;(){}[]:".indexOf(c) >= 0
    is_whitespace   = (c) -> " \t\n".indexOf(c) >= 0

    read_while = (predicate) ->
        str = ""
        while not(input.eof() and predicate(input.peek()))
            str += input.next()
        str
    
    read_number = () ->
        has_dot = false
        number = read_while (ch) ->
            if ch is "." 
                if has_dot then return false
                has_dot = true
            is_digit(ch)
        return { 
            type: "num"
            value: parseFloat(number) 
        }
    
    read_ident = () ->
        id = read_while(is_id)
        {
            type  : is_keyword(id) ? "kw" : "var"
            value : id
        }
    
    read_escaped = (end) ->
        escaped = false
        str = ""
        input.next()
        while not input.eof() 
            ch = input.next()
            if escaped
                str += ch
                escaped = false
            else if ch is "\\"
                escaped = true
            else if ch is end
                break
            else 
                str += ch
        str
    
    read_strin = () -> { type: "str", value: read_escaped('"') }
    
    skip_comment = () ->
        read_while((ch) -> ch isnt "\n" )
        input.next()
    
    read_next = () ->
        read_while(is_whitespace)
        if input.eof() then return null
        if input.peek2() is "//"
            skip_comment()
            return read_next()

        ch = input.peek()
        if ch is "#"
            skip_comment()
            return read_next()

        if ch is '"' then return read_string()
        if is_digit(ch) then return read_number()
        if is_id_start(ch) then return read_ident()
        if is_punc(ch) then return {
            type  : "punc",
            value : input.next()
        }
        if is_op_char(ch) then  return {
            type  : "op",
            value : read_while(is_op_char)
        }
        input.croak("Can't handle character: " + ch)
    
    next = () ->
        tok = current
        current = null
        tok || read_next()
    
    peek    = () -> current || (current = read_next())
    eof     = () -> peek() is null
    
    {
        next  : next
        peek  : peek
        eof   : eof
        croak : input.croak
    }
