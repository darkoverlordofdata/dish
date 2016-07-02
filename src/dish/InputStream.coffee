###*
# InputStream.js
# 
###
'use strict'

module.exports = (input) ->
  pos = 0
  line = 1
  col = 0

  next = ->
    ch = input.charAt(pos++)
    if ch == '\n' then line++; col = 0 else col++
    ch

  peek = ->
    input.charAt pos

  peek2 = ->
    input.substr pos, 2

  eof = ->
    peek() == ''

  croak = (msg) ->
    throw new Error(msg + ' (' + line + ':' + col + ')')
    return

  {
    next: next
    peek: peek
    peek2: peek2
    eof: eof
    croak: croak
  }
