###
 * TokenStream
 * 
 * @param input input stream
 * @returns token stream wrappper around the input stream
 * 
###

'use strict'

module.exports = (input) ->
  current = null
  keywords = ' import if then else true false '

  is_keyword    = (x) -> keywords.indexOf(' ' + x + ' ') >= 0
  is_digit      = (ch) -> /[0-9]/i.test ch
  is_id_start   = (ch) -> /[a-zÎ»_]/i.test ch
  is_id         = (ch) -> is_id_start(ch) or '?!-<:>=0123456789'.indexOf(ch) >= 0
  is_op_char    = (ch) -> '+-*/%=&|<>!'.indexOf(ch) >= 0
  is_punc       = (ch) -> ',;(){}[]:'.indexOf(ch) >= 0
  is_whitespace = (ch) -> ' \u0009\n'.indexOf(ch) >= 0

  read_while = (predicate) ->
    str = ''
    while !input.eof() and predicate(input.peek())
      str += input.next()
    str

  read_number = ->
    has_dot = false
    number = read_while((ch) ->
      if ch == '.'
        if has_dot
          return false
        has_dot = true
        return true
      is_digit ch
    )
    {
      type: 'num'
      value: parseFloat(number)
    }

  read_ident = ->
    id = read_while(is_id)
    {
      type: if is_keyword(id) then 'kw' else 'var'
      value: id
    }

  read_escaped = (end) ->
    escaped = false
    str = ''
    input.next()
    while !input.eof()
      ch = input.next()
      if escaped
        str += ch
        escaped = false
      else if ch == '\\'
        escaped = true
      else if ch == end
        break
      else
        str += ch
    str

  read_string = ->
    {
      type: 'str'
      value: read_escaped('"')
    }

  skip_comment = ->
    read_while (ch) ->
      ch != '\n'
    input.next()
    return

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

  peek = ->
    current or (current = read_next())

  next = ->
    tok = current
    current = null
    tok or read_next()

  eof = ->
    peek() == null

  {
    next: next
    peek: peek
    eof: eof
    croak: input.croak
  }
