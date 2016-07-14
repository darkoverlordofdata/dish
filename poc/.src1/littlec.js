var fs = require('fs')

const NUM_FUNC        = 100
const NUM_GLOBAL_VARS = 100
const NUM_LOCAL_VARS  = 200
const ID_LEN          = 31
const FUNC_CALLS      = 31
const PROG_SIZE       = 10000
const FOR_NEST        = 31
const ENDLINE         = '\n'
const ENDFILE         = '\0'

const DELIMITER = 0 
const IDENTIFIER = 1 
const NUMBER = 2 
const KEYWORD = 3 
const TEMP = 4
const STRING = 5 
const BLOCK = 6

var token_type$ = [
  'DELIMITER',
  'IDENTIFIER',
  'NUMBER',
  'KEYWORD',
  'TEMP',
  'STRING',
  'BLOCK'
]

const ARG = 0 
const CHAR = 1 
const INT = 2 
const IF = 3 
const ELSE = 4 
const FOR = 5 
const DO = 6 
const WHILE = 7 
const SWITCH = 8
const RETURN = 9 
const EOL = 10 
const FINISHED = 11 
const END = 12

var tok$ = [
  'ARG', 'CHAR', 'INT', 'IF', 'ELSE', 'FOR', 'DO', 'WHILE', 'SWITCH', 'RETURN', 'EOL', 'FINISHED', 'EMD'
]

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

const local_var_stack = []

const func_table = []

const call_stack = []

const global_vars = []    /* An array of these structures will hold the info associated with global variables. */

const table = [ /* keyword lookup table */
  {command: "if",     tok: IF}, /* in this table. */
  {command: "else",   tok: ELSE},
  {command: "for",    tok: FOR},
  {command: "do",     tok: DO},
  {command: "while",  tok: WHILE},
  {command: "char",   tok: CHAR},
  {command: "int",    tok: INT},
  {command: "return", tok: RETURN},
  {command: "end",    tok: END}
]

const intern_func = [
  {name: "getche",    fn: call_getche},
  {name: "putch",     fn: call_putch},
  {name: "puts",      fn: call_puts},
  {name: "print",     fn: call_print},
  {name: "getnum",    fn: call_getnum}
]


var p = 0               /* current location in source code */
var buf = ''            /* points to start of program buffer */
var token = ''          /* string representation of token */
var token_type = 0      /* contains type of token */
var tok = 0             /* internal representation of token */
var ret_value = 0       /* function return value */
var functos = 0         /* index to top of function call stack */
var lvartos = 0         /* index into local variable stack */
var scope = 0


function main(argc, argv) {
  console.log("** LittleC **\n")
  if (argc!==3) {
    console.log("Usage: littlec <filename>\n")
    process.exit(0)
  }


  /* load the program to execute */
  buf = fs.readFileSync(argv[2], 'utf8')
  if (buf === '') exit(1)
  buf += ENDFILE;
  
  /* set program pointer to start of program buffer */
  p = 0
  prescan() /* find the location of all functions
                and global variables in the program */
  lvartos = 0     /* initialize local variable stack index */
  functos = 0     /* initialize the CALL stack index */

  /* setup call to main() */
  p = findFunction("main")  /* find program starting point */
  p-- /* back up to opening ( */
  token = "main"
  console.log(global_vars)
  console.log(func_table)
  call()  /* call main() to start interpreting */
  return 0
}

/* Interpret a single statement or block of code. When
   interpretBlock() returns from its initial call, the final
   brace (or a return) in main() has been encountered.
*/
function interpretBlock() {

  //return
  var block = 0

  do {
    token_type = getToken()

    /* If interpreting single statement, return on
       first semicolon.
     */

    /* see what kind of token is up */
    if (token_type===IDENTIFIER) {
      /* Not a keyword, so process expression. */
        putback()  /* restore token to input stream for
                       further processing by evalExpression() */
        var v = evalExpression(0)  /* process the expression */
        if (token!==';') raise(SEMI_EXPECTED, 'interpretBlock')
    }
    else if (token_type===BLOCK) { /* if block delimiter */
      if (token==='{') /* is a block */
        block = 1 /* interpreting block, not statement */
      else return /* is a }, so return */
    }
    else /* is keyword */
      switch(tok) {
        case CHAR:
        case INT:     /* declare local variables */
          putback()
          declareLocal()
          break
        case RETURN:  /* return from function call */
          functionReturn()
          return
        case IF:      /* process an if statement */
          execIf ()
          break
        case ELSE:    /* process an else statement */
          findEob() /* find end of else block
                         and continue execution */
          break
        case WHILE:   /* process a while loop */
          execWhile()
          break
        case DO:      /* process a do-while loop */
          execDo()
          break
        case FOR:     /* process a for loop */
          execFor ()
          break
        case END:
          exit(0)
      }
  } while (tok !== FINISHED && block);
}


