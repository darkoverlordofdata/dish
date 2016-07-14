###
 * parse
 * 
 * @param ast node tree
 * @returns javascript source
 * 
###
'use strict'

module.exports = (ast) ->

  FALSE = type: 'bool', value: false
  TRUE = type: 'bool', value: true
  uniqueId = 0

  getUniqueVar = -> "#{__$tmp+(uniqueId++)}"

  ###
   *
   * recursively convert each ast node to javascript
   *
  ###
  js = (ast) -> switch (ast.type) 
      when "num"    then js_atom   (ast)
      when "bool"   then js_atom   (ast)
      when "str"    then js_atom   (ast)
      when "not"    then js_not    (ast)
      when "binary" then js_binary (ast)
      when "assign" then js_assign (ast)
      when "if"     then js_if     (ast)
      when "prog"   then js_prog   (ast)
      when "call"   then js_call   (ast)
      when 'import' then js_import (ast)
      when 'int'    then js_int    (ast)
      when 'float'  then js_float  (ast)
      when 'double' then js_double (ast)
      else throw new Error("CodeGen: unknown ast type: " + JSON.stringify(ast))

  ###
   *
   * each node type
   *
  ###
  js_import = (ast) -> "var #{ast.value} = stdlib.#{ast.value}"
  js_int    = (ast) -> "var #{ast.value} = 0|0"
  js_float  = (ast) -> "var #{ast.value} = fround(0)" 
  js_double = (ast) -> "var #{ast.value} = +0"
  js_atom   = (ast) -> JSON.stringify(ast.value)
  js_not    = (ast) -> if is_bool(ast.body) then "!#{js(ast.body)}" else "(#{js(ast.body)} === false)"
  js_assign = (ast) -> js_binary(ast)
  js_prog   = (ast) -> ast.prog.map(js).join(';')
  js_call   = (ast) -> "#{js(ast.func)}(#{ast.args.map(js).join(', ')})"

  js_binary = (ast) ->
    left = js(ast.left)
    right = js(ast.right)
    switch ast.operator

      when '&&'
        break if is_bool(left)
        return "((#{left} !== false) && #{right})"

      when "||"
        break if is_bool(left)
        tmp = getUniqueVar()
        return "var #{tmp};((#{tmp} = #{left}) !== false ? #{tmp} : #{right})"

    "(#{left}#{ast.operator}#{right})"

  is_bool = (ast) ->
    switch ast.type
      when 'bool', 'not'
        return true
      when 'if'
        return is_bool(ast.then) or ast.else and is_bool(ast.else)
      when 'binary'
        if ',<,<=,==,!=,>=,>,'.indexOf(',' + ast.operator + ',') >= 0
          return true
        if ast.operator == '&&' or ast.operator == '||'
          return is_bool(ast.left) and is_bool(ast.right)
    false

  js_if = (ast) ->
    cond = js(ast.cond)
    cond += " !== false" if !is_bool(ast.cond)
    "(#{cond} ? #{js(ast.then)} : #{js(ast.else or FALSE)})"

  js ast
