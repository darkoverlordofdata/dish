###
 * Lexer
 * 
 * @param source text
 * @returns lexer interface to the source
 * 
###
'use strict'

module.exports = (source) ->

  input = InputStream(source)
  current = null

  isWhitespace  = (ch) -> /\s/.test(ch)
  isDigit       = (ch) -> /[0-9]/i.test(ch)
  isIdStart     = (ch) -> /[a-z_]/i.test(ch)
  isId          = (ch) -> /[a-z_0-9]/i.test(ch)
  isPunc        = (ch) -> /[,;(){}[\]:]/.test(ch)
  isOpChar      = (ch) -> /[+-*/%=&|<>!]/.test(ch)
  isKeyword     = (wd) -> /import|export|return|int|double|float|if|else|true|false|while|do|for/.test(wd)

  class Token 
    constructor: (@type, @value) ->

  ###
   * next Token
   *
   * @returns the next new token from the source
  ###
  nextToken = () ->
      readWhile(isWhitespace)
      if input.eof() then return null
      if input.peek2() is "//"
          skipToNewLine()
          return nextToken()

      ch = input.peek()
      if ch is '"' then return new Token('str', readEscaped('"'))
      if isDigit(ch) then return new Token('num', readNumber())
      if isIdStart(ch) then return do (id = readWhile(isId)) -> 
        new Token((if isKeyword(id) then 'kw' else 'var'), id)
      if isPunc(ch) then return new Token('punc', input.next())
      if isOpChar(ch) then return new Token('op', readWhile(isOpChar))

      input.raise "Can't handle character: #{ch}"


  ###
   * read Number
   *
   * @returns the next number from the source stream
  ###
  readNumber = ->
    has_dot = false
    parseFloat(readWhile((ch) ->
      if ch is '.'
        if has_dot then return false
        has_dot = true
        return true
      isDigit ch
    ))

  ###
   * read Escaped
   *
   * @returns the next escaped string until end
  ###
  readEscaped = (end) ->
    escaped = false
    str = ''
    input.next()
    while not input.eof()
      ch = input.next()
      if escaped
        str += ch
        escaped = false
      else if ch is '\\'
        escaped = true
      else if ch is end
        break
      else
        str += ch
    str

  ###
   * read While
   *
   * @param predicate function to call to test
   * @returns the next token until predicate
  ###
  readWhile = (predicate) ->
    str = ''
    while !input.eof() and predicate(input.peek())
      str += input.next()
    str

  ###
   * skip to new line
   *
   * skip to the end of the line
  ###
  skipToNewLine = ->
    readWhile (ch) -> ch != '\n'
    input.next()
    return

  eof = -> peek() is null
  peek = -> current or (current = nextToken())
  next = ->
    token = current
    current = null
    token or nextToken()

  return { 
    next: next
    peek: peek
    eof: eof
    raise: input.raise
  }


###
 * InputStream
 * 
 * peek/get next char from input
 * track line number for error reporting
 *
 * @param str string to wrap
 * @returns stream
 * 
###
InputStream = (str) ->
  pos = 0
  line = 1
  col = 0

  peek =  -> str.charAt(pos)
  peek2 = -> str.substr(pos, 2)
  eof =   -> peek() is ''
  next =  ->
    ch = str.charAt(pos++)
    if ch is '\n' then line++; col = 0 else col++
    ch

  raise = (msg) -> throw new Error(msg + ' (' + line + ':' + col + ')')

  return { 
    next: next
    peek: peek
    peek2: peek2
    eof: eof
    raise: raise
  }
