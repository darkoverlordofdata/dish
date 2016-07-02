###
 * InputStream
 *
 * @param str string to wrap
 * @returns stream wrappper around the input string
 * 
###
"use strict"

InputStream = module.exports = (str) ->
    
    pos = 0
    line = 1
    col = 0

    next = ->
        ch = str.charAt(pos++)
        if ch is "\n" then line++; col = 0 else col++
        ch
    
    peek = -> str.charAt(pos)
    
    peek2 = -> str.substr(pos,2)

    eof = -> peek() == ""
    
    croak = (msg) -> throw new Error(msg + " (" + line + ":" + col + ")")

    {
        next  : next
        peek  : peek
        peek2 : peek2
        eof   : eof
        croak : croak
    }

