'use strict'

class Token {
  constructor(type, value, line, col) {
    this.type = type
    this.value = value
    this.line = line
    this.col = col
  }
}

Token[Token['Keyword']    = 1] = 'Keyword'
Token[Token['Delimiter']  = 2] = 'Delimiter'
Token[Token['Identifier'] = 3] = 'Identifier'
Token[Token['String']     = 4] = 'String'
Token[Token['Number']     = 5] = 'Number'
Token[Token['Variable']   = 6] = 'Variable'


module.exports = Token