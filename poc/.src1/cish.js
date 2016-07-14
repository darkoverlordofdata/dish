const DELIMITER = 0 
const IDENTIFIER = 1 
const NUMBER = 2 
const KEYWORD = 3 
const TEMP = 4
const STRING = 5 
const BLOCK = 6

const ARG = 0 
const INT = 1 
const FLOAT = 2
const DOUBLE = 3 
const CHAR = 4
const IF = 5
const ELSE = 6 
const FOR = 7
const DO = 8
const WHILE = 9 
const SWITCH = 10
const RETURN = 11
const BREAK = 12
const CONTINUE = 13 
const EOL = 14
const FINISHED = 53 
const END = 16

const LT = 1 
const LE = 2 
const GT = 3 
const GE = 4 
const EQ = 5 
const NE = 6

const SYNTAX = 0 
const UNBAL_PARENS = 1 
const NO_EXP = 2 
const EQUALS_EXPECTED = 3
const NOT_VAR = 4 
const PARAM_ERR = 5 
const SEMI_EXPECTED = 6
const UNBAL_BRACES = 7 
const FUNC_UNDEF = 8 
const TYPE_EXPECTED = 9
const NEST_FUNC = 10 
const RET_NOCALL = 11 
const PAREN_EXPECTED = 12
const WHILE_EXPECTED = 13 
const QUOTE_EXPECTED = 14 
const NOT_TEMP = 14
const TOO_MANY_LVARS = 15

const table = [ /* keyword lookup table */
  {command: "if",       tok: IF}, /* in this table. */
  {command: "else",     tok: ELSE},
  {command: "for",      tok: FOR},
  {command: "do",       tok: DO},
  {command: "while",    tok: WHILE},
  {command: "char",     tok: CHAR},
  {command: "int",      tok: INT},
  {command: "double",   tok: DOUBLE},
  {command: "float",    tok: FLOAT},
  {command: "return",   tok: RETURN},
  {command: "break",    tok: BREAK},
  {command: "continue", tok: CONTINUE},
]

var p = 0               /* current location in source code */
var buf = ''            /* points to start of program buffer */
var token = ''          /* string representation of token */
var token_type = 0      /* contains type of token */
var tok = 0             /* internal representation of token */
var sym = []
var scope = 'global'

function main(argc, argv) {
  console.log("** cish **\n")
  if (argc!==3) {
    console.log("Usage: cish <filename>\n")
    exit(1)
  }


  /* load the program to execute */
  buf = fs.readFileSync(argv[2], 'utf8')
  if (buf === '') exit(1)
  buf += ENDFILE;
  
  /* set program pointer to start of program buffer */
  p = 0
  scan() /* find all functions & vars */
  p = 0
  output()

}

function scan() {
  var brace = 0  /* When 0, this var tells us that
                     current source position is outside
                     of any function. */

  var save = p
  do {
    while(brace) {  /* bypass code inside functions */
      getToken()
      if (token==='{') brace++
      if (token==='}') brace--
    }
    getToken()

    if (tok===CHAR || tok===INT) { /* is global var */
      putback()
      declareGlobal()
    }
    else if (token_type===IDENTIFIER) {
      var temp = token
      getToken()
      if (token==='(') {  /* must be a function */
        func_table.push({scope: brace, loc:p, name: temp})
        while(buf[p]!==')') p++
        p++
        getToken()
        /* prog points to opening curly brace of function */
      }
      else putback()
    }
    else  {
      if (token==='{') brace++
    }
  } while(tok!==FINISHED)
  p = save

}

function output() {

}


function createFun(name, type, public, args) {
    return { name: name, type: type, public: public, args: args, vars: vars }
}

function createArg(scope, type, name) {
    return { scope: scope, type: type, name: name }
}

function createVar(scope, type, name, value) {
    return { scope: scope, type: type, name: name, value: value }
}

/* Get a token. */
function getToken() {

  var temp

  token_type = 0
  tok = 0;
  token = ''

 /* skip over white space */
  while(iswhite(buf[p])) ++p

  /* if (p==='\r') { */
  if (buf[p] === ENDLINE) {
    p++
    p++
    /* skip over white space */
    while(iswhite(buf[p])) ++p
  }

  if (buf[p] === ENDFILE) { /* end of file */
    token = ''
    tok = FINISHED
    return (token_type = DELIMITER)
  }

  if (buf[p] === '{' || buf[p] === '}') { /* block delimiters */
    token = buf[p]
    p++
    return (token_type = BLOCK)
  }

  /* look for comments */
  if (buf[p]==='/')
    if (buf[p+1]==='*') { /* is a comment */
      p++
      p++
      do { /* find end of comment */
        while(buf[p]!=='*') p++
        p++
      } while (buf[p]!=='/')
      p++
    }

  if ("!<>=".indexOf(buf[p])) { /* is or might be
                              a relation operator */
    switch(buf[p]) {
      case '=': 
        if (buf[p+1]==='=') {
          p++ 
          p++
          token = String.fromCharCode(EQ)+String.fromCharCode(EQ)
       }
       break
      case '!': 
        if (buf[p+1]==='=') {
          p++ 
          p++
          token = String.fromCharCode(NE)+String.fromCharCode(NE)
        }
        break
      case '<': 
        if (buf[p+1]==='=') {
          p++
          p++
          token = String.fromCharCode(LE)+String.fromCharCode(LE)
        }
        else {
          p++
          token = String.fromCharCode(LT)
        }
        break
      case '>': 
        if (buf[p+1]==='=') {
          p++
          p++
          token = String.fromCharCode(GE)+String.fromCharCode(GE)
        }
        else {
          p++
          token = String.fromCharCode(LT)
        }
        break
    }
    if (token) return (token_type = DELIMITER)
  }

  if ("+-*^/%=;(),'".indexOf(buf[p]) !== -1){ /* delimiter */
    token = buf[p]
    p++ /* advance to next position */
    return (token_type = DELIMITER)
  }

  if (buf[p]==='"') { /* quoted string */
    p++
    while (buf[p]!=='"' && buf[p]!==ENDLINE) {
      token += buf[p]
      p++
    }
    if (buf[p]===ENDLINE) raise(SYNTAX, 'getToken');
    p++
    return (token_type = STRING)
  }

  if (isdigit(buf[p])) { /* number */
    while(!isdelim(buf[p])) {
      token += buf[p]
      p++
    }
    return (token_type = NUMBER)
  }

  if (isalpha(buf[p])) { /* var or command */
    while(!isdelim(buf[p])) {
      token += buf[p]
      p++
    }
    token_type = TEMP
  }


  /* see if a string is a command or a variable */
  if (token_type===TEMP) {
    tok = lookUp(token) /* convert to internal rep */
    if (tok) token_type = KEYWORD /* is a keyword */
    else token_type = IDENTIFIER
  }
  return token_type
}



main(process.argv.length, process.argv)