/* Find the location of all functions in the program
   and store global variables. */
function prescan() {
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

/* Return the entry point of the specified function.
   Return NULL if not found.
*/
function findFunction(name) {

  for (var i=0; i<func_table.length; i++)
    if (name === func_table[i].name)
      return func_table[i].loc

  return 0
 }

/* Declare a global variable. */
function declareGlobal() {
  getToken()  /* get type */
  var type = tok /* save var type (int, char) */

  do { /* process comma-separated list */
    getToken()  /* get name */
    global_vars.push({
      type: type,
      name: token,
      value: 0
    })
    getToken()
  } while (token===',')
  if (token!==';') raise(SEMI_EXPECTED, 'declareGlobal')
}

/* Declare a local variable. */
function declareLocal() {
  getToken()  /* get type */
  var type = tok

  do { /* process comma-separated list */
    getToken(); /* get var name */
    pushLocal({
      type: type, 
      name: token, 
      value: 0
    })
    getToken()
  } while(token===',')
  if (token!==';') raise(SEMI_EXPECTED, 'declareGlobal')
}

/* Call a function. */
function call(){

  console.log(token)
  var loc = findFunction(token) /* find entry point of function */
  if (loc===0)
    raise(FUNC_UNDEF, 'declareGlobal') /* function not defined */
  else {
    var lvartemp = lvartos  /* save local var stack index */
    getArgs()  /* get function arguments */
    var temp = p /* save return location */
    pushFunction(lvartemp)  /* save local var stack index */
    p = loc  /* reset prog to start of function */
    getParams() /* load the function's parameters with
                     the values of the arguments */
    interpretBlock() /* interpret the function */
    p = temp /* reset the program pointer */
    lvartos = popFunction() /* reset the local var stack */
  }
}

/* Push the arguments to a function onto the local
   variable stack. */
function getArgs() {
  var temp  = []
  var count = 0
  getToken()
  if (token!=='(') raise(PAREN_EXPECTED, getArgs)

  /* process a comma-separated list of values */
  do {
    temp[count] = evalExpression(0)  /* save temporarily */
    getToken()
    count++
  } while(token===',')
  count--
  /* now, push on local_var_stack in reverse order */
  for (; count>=0; count--) {
    pushLocal({value: temp[count], type: ARG})
  }
}

/* Get function parameters. */
function getParams() {
  var i = lvartos-1
  do { /* process comma-separated list of parameters */
    getToken()
    var param = local_var_stack[i]
    if (token!==')') {
      if (tok!==INT && tok!==CHAR) raise(TYPE_EXPECTED, 'getParams')
      param.type = token_type
      getToken()

      /* link parameter name with argument already on
         local var stack */
      param.name = token
      getToken()
      i--
    }
    else break
  } while (token===',')
  if (token!==')') raise(PAREN_EXPECTED, 'getParams')
}

/* Return from a function. */
function functionReturn() {
  ret_value = evalExpression(0)
}

/* Push a local variable. */
function pushLocal(i) {
  if (lvartos>NUM_LOCAL_VARS)
   raise(TOO_MANY_LVARS, 'pushLocal')

  local_var_stack[lvartos] = i
  lvartos++
}

/* Pop index into local variable stack. */
function popFunction() {
  functos--
  if (functos<0) raise(RET_NOCALL, 'popFunction')
  return (call_stack[functos])
}

/* Push index of local variable stack. */
function pushFunction(i) {
  if (functos>NUM_FUNC)
   raise(NEST_FUNC, 'pushFunction')
  call_stack[functos] = i
  functos++
}

/* Assign a value to a variable. */
function assignVar(name, value) {
  var i = 0

  /* first, see if it's a local variable */
  for (i=lvartos-1; i>=call_stack[functos-1]; i--)  {
    if (local_var_stack[i].name === name) {
      local_var_stack[i].value = value
      return
    }
  }
  if (i < call_stack[functos-1])
  /* if not local, try global var table */
    for (i=0; i<NUM_GLOBAL_VARS; i++)
      if (global_vars[i].name === name) {
        global_vars[i].value = value
        return
      }
  raise(NOT_VAR, 'assignVar') /* variable not found */
}

/* Find the value of a variable. */
function findVar(s) {
  var i = 0

  /* first, see if it's a local variable */
  for (i=lvartos-1; i>=call_stack[functos-1]; i--)
    if (local_var_stack[i].name ==  token)
      return local_var_stack[i].value

  /* otherwise, try global vars */
  for (i=0; i<NUM_GLOBAL_VARS; i++)
    if (global_vars[i].name === s)
      return global_vars[i].value

  raise(NOT_VAR, 'findVar') /* variable not found */
}

/* Determine if an identifier is a variable. Return
   1 if variable is found; 0 otherwise.
*/
function isVar(s) {

  /* first, see if it's a local variable */
  for (var i=lvartos-1; i>=call_stack[functos-1]; i--)
    if (local_var_stack[i].name === token)
      return true

  /* otherwise, try global vars */
  for (var i=0; i<global_vars.length; i++)
    if (global_vars[i].name === s)
      return true

  return false
}

/* Execute an if statement. */
function execIf () {
  var cond = evalExpression(0) /* get left expression */

  if (cond) { /* is true so process target of IF */
    interpretBlock()
  }
  else { /* otherwise skip around IF block and
            process the ELSE, if present */
    findEob() /* find start of next line */
    getToken()

    if (tok!==ELSE) {
      putback()  /* restore token if
                     no ELSE is present */
      return
    }
    interpretBlock()
  }
}

/* Execute a while loop. */
function execWhile() {

  putback()
  var temp = p  /* save location of top of while loop */
  getToken()
  var cond = evalExpression(0)  /* check the conditional expression */
  if (cond) interpretBlock()  /* if true, interpret */
  else {  /* otherwise, skip around loop */
    findEob()
    return
  }
  p = temp  /* loop back to top */
}

/*Execute a do loop. */
function execDo() {
  putback()
  var temp = p  /* save location of top of do loop */

  getToken() /* get start of loop */
  interpretBlock() /* interpret loop */
  getToken()
  if (tok!==WHILE) raise(WHILE_EXPECTED, 'execDo')
  var cond = evalExpression(0) /* check the loop condition */
  if (cond) p = temp /* if true loop; otherwise,
                           continue on */
}

/* Find the end of a block. */
function findEob() {

  getToken()
  var brace = 1
  do {
    getToken()
    if (token==='{') brace++
    else if (token==='}') brace--
  } while(brace)
}

/* Execute a for loop. */
function execFor () {
  getToken()
  var cond = evalExpression(0)  /* initialization expression */
  if (token!==';') raise(SEMI_EXPECTED, 'execFor')
  p++ /* get past the ; */
  var temp = p
  for (;;) {
    cond = evalExpression(0)  /* check the condition */
    if (token!==';') raise(SEMI_EXPECTED, 'execFor')
    p++ /* get past the ; */
    var temp2 = p

    /* find the start of the for block */
    var brace = 1
    while(brace) {
      getToken()
      if (token==='(') brace++;
      if (token===')') brace--;
    }

    if (cond) interpretBlock()  /* if true, interpret */
    else {  /* otherwise, skip around loop */
      findEob()
      return
    }
    p = temp2
    cond = evalExpression(0) /* do the increment */
    p = temp  /* loop back to top */
  }
}

/* Entry point into  */
function evalExpression(value) {
  getToken()
  if (!token) {
    raise(NO_EXP, 'evalExpression')
    return
  }
  if (token===';') {
    return 0
  }
  value = evalExpression0(0)
  putback() /* return last token read to input stream */
  return value
}

/* Process an assignment expression */
function evalExpression0(value) {
  var temp = ""  /* holds name of var receiving
                         the assignment */
  var temp_tok = 0

  if (token_type === IDENTIFIER) {
    if (isVar(token)) {  /* if a var, see if assignment */
      temp = token
      temp_tok = token_type
      getToken()
      if (token==='=') {  /* is an assignment */
        getToken()
        value = evalExpression0(value)  /* get value to assign */
        assignVar(temp, value)  /* assign the value */
        return value
      }
      else {  /* not an assignment */
        putback()  /* restore original token */
        token = temp
        token_type = temp_tok;
      }
    }
  }
  return evalExpression1(value)
}

/* Process relational operators. */
function evalExpression1(value) {
  var partial_value = 0
  var op = ''
  var relops = [
    LT, LE, GT, GE, EQ, NE
  ]

  value = evalExpression2(value)
  op = token
  if (relops.indexOf(op) !== -1) {
    getToken()
    partial_value = evalExpression2(partial_value)
    switch(op) {  /* perform the relational operation */
      case LT:
        value = value < partial_value
        break
      case LE:
        value = value <= partial_value
        break
      case GT:
        value = value > partial_value
        break
      case GE:
        value = value >= partial_value
        break
      case EQ:
        value = value === partial_value
        break
      case NE:
        value = value !== partial_value
        break
    }
  }
  return value
}

/*  Add or subtract two terms. */
function evalExpression2(value) {
  var  op = ''
  var partial_value = 0

  value = evalExpression3(value)
  while((op = token) === '+' || op === '-') {
    getToken()
    partial_value = evalExpression3(partial_value)
    switch(op) {  /* add or subtract */
      case '-':
        value = value - partial_value
        break
      case '+':
        value = value + partial_value
        break
    }
  }
  return value
}

/* Multiply or divide two factors. */
function evalExpression3(value) {
  var  op = ''
  var partial_value = 0

  value = evalExpression4(value)
  while((op = token) === '*' || op === '/' || op === '%') {
    getToken()
    partial_value = evalExpression4(partial_value)
    switch(op) { /* mul, div, or modulus */
      case '*':
        value = value * partial_value
        break
      case '/':
        value = (value) / partial_value
        break
      case '%':
        t = (value) / partial_value
        value = value-(t * partial_value)
        break
    }
  }
  return value
}

/* Is a unary + or -. */
function evalExpression4(value) {
  var  op = ''

  if (token==='+' || token==='-') {
    op = token
    getToken()
  }
  value = evalExpression5(value)
  if (op)
    if (op==='-') value = -(value)
  return value
}

/* Process parenthesized expression. */
function evalExpression5(value)
{
  if ((token === '(')) {
    getToken()
    value = evalExpression0(value)   /* get subexpression */
    if (token !== ')') raise(PAREN_EXPECTED, 'evalExpression5')
    getToken()
  }
  else
    value = atom(value)
  return value
}

/* Find value of number, variable, or function. */
function atom(value) {
  var i = 0

  switch(token_type) {
  case IDENTIFIER:
    i = internalFunction(token);
    if (i!== -1) {  /* call "standard library" function */
      value = intern_func[i].fn()
    }
    else
    if (findFunction(token)) {  /* call user-defined function */
      call()
      value = ret_value
    }
    else  value = findVar(token)  /* get var's value */
    getToken()
    return value
  case NUMBER: /* is numeric constant */
    value = parseFloat(token)
    getToken()
    return value
  case DELIMITER: /* see if character constant */
    if (token==='\'') {
      value = buf[p]
      p++
      if (buf[p]!=='\'') raise(QUOTE_EXPECTED, 'atom')
      p++
      getToken()
      return value
    }
    if (token===')') return value/* process empty expression */
    else raise(SYNTAX, 'atom')  /* syntax error */
  default:
    raise(SYNTAX, 'atom') /* syntax error */
  }
}

/* Display an error message. */
function raise(error, from) {
  var e, temp
  var linecount = 0
  var i

  var err_message = [
    "syntax error",
    "unbalanced parentheses",
    "no expression present",
    "equals sign expected",
    "not a variable",
    "parameter error",
    "semicolon expected",
    "unbalanced braces",
    "function undefined",
    "type specifier expected",
    "too many nested function calls",
    "return without call",
    "parentheses expected",
    "while expected",
    "closing quote expected",
    "not a string",
    "too many local variables"
  ]

  e = p
  while (e !== p) {  /* find line number of error */
    e++
    if(buf[e] === ENDLINE) {
      linecount++
    }
  }
  console.log(err_message[error], "in line", linecount, 'from', from);
  console.log(buf)
  // temp = e;
  // for(i=0; i<20 && e>p && buf[e]!==ENDLINE; i++, e--);
  //   console.log(buf.substr(e))

  process.exit(0)
  
}

function getToken() {
  var r= getToken1();
  console.log('getToken', token, token_type$[token_type], tok, tok$[tok])
  return r
}
/* Get a token. */
function getToken1() {

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
    console.log('lookup', token, tok)
    if (tok) token_type = KEYWORD /* is a keyword */
    else token_type = IDENTIFIER
  }
  return token_type
}

/* Return a token to input stream. */
function putback() {
  p -= token.length
}

/* Look up a token's internal representation in the
   token table.
*/
function lookUp(s) {

  for (var item in table) {
    if (table[item].command === s) return table[item].tok
  }
  return -1;
}

/* Return index of internal library function or -1 if
   not found.
*/
function internalFunction(s) {

  for (var i=0; i<intern_func.length; i++) {
    if (intern_func[i].name === s) return i
  }
  return -1
}

/* Return true if c is a delimiter. */
function isdelim(c) {
  if (" !;,+-<>'/*%^=()".indexOf(c) !== -1 || c===9 || c===ENDLINE || c===0) return true
  return false
}

/* Return 1 if c is space or tab. */
function iswhite(c) {
  if (c===' ' || c==='\t' || c == ENDLINE) return true
  else return false
}

function isdigit(c) {
  return '0123456789'.indexOf(c) !== -1
}

function isalpha(c) {
  return 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'.indexOf(c) !== -1
}

function call_getche(){

}

function call_putch(){

}

function call_puts(s){
  console.log(s);
}

function call_print(){

}

function call_getnum(){

}

main(process.argv.length, process.argv